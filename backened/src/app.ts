import express from "express";
import { config } from 'dotenv';
import approuter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config();

const app = express();

const COOKIE_SECRET = process.env.COOKIE_SECRET;
app.use(cors({ origin:process.env.FRONTEND_URL || "http://localhost:5173",credentials:true }));
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET)); 

app.use("/api/v1", approuter);

export default app;
