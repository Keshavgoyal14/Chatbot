import { Router } from "express";
import { chatAudio, uploadAudioOrURL } from "../controllers/chataudio";
import { verifytoken } from "../utils/token-manger";
import multer from "multer";
const chataudioRoutes = Router();
const upload = multer({ dest: "uploads/" });
chataudioRoutes.post("/upload",verifytoken,upload.single("file"),uploadAudioOrURL)
chataudioRoutes.post("/audio-chat",verifytoken,chatAudio)

export default chataudioRoutes;