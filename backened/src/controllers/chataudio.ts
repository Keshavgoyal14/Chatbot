import { Request, Response, NextFunction } from "express";
import fs from "fs";
import axios from "axios";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "../configration/pinecone";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export const uploadAudioOrURL=async (req: Request, res: Response, next: NextFunction) =>{

    try {
        let tempfile='';
        let orignalFilename=''
        let transcript="";
        if(req.file){
            tempfile=req.file.path;
            orignalFilename=req.file.originalname;
            const audioBuffer=fs.readFileSync(tempfile);
//For uploading to AssemblyAI
const baseUrl = "https://api.assemblyai.com";
const headers={
    authorization: process.env.ASSEMBLYAI_API_KEY,
}
const uploadedAudio = await axios.post(`${baseUrl}/v2/upload`,audioBuffer,{headers})
const audioUrl = uploadedAudio.data.upload_url;
const data = {
  audio_url: audioUrl,
  speech_model: "universal",
};
//For creating a transcription
const url = `${baseUrl}/v2/transcript`;
const response = await axios.post(url, data, { headers:{authorization: process.env.ASSEMBLYAI_API_KEY,"content-type":"application/json" }});
const transcriptId = response.data.id;
const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

while (true) {
  const pollingResponse = await axios.get(pollingEndpoint, {
    headers: headers,
  });
  const transcriptionResult = pollingResponse.data;

  if (transcriptionResult.status === "completed") {
    transcript = transcriptionResult.text;
    break;
  } else if (transcriptionResult.status === "error") {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
fs.unlinkSync(tempfile); 

        }
else{
    res.status(400).json({success:false,message:"Please provide an audio file or a valid YouTube URL."});
    return

}
const docs =chunkText(transcript);
const namespace = `audio-${Date.now()}`;
const embeddings= new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
})
const pineconeIndex=pinecone.Index(process.env.PINECONE_INDEX_NAME ||"");
await PineconeStore.fromTexts(docs,[], embeddings, {
    pineconeIndex, namespace })

    res.status(200).json({success:true,namespace:namespace,orignalFilename:orignalFilename});

    } catch (error) {
        console.error("Error in uploading ",error);
        res.status(500).json({success:false,message:"Internal Server Error"})
        
    }
}

export const chatAudio=async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {namespace,query} = req.body;
        if (!namespace || !query) {
            res.status(400).json({ success: false, message: "Namespace and query are required" });
            return;
        }
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace
        });
         const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: "gemini-1.5-flash",
    });
    const retriever=vectorStore.asRetriever({k:5})
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant. Use the following context to answer the user's question."],
      ["user", "Context:\n{context}\n\nQuestion: {input}"],
    ]);
  const combineDocsChain=await createStuffDocumentsChain({llm,prompt});
const chain = await createRetrievalChain({combineDocsChain,retriever});
const response = await chain.invoke({
    input:query,
    chat_history: [],
});
res.status(200).json({success:true,response:response})

    } catch (error) {
        console.error("Error in chat audio:",error);
        res.status(500).json({success:false,message:"Internal Server Error"})
        
    }
}