"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePdf = exports.getPdfChatHistory = exports.generatePdfSummary = exports.chatWithPdf = exports.getAllPdfs = exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const google_genai_1 = require("@langchain/google-genai");
const aws_config_1 = require("../configration/aws-config");
const fs_1 = __importDefault(require("fs"));
const prompts_1 = require("@langchain/core/prompts");
const google_genai_2 = require("@langchain/google-genai");
const users_1 = __importDefault(require("../models/users"));
const messages_1 = require("@langchain/core/messages");
const pinecone_1 = require("../configration/pinecone");
const pinecone_2 = require("@langchain/pinecone");
const retrieval_1 = require("langchain/chains/retrieval");
const combine_documents_1 = require("langchain/chains/combine_documents");
const uploadFile = async (req, res, next) => {
    try {
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
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
        const fileBuffer = await fs_1.default.promises.readFile(filePath);
        const s3key = `chatpdf/${Date.now()}_${req.file.filename}`;
        await aws_config_1.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME || "",
            Key: s3key,
            Body: fileBuffer,
            ContentType: req.file.mimetype,
        }));
        const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazon.com/${s3key}`;
        await users_1.default.findByIdAndUpdate(userId, {
            $push: {
                pdfs: {
                    orignalFilename: req.file.originalname,
                    uploadDate: new Date(),
                    pineconeNamespace: s3key,
                }
            }
        });
        const pdfData = await (0, pdf_parse_1.default)(fileBuffer);
        const pdfText = pdfData.text;
        const docs = pdfText.match(/(.|[\r\n]){1,1000}/g) || [];
        const embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
        });
        const pineconeIndex = pinecone_1.pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        await pinecone_2.PineconeStore.fromTexts(docs, [], embeddings, { pineconeIndex, namespace: s3key });
        await fs_1.default.promises.unlink(filePath); // Clean up the local file after upload
        res.status(200).json({ success: true, message: "File uploaded successfully in S3 ", url: s3Url });
    }
    catch (error) {
        console.error("Error in uploading file in S3:", error);
        res.status(500).json({ success: false, message: "Internal Seever Error" });
    }
};
exports.uploadFile = uploadFile;
const getAllPdfs = async (req, res, next) => {
    try {
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.status(200).json({ success: true, pdfs: user.pdfs });
    }
    catch (error) {
        console.error("Error in fetching pdfs:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getAllPdfs = getAllPdfs;
const chatWithPdf = async (req, res, next) => {
    try {
        const { query, pdfNamespace } = req.body;
        if (!query || !pdfNamespace) {
            res.status(400).json({ success: false, message: "Query and PDF namespace are required" });
            return;
        }
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
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
                return new messages_1.HumanMessage(msg.content || "");
            }
            else if (msg.role === "assistant" || msg.role === "ai") {
                return new messages_1.AIMessage(msg.content || "");
            }
            // Add more roles as needed, or default to HumanMessage
            return new messages_1.HumanMessage(msg.content || "");
        });
        const embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
        });
        const pineconeIndex = pinecone_1.pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const vectorStore = await pinecone_2.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex, namespace: pdfNamespace
        });
        const retriever = vectorStore.asRetriever();
        const llm = new google_genai_2.ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
            model: "gemini-1.5-flash",
        });
        // Define your prompt template
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Use the following context to answer the user's question."],
            ["user", "Context:\n{context}\n\nQuestion: {input}"]
        ]);
        const combineDocsChain = await (0, combine_documents_1.createStuffDocumentsChain)({
            llm,
            prompt
        });
        const chain = await (0, retrieval_1.createRetrievalChain)({ combineDocsChain, retriever });
        const response = await chain.invoke({
            input: query,
            chat_history: lcChatHistory,
        });
        if (user) {
            const pdf = user.pdfs.find(pdf => pdf.pineconeNamespace === pdfNamespace);
            if (pdf) {
                pdf.chat_history.push({
                    role: "user",
                    content: query
                }, { role: "model", content: response.answer });
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
    }
    catch (error) {
        console.error("Error in chat with pdf:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.chatWithPdf = chatWithPdf;
const generatePdfSummary = async (req, res, next) => {
    try {
        const { pdfNamespace } = req.body;
        if (!pdfNamespace) {
            res.status(400).json({ success: false, message: "PDF namespace is required" });
            return;
        }
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const pdf = user.pdfs.find((pdf) => pdf.pineconeNamespace === pdfNamespace);
        if (!pdf) {
            res.status(404).json({ success: false, message: "PDF not found" });
            return;
        }
        const embeddings = new google_genai_1.GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || ""
        });
        const pineconeIndex = pinecone_1.pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        const vectorStore = await pinecone_2.PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex, namespace: pdfNamespace
        });
        const retriever = vectorStore.asRetriever({ k: 10 });
        const retrievedDocs = await retriever.invoke("summarize this PDF");
        const context = retrievedDocs;
        const llm = new google_genai_2.ChatGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
            model: "gemini-1.5-flash",
        });
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Summarize the following pdf in 4-5 lines."],
            ["user", "{context}"]
        ]);
        const combineDocsChain = await (0, combine_documents_1.createStuffDocumentsChain)({
            llm,
            prompt
        });
        const response = await combineDocsChain.invoke({ context });
        let cleanAnswer = response;
        if (typeof cleanAnswer === "string") {
            cleanAnswer = cleanAnswer.replace(/\\"/g, '"');
            cleanAnswer = cleanAnswer.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
            cleanAnswer = cleanAnswer.replace(/\\([\"'])/g, '$1');
        }
        pdf.summary = cleanAnswer;
        await user.save();
        res.status(200).json({ success: true, summary: cleanAnswer });
    }
    catch (error) {
        console.error("Error in generating summary of pdf:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.generatePdfSummary = generatePdfSummary;
const getPdfChatHistory = async (req, res, next) => {
    try {
        const { pdfNamespace } = req.query;
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const pdf = user.pdfs.find(pdf => pdf.pineconeNamespace === pdfNamespace);
        if (!pdf) {
            res.status(404).json({ success: false, message: "PDF not found" });
            return;
        }
        res.status(200).json({ success: true, chatHistory: pdf.chat_history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getPdfChatHistory = getPdfChatHistory;
const deletePdf = async (req, res, next) => {
    try {
        const { pdfNamespace } = req.body;
        if (!pdfNamespace) {
            res.status(400).json({ success: false, message: "PDF namespace is required" });
            return;
        }
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const pdf = user.pdfs.find((pdf) => pdf.pineconeNamespace === pdfNamespace);
        if (!pdf) {
            res.status(404).json({ success: false, message: "PDF not found" });
            return;
        }
        // Delete pdf from AWS S3
        await aws_config_1.s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME || "",
            Key: pdf.pineconeNamespace ?? "",
        }));
        //Delete form pinecone
        const pineconeIndex = pinecone_1.pinecone.Index(process.env.PINECONE_INDEX_NAME || "");
        await pineconeIndex.namespace(pdf.pineconeNamespace ?? "").deleteAll();
        //Delete from Database
        if (pdf) {
            user.pdfs.pull(pdf._id);
        }
        await user.save();
        res.status(200).json({ success: true, message: "PDF deleted successfully" });
    }
    catch (error) {
        console.error("Error in deleting pdf:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.deletePdf = deletePdf;
