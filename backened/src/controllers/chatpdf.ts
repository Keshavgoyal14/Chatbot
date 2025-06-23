import { PutObjectCommand,DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response, NextFunction } from 'express';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { s3Client } from '../configration/aws-config';
import fs from 'fs';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import User from '../models/users';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { pinecone } from '../configration/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
         const userId = res.locals.jwtData.id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Restrict free users to 1 PDFs
        if (user.plan === "free" && user.pdfs.length >= 1) {
            res.status(403).json({
                success: false,
                message: "Free plan limit reached. Upgrade to Pro for unlimited PDF uploads."
            });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }
        const filePath = req.file.path;
        const fileBuffer = await fs.promises.readFile(filePath);
        const s3key = `chatpdf/${Date.now()}_${req.file.filename}`;
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME || "",
            Key: s3key,
            Body: fileBuffer,
            ContentType: req.file.mimetype,
        }))
        const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazon.com/${s3key}`;
        await User.findByIdAndUpdate(userId,{
            $push:{
                pdfs:{
                    orignalFilename: req.file.originalname,
                    uploadDate: new Date(),
                    pineconeNamespace: s3key,
                }

            }
        }) 
        const pdfData= await pdfParse(fileBuffer)
        const pdfText = pdfData.text;
        const docs = pdfText.match(/(.|[\r\n]){1,1000}/g) || [];
        const embeddings= new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
        });
        const pineconeIndex=pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        await PineconeStore.fromTexts(docs,[],embeddings,{pineconeIndex,namespace:s3key});
        await fs.promises.unlink(filePath); // Clean up the local file after upload
        res.status(200).json({ success: true, message: "File uploaded successfully in S3 ", url: s3Url });
    } catch (error) {
        console.error("Error in uploading file in S3:", error);
        res.status(500).json({ success: false, message: "Internal Seever Error" })
    }

}

export const getAllPdfs= async (req: Request, res: Response, next: NextFunction) => {
    try {
    const userId =res.locals.jwtData.id;
    const user = await User.findById(userId)
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;}
        res.status(200).json({success:true,pdfs:user.pdfs})   
    } catch (error) {
        console.error("Error in fetching pdfs:",error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

export const chatWithPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {query, pdfNamespace} = req.body;
        if (!query || !pdfNamespace) {
            res.status(400).json({ success: false, message: "Query and PDF namespace are required" });
            return;
        }
        const userId = res.locals.jwtData.id;
        const user = await User.findById(userId);   
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        console.log("User found:", user.email);
        const pdf = user.pdfs.find((pdf) => pdf.pineconeNamespace === pdfNamespace);
        if (!pdf) {
            res.status(404).json({ success: false, message: "PDF not found" });
            return;
        }
        // Format chat history for the chain
        const chat_history = (pdf.chat_history || []).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const lcChatHistory = chat_history.map(msg => {
  if (msg.role === "user") {
    return new HumanMessage(msg.content || "");
  } else if (msg.role === "assistant" || msg.role === "ai") {
    return new AIMessage(msg.content || "");
  }
  // Add more roles as needed, or default to HumanMessage
  return new HumanMessage(msg.content || "");
});
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
        });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,namespace: pdfNamespace
        });
       const retriever = vectorStore.asRetriever();
       const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
    model: "gemini-1.5-flash",
});
// Define your prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Use the following context to answer the user's question."],
  ["user", "Context:\n{context}\n\nQuestion: {input}"]
]);
const combineDocsChain = await createStuffDocumentsChain({
  llm,
    prompt
});

const chain =await createRetrievalChain({combineDocsChain, retriever});
const response = await chain.invoke({
  input: query,
  chat_history: lcChatHistory,
});
if(user){
    const pdf = user.pdfs.find(pdf=>pdf.pineconeNamespace=== pdfNamespace);
    if(pdf){
        pdf.chat_history.push({
            role:"user",
            content:query
        },
    {role:"model",content:response.answer})
        await user.save();
    }
}
let cleanAnswer = response.answer;
if (typeof cleanAnswer === "string") {
  cleanAnswer = cleanAnswer.replace(/\\"/g, '"');
  cleanAnswer = cleanAnswer.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
  cleanAnswer = cleanAnswer.replace(/\\([\"'])/g, '$1');
}
res.status(200).json({ success: true, answer: cleanAnswer });
    } catch (error) {
        console.error("Error in chat with pdf:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        
    }
}

export const generatePdfSummary= async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const { pdfNamespace } = req.body;
        if (!pdfNamespace) {
            res.status(400).json({ success: false, message: "PDF namespace is required" });
            return;
        }   
        const userId = res.locals.jwtData.id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const pdf = user.pdfs.find((pdf) => pdf.pineconeNamespace === pdfNamespace);
        if (!pdf) {
            res.status(404).json({ success: false, message: "PDF not found" });
            return;
        }
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey:process.env.GOOGLE_GENAI_API_KEY || ""
        });
        const pineconeIndex=pinecone.Index(process.env.PINECONE_INDEX_NAME ||"");
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings,{
            pineconeIndex, namespace: pdfNamespace
        })
        const retriever= vectorStore.asRetriever({k:10});
const retrievedDocs = await retriever.invoke("summarize this PDF");
     const context = retrievedDocs;
        const llm = new ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
            model: "gemini-1.5-flash",
        });
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Summarize the following pdf in 4-5 lines."],
            ["user", "{context}"]
        ]);
        const combineDocsChain = await createStuffDocumentsChain({
            llm,
            prompt
        });
        const response = await combineDocsChain.invoke({context });
      
        let cleanAnswer = response;
        if (typeof cleanAnswer === "string") {
          cleanAnswer = cleanAnswer.replace(/\\"/g, '"');
          cleanAnswer = cleanAnswer.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
          cleanAnswer = cleanAnswer.replace(/\\([\"'])/g, '$1');
        }
          pdf.summary = cleanAnswer;
        await user.save();
        res.status(200).json({ success: true, summary: cleanAnswer });

    } catch (error) {
        console.error("Error in generating summary of pdf:",error);
        res.status(500).json({success:false,message:"Internal Server Error"})
        
    }
}
export const getPdfChatHistory =  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pdfNamespace } = req.query;
    const userId = res.locals.jwtData.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const pdf = user.pdfs.find(pdf => pdf.pineconeNamespace === pdfNamespace);
    if (!pdf) {
      res.status(404).json({ success: false, message: "PDF not found" });
      return;
    }

    res.status(200).json({success:true,chatHistory: pdf.chat_history});
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deletePdf =async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {pdfNamespace}= req.body;
        if (!pdfNamespace) {
            res.status(400).json({ success: false, message: "PDF namespace is required" });
            return;
        }
        const userId =res.locals.jwtData.id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const pdf = user.pdfs.find((pdf)=> pdf.pineconeNamespace === pdfNamespace);
        if (!pdf) {
            res.status(404).json({ success: false, message: "PDF not found" });
            return;
        }
        // Delete pdf from AWS S3
        await s3Client.send(new DeleteObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET_NAME || "",
            Key: pdf.pineconeNamespace??"",
        }))
        //Delete form pinecone
        const pineconeIndex=pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
       await pineconeIndex.namespace(pdf.pineconeNamespace??"").deleteAll();
    
       //Delete from Database
       if(pdf){
        user.pdfs.pull(pdf._id);
       }
        await user.save();
        res.status(200).json({ success: true, message: "PDF deleted successfully" });
    } catch (error) {
console.error("Error in deleting pdf:",error);
res.status(500).json({success:false,message:"Internal Server Error"})        
    }
}