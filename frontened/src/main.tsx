import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom'
import { Toaster } from "sonner";
import { AuthProvider } from './component/context/AuthContext.tsx'
import axios from "axios"

axios.defaults.baseURL=import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/";
axios.defaults.withCredentials=true;

createRoot(document.getElementById('root')!).render(
  <StrictMode> <AuthProvider>
  <BrowserRouter>
    <App /> <Toaster/>
    </BrowserRouter></AuthProvider>
  </StrictMode>
)
