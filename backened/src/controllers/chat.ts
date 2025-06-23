import { Request, Response, NextFunction } from "express";
import { ai } from "../configration/GeminiConfig";
import User from "../models/users";

export const generateChatCompletion = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { message } = req.body;
  const sessionId = req.params.sessionId;
  
  try {
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Valid message is required"
      });
      return;
    }

    // User authentication check
    const userId = res.locals.jwtData?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }
const session =user.chats.find(chat=>chat.sessionId===sessionId);
if(!session){
  res.status(404).json({
    sucess:false,
    message:"Session not found"
  })
  return;
};
    // Get the generative model
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });


    const systemPrompt = {
  role: "user",
  parts: [{ text: "You are a helpful AI assistant. Answer clearly and concisely." }]
};
  const history = [
  systemPrompt,
  ...session?.messages.slice(-20).map(({ role, content }) => ({
    role: role === "model" ? "model" : "user",
    parts: [{ text: content }],
  }))
];

    // Start chat session with history
    const chatSession = model.startChat({
      history: history.length > 0 ? history : []
    });

    // Send message and get response
    const result = await chatSession.sendMessage(message.trim());
    const response = await result.response;
    const geminiReply = response.text();

    // Validate response
    if (!geminiReply) {
      throw new Error("Empty response from Gemini API");
    }

    // Update user chat history
    session.messages.push(
      { role: "user", content: message.trim() },
      { role: "model", content: geminiReply }
    );
if (session.messages.length === 2 && session.title === "New Chat") {
  // The first message just got added (user+model), so messages[0] is the user's first message
  session.title = session.messages[0].content.slice(0, 40); // Limit to 40 chars if you want
}
    // Save user data
    await user.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: geminiReply,
      messages: session.messages
    });

  } catch (error) {
    console.error("Chat completion error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const createNewSession=async (req: Request, res: Response, next: NextFunction)=>{
  try {
      const userId = res.locals.jwtData?.id;
    if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" })
    return;}

    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ success: false, message: "User not found" })
      return;}
    if (user.plan==="free" && user.chats.length >= 5) {
      res.status(403).json({
        success: false,
        message: "Free plan limit reached. Upgrade to Pro for unlimited chats."
      });
      return;
    }
    const session ={title:"New Chat", messages:[]}
    user.chats.push(session);
    await user.save();
    const newSession = user.chats[user.chats.length - 1];
    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    console.error("Error creating new session:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
    
  }
}
export const listSessions = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId){ res.status(401).json({ success: false, message: "Unauthorized" }) 
      return;}

    const user = await User.findById(userId);
    if (!user) {
       res.status(404).json({ success: false, message: "User not found" });
       return
}
    const sessions = user.chats.map(({ sessionId, title }) => ({ sessionId, title }));
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// GET /chat/session/:sessionId
export const getSessionMessages = async (req: Request, res: Response) => {
  try {
   const userId = res.locals.jwtData?.id;
    if (!userId){ res.status(401).json({ success: false, message: "Unauthorized" }) 
      return;}

    const user = await User.findById(userId);
    if (!user) {
       res.status(404).json({ success: false, message: "User not found" });
       return
}
    const session = user.chats.find(s => s.sessionId === req.params.sessionId);
    if (!session) {res.status(404).json({ success: false, message: "Session not found" })
      return;}

    res.json({ success: true, messages: session.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.jwtData?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const sessionIndex = user.chats.findIndex(s => s.sessionId === req.params.sessionId);
    if (sessionIndex === -1) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    user.chats.splice(sessionIndex, 1);
    await user.save();

    res.json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

