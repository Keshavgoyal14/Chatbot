import React, { useState,useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
type ChatAudioProps = {
  audioNamespace: string | null;
};
const ChatAudio: React.FC<ChatAudioProps> = ({ audioNamespace }) => {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.user && !auth?.authLoading) {
      navigate("/login")
    }
  }, [auth?.authLoading,auth?.user,navigate])

  // Replace with your actual namespace from upload
  const namespace = audioNamespace;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("/chat-audio/audio-chat", {
        namespace,
        query: input,
      });
      const aiMsg = {
        role: "ai" as const,
        content: res.data.response?.answer || "No answer from AI.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error: Could not get a response from the server." },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
  <div className="relative flex flex-col h-[calc(100vh-5rem)] pb-5 mt-8 mx-2 sm:mx-4 md:mx-8">
    {/* Decorative blurred circle */}
    <div className="absolute -top-32 -right-32 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-purple-800 opacity-20 rounded-full blur-3xl pointer-events-none z-0" />

    <div className="flex-1 overflow-y-auto p-2 sm:p-4 rounded-2xl mb-4 bg-zinc-950">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={msg.role === "user" ? "text-right m-2" : "text-left m-2"}
        >
          <b className={msg.role === "user" ? "text-violet-400" : "text-purple-300"}>
            {msg.role === "user" ? "You" : "AI"}:
          </b>{" "}
          {msg.content}
        </div>
      ))}
    </div>
   <form className="flex gap-2 mb-2" onSubmit={handleSend}>
  <input
    className="flex-1 border border-violet-400 rounded-2xl px-2 py-2 bg-zinc-800 text-white"
    value={input}
    onChange={e => setInput(e.target.value)}
    placeholder="Ask about your audio..."
    disabled={loading}
  />
  <button
    disabled={loading}
    type="submit"
    className="bg-purple-500 text-white px-4 py-2 rounded-2xl"
  >
    Send
  </button>
</form>
  </div>
);
};

export default ChatAudio;