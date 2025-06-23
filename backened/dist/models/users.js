"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const crypto_1 = require("crypto");
const paymentSchema = new mongoose_1.Schema({
    orderId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    paymentId: {
        type: String,
        required: true,
    },
    plan: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
const pdfChatSchema = new mongoose_1.Schema({
    role: String,
    content: String,
    id: {
        type: String,
        default: crypto_1.randomUUID
    }
});
const pdfSchema = new mongoose_1.Schema({
    pdfId: {
        type: String,
        default: crypto_1.randomUUID
    },
    orignalFilename: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    pineconeNamespace: {
        type: String
    },
    summary: {
        type: String
    },
    chat_history: [pdfChatSchema]
});
const chatSchema = new mongoose_1.Schema({
    id: {
        type: String,
        default: crypto_1.randomUUID
    },
    role: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});
const sessionSchema = new mongoose_1.Schema({
    sessionId: { type: String, default: crypto_1.randomUUID },
    title: {
        type: String,
    },
    messages: [chatSchema],
});
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    chats: [sessionSchema],
    pdfs: [pdfSchema],
    payments: [paymentSchema],
    plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
    },
    planActivatedAt: {
        type: Date,
    },
    planExpiresAt: {
        type: Date,
    },
});
exports.default = mongoose_2.default.model("User", userSchema);
