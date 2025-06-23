import { Router } from "express";
import userRoutes from "./user-route";
import chatRoutes from "./chat-route";
import chatpdfRoutes from "./chatpdf-routes";
import chataudioRoutes from "./chataudio-routes";
import paymentsRoutes from "./paymentRoutes";
const approuter = Router();


approuter.use("/user",userRoutes);
approuter.use("/chat",chatRoutes)
approuter.use("/chat-pdf",chatpdfRoutes)
approuter.use("/chat-audio",chataudioRoutes);
approuter.use("/payments",paymentsRoutes);
export default approuter;