"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoURL = process.env.MONGODB_URL;
async function connectDB() {
    if (!mongoURL) {
        throw new Error("MONGODB_URL environment variable is not defined");
    }
    try {
        mongoose_1.default.connect(mongoURL);
    }
    catch (error) {
        throw new Error("MongoDB not connected");
    }
}
async function disconnectDB() {
    try {
        mongoose_1.default.disconnect();
    }
    catch (error) {
        throw new Error("MongoDB not disconnected");
    }
}
