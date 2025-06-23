"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chataudio_1 = require("../controllers/chataudio");
const token_manger_1 = require("../utils/token-manger");
const multer_1 = __importDefault(require("multer"));
const chataudioRoutes = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
chataudioRoutes.post("/upload", token_manger_1.verifytoken, upload.single("file"), chataudio_1.uploadAudioOrURL);
chataudioRoutes.post("/audio-chat", token_manger_1.verifytoken, chataudio_1.chatAudio);
exports.default = chataudioRoutes;
