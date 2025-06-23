import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const GeminiApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!GeminiApiKey) {
  throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables");
}

export const ai = new GoogleGenerativeAI(GeminiApiKey);