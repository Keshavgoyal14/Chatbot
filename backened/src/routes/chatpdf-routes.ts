import { Router } from "express";
import { uploadFile ,getAllPdfs, chatWithPdf, generatePdfSummary, getPdfChatHistory, deletePdf} from "../controllers/chatpdf";
import { verifytoken } from "../utils/token-manger";
import multer from "multer";
const chatpdfRoutes = Router();
const upload =multer({dest:"uploads/"});

chatpdfRoutes.post("/upload", verifytoken, upload.single("file"), uploadFile)
chatpdfRoutes.get("/get-Allpdfs",verifytoken,getAllPdfs)
chatpdfRoutes.post("/chat",verifytoken,chatWithPdf)
chatpdfRoutes.post("/generate-summary", verifytoken, generatePdfSummary);
chatpdfRoutes.get("/getchats",verifytoken,getPdfChatHistory)
chatpdfRoutes.delete("/deletepdf",verifytoken,deletePdf)
export default chatpdfRoutes;