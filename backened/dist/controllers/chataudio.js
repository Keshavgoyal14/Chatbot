"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatAudio = exports.uploadAudioOrURL = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const google_genai_1 = require("@langchain/google-genai");
const pinecone_1 = require("@langchain/pinecone");
const pinecone_2 = require("../configration/pinecone");
const prompts_1 = require("@langchain/core/prompts");
const combine_documents_1 = require("langchain/chains/combine_documents");
const retrieval_1 = require("langchain/chains/retrieval");
function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize - overlap;
    }
    return chunks;
}
const uploadAudioOrURL = async (req, res, next) => {
    try {
        let tempfile = '';
        let orignalFilename = '';
        let transcript = "";
        if (req.file) {
            tempfile = req.file.path;
            orignalFilename = req.file.originalname;
            const audioBuffer = fs_1.default.readFileSync(tempfile);
            //For uploading to AssemblyAI
            const baseUrl = "https://api.assemblyai.com";
            const headers = {
                authorization: process.env.ASSEMBLYAI_API_KEY,
            };
            const uploadedAudio = await axios_1.default.post(`${baseUrl}/v2/upload`, audioBuffer, { headers });
            const audioUrl = uploadedAudio.data.upload_url;
            const data = {
                audio_url: audioUrl,
                speech_model: "universal",
            };
            //For creating a transcription
            const url = `${baseUrl}/v2/transcript`;
            const response = await axios_1.default.post(url, data, { headers: { authorization: process.env.ASSEMBLYAI_API_KEY, "content-type": "application/json" } });
            const transcriptId = response.data.id;
            const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;
            while (true) {
                const pollingResponse = await axios_1.default.get(pollingEndpoint, {
                    headers: headers,
                });
                const transcriptionResult = pollingResponse.data;
                if (transcriptionResult.status === "completed") {
                    transcript = transcriptionResult.text;
                    break;
                }
                else if (transcriptionResult.status === "error") {
                    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
                }
                else {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            }
            fs_1.default.unlinkSync(tempfile);
        }
        else {
            res.status(400).json({ success: false, message: "Please provide an audio file or a valid YouTube URL." });
            return;
        }
        const docs = chunkText(transcript);
        const namespace = `audio-${Date.now()}`;
        const embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        });
        const pineconeIndex = pinecone_2.pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        await pinecone_1.PineconeStore.fromTexts(docs, [], embeddings, {
            pineconeIndex, namespace
        });
        res.status(200).json({ success: true, namespace: namespace, orignalFilename: orignalFilename });
    }
    catch (error) {
        console.error("Error in uploading ", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.uploadAudioOrURL = uploadAudioOrURL;
const chatAudio = async (req, res, next) => {
    try {
        const { namespace, query } = req.body;
        if (!namespace || !query) {
            res.status(400).json({ success: false, message: "Namespace and query are required" });
            return;
        }
        const embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
        });
        const pineconeIndex = pinecone_2.pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const vectorStore = await pinecone_1.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace
        });
        const llm = new google_genai_1.ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            model: "gemini-1.5-flash",
        });
        const retriever = vectorStore.asRetriever({ k: 5 });
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Use the following context to answer the user's question."],
            ["user", "Context:\n{context}\n\nQuestion: {input}"],
        ]);
        const combineDocsChain = await (0, combine_documents_1.createStuffDocumentsChain)({ llm, prompt });
        const chain = await (0, retrieval_1.createRetrievalChain)({ combineDocsChain, retriever });
        const response = await chain.invoke({
            input: query,
            chat_history: [],
        });
        res.status(200).json({ success: true, response: response });
    }
    catch (error) {
        console.error("Error in chat audio:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.chatAudio = chatAudio;
