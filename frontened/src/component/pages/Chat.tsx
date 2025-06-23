import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdDeleteOutline } from "react-icons/md";
import { useAuth } from "../context/AuthContext"; // Adjust the import path as needed
type Session = {
  sessionId: string;
  title: string;
  // Add other properties if needed
};

function renderMessageContent(content: string) {
  // Regex to match ```lang\ncode\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Push text before code block
    if (match.index > lastIndex) {
      elements.push(
        <span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>
      );
    }
    // Push code block
    elements.push(
      <SyntaxHighlighter
        key={match.index}
        language={match[1] || "text"}
        style={oneDark}
        customStyle={{ borderRadius: 8, fontSize: 14, margin: "8px 0" }}
        showLineNumbers={false}
      >
        {match[2]}
      </SyntaxHighlighter>
    );
    lastIndex = codeBlockRegex.lastIndex;
  }
  // Push any remaining text
  if (lastIndex < content.length) {
    elements.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>);
  }
  return elements;
}
type ChatProps = {
  createSession: () => Promise<void>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  currentSession: string | null;
  setCurrentSession: React.Dispatch<React.SetStateAction<string | null>>;
};

function Chat({  createSession,
  sessions,setSessions,
  currentSession, setCurrentSession }:ChatProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth?.user && !auth?.authLoading) {
      navigate("/login")
    }
  }, [auth?.authLoading,auth?.user,navigate])
 
  useEffect(() => {
    if (currentSession) {
      axios
        .get(`/chat/session/${currentSession}`, { withCredentials: true })
        .then(res => setMessages(res.data.messages || []))
        .catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  useEffect(() => {
    axios.get("/chat/sessions", { withCredentials: true })
      .then(res => setSessions(res.data.sessions));
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 
 const handleSessionClick = (sessionId: string) => {
    setCurrentSession(sessionId);
    navigate(`/chat/session/${sessionId}`);

  };
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      console.log(currentSession)
      const res = await axios.post(
        `/chat/session/${currentSession}/message`,
        { message: input },
        { withCredentials: true }
      );
      const chatHistory = res.data.messages || [];
      console.log("Chat history:", chatHistory);
      setMessages(chatHistory);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Error: Could not get a response." },
      ]);
    }
    setInput("");
    setLoading(false);
  };
const deleteSession = async (sessionId: string) => {
    const res = await axios.delete(`/chat/session/${sessionId}`, { withCredentials: true });
    if (!res.data.success) {
      console.error("Failed to delete session:", res.data.message);
      return;
    }
    setSessions(sessions.filter(session => session.sessionId !== sessionId));
      setCurrentSession(null);
      setMessages([]);
      const updatedSessions = sessions.filter(session => session.sessionId !== sessionId);
      if (updatedSessions.length > 0) {
        setCurrentSession(updatedSessions[updatedSessions.length - 1].sessionId);
        navigate(`/chat/session/${updatedSessions[updatedSessions.length - 1].sessionId}`);
      } else {
        navigate("/chat");
      }
  };

return (
  <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 pt-16 md:pt-0">
    {/* Side Nav */}
   <aside className="w-full md:w-64 md:fixed md:top-14 md:left-0 md:h-[690px] bg-gray-900 border-b md:border-b-0 md:border-r border-purple-900/30 flex flex-col py-4 md:py-6 px-2 md:px-4 z-20">
  <div className="w-full flex-1 flex flex-col">
    <h2 className="text-xl font-bold text-purple-300 mt-[-10px] mb-5">Chats</h2>
    <ul className="flex-1 space-y-2 overflow-y-auto max-h-40 md:max-h-[500px]">
      {sessions.map((session) => (
        <li
          key={session.sessionId}
          className={`px-4 py-2 rounded-lg cursor-pointer transition ${currentSession === session.sessionId
            ? "bg-purple-700 text-white"
            : "bg-gray-800 text-gray-200 hover:bg-purple-700 hover:text-white"
            }`}
          onClick={() => handleSessionClick(session.sessionId)}
        >
          <div className="flex items-center justify-between">
            <span>{session.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger><BsThreeDots /></DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 text-white">
                <DropdownMenuItem className="uppercase font-medium " onClick={() => deleteSession(session.sessionId)}><MdDeleteOutline className="text-red-400 mt-0.5" size={30} /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      ))}
    </ul>
    <div className="mt-6 w-full">
      <Button onClick={createSession} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition">
        + New Chat
      </Button>
    </div>
  </div>
</aside>

    {/* Main Chat Area */}
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Blurred purple circle */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-800 opacity-20 rounded-full blur-2xl" />
      {/* Blurred blue circle */}
      <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-blue-500 opacity-10 rounded-full blur-2xl" />
    </div>
    <main className="flex-1 flex flex-col pt-4 md:pt-14 md:ml-64 items-center justify-between py-4 md:py-8 transition-all">
      <div className="w-full flex-1 flex flex-col rounded-2xl shadow-2xl borderoverflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 h-[60vh]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 italic">Start the conversation...</div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[90%] sm:max-w-[75%] shadow-md ${msg.role === "user"
                  ? "bg-gradient-to-br from-purple-600 to-purple-400 text-white rounded-br-none"
                  : "bg-gray-800 text-purple-200 rounded-bl-none"
                  }`}
              >{renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input stays full width at the bottom */}
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 sm:gap-3 m-2 px-2 sm:px-4 py-2 sm:py-3 border-t border-purple-900/20"
        >
          <input
            className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-gray-100 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 sm:px-6 py-2 rounded-full shadow-lg transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </main>
  </div>
);
}

export default Chat;