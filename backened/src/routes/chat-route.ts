import { generateChatCompletion,createNewSession, listSessions, getSessionMessages, deleteSession } from "../controllers/chat";
import { validate, chatValidator } from "../utils/user-validator";
import { Router } from "express";
import { verifytoken } from "../utils/token-manger";
import { checkPlanExpiry } from "../utils/checkPlanExpiry";

const chatRoutes = Router();
chatRoutes.post("/session",verifytoken,checkPlanExpiry,createNewSession)
chatRoutes.get("/sessions",verifytoken,listSessions)
chatRoutes.get("/session/:sessionId",verifytoken,getSessionMessages)
chatRoutes.post("/session/:sessionId/message",verifytoken,validate(chatValidator),generateChatCompletion)
chatRoutes.delete("/session/:sessionId",verifytoken,deleteSession);

export default chatRoutes;