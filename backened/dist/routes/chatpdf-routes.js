"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatpdf_1 = require("../controllers/chatpdf");
const token_manger_1 = require("../utils/token-manger");
const multer_1 = __importDefault(require("multer"));
const chatpdfRoutes = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
chatpdfRoutes.post("/upload", token_manger_1.verifytoken, upload.single("file"), chatpdf_1.uploadFile);
chatpdfRoutes.get("/get-Allpdfs", token_manger_1.verifytoken, chatpdf_1.getAllPdfs);
chatpdfRoutes.post("/chat", token_manger_1.verifytoken, chatpdf_1.chatWithPdf);
chatpdfRoutes.post("/generate-summary", token_manger_1.verifytoken, chatpdf_1.generatePdfSummary);
chatpdfRoutes.get("/getchats", token_manger_1.verifytoken, chatpdf_1.getPdfChatHistory);
chatpdfRoutes.delete("/deletepdf", token_manger_1.verifytoken, chatpdf_1.deletePdf);
exports.default = chatpdfRoutes;
