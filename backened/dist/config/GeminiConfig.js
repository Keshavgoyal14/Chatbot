"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const genai_1 = require("@google/genai");
const GeminiApiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!GeminiApiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables");
}
exports.ai = new genai_1.GoogleGenAI({ apiKey: GeminiApiKey });
