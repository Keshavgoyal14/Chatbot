import mongoose from "mongoose";
const mongoURL = process.env.MONGODB_URL;
export async function connectDB(){
if (!mongoURL) {
    throw new Error("MONGODB_URL environment variable is not defined");
}
try {
    mongoose.connect(mongoURL);
} catch (error) {
    throw new Error("MongoDB not connected");
}}

export async function disconnectDB() {
    try {
        mongoose.disconnect();
    } catch (error) {
        throw new Error("MongoDB not disconnected");
        
    }
}
