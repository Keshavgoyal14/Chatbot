import axios from "axios";
import { useEffect, useState} from "react";

interface PdfChatProps{
  pdfNamespace: string;
}

export default function Pdfchat({ pdfNamespace }: PdfChatProps) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);

 

  
useEffect(() => {
  if (!pdfNamespace) return;
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get("/chat-pdf/getchats", {
        params: { pdfNamespace },
        withCredentials: true
      });
      if (response.data.success) {
        // Map "model" to "ai" for frontend consistency
        const normalized = (response.data.chatHistory || []).map((msg: any) => ({
          ...msg,
          role: msg.role === "model" ? "ai" : msg.role
        }));
        setMessages(normalized);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };
  fetchChatHistory();
}, [pdfNamespace]);

const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pdfNamespace) return;
    const Msg ={role:"user" as const,content:input};
    setMessages((prev)=>[...prev ,Msg]);
    setLoading(true);
    try {
      const response =await axios.post("/chat-pdf/chat",{query:input,pdfNamespace:pdfNamespace},{withCredentials:true});
      if(response.data.success){
        const aiMsg={role:"ai" as const,content:response.data.answer};
        setMessages((prev) => [...prev, aiMsg]);
        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      return;
    }
    finally {
      setLoading(false);}
}
  return (
    <div className="mt-6">
      
      <div className="h-80 overflow-y-auto  p-4 rounded mb-2" >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.role === "user" ? "text-right m-2" : "text-left"}
          >
            
            <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.content}
        
          </div >
          
        ))}
      </div >
      <form className="flex gap-2" onSubmit={handleSend}>
        <input
          className="flex-1 border rounded-2xl px-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your PDF..."
        />
        <button disabled={loading}
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-2xl"
        >
          Send
        </button>
      </form>
    </div>
  );
}