import './App.css'
import Header from './component/pages/Header';
import Index from './component/pages/ChatAudio/index';
import Home from './component/pages/Home';
import Chat from './component/pages/Chat';
import Login from './component/pages/Login';
import Signup from './component/pages/Signup';
import {Route ,Routes} from 'react-router-dom';
import Chatpdf from './component/pages/ChatPdf/CombineChatpdf'
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
function App() {
    const [sessions, setSessions] = useState<{ sessionId: string, title: string }[]>([])
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const navigate = useNavigate();
 const createSession = async () => {
  try {
    const res = await axios.post("/chat/session", { withCredentials: true });
    if (!res.data.success) {
      console.error("Failed to create session:", res.data.message);
      return;
    }
    setSessions([...sessions, { sessionId: res.data.session.sessionId, title: res.data.session.title }]);
    setCurrentSession(res.data.session.sessionId);
    navigate(`/chat/session/${res.data.session.sessionId}`);
  } catch (error:any) {
    if(error.response && error.response.status === 403) {
      toast.error("Free plan limit reached. Upgrade to Pro for unlimited chats.");
    }
  }
    
  };
 
  return (
  <div className='bg-black text-gray-200 min-h-screen'>
    <Header createSession={createSession}/>
    <Routes>
      <Route path='/' element={<Home/>}/>

      <Route path='/chat-pdf' element={<Chatpdf/>}/>
      <Route path='/chat-audio' element={<Index/>}/>
      <Route path='/chat/session/:sessionId' element={<Chat createSession={createSession}
      sessions={sessions}
        setSessions={setSessions}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession} />}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='*' element={<h1>404 Not Found</h1>}/>
    </Routes>
  </div>
  )
}

export default App
