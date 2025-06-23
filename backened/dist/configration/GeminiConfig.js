"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const GeminiApiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!GeminiApiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables");
}
exports.ai = new generative_ai_1.GoogleGenerativeAI(GeminiApiKey);
