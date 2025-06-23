import axios from "axios";
import { useState,useEffect } from "react";

interface PdfSummaryProps{
  pdfNamespace:string
}

export default function PdfSummary({ pdfNamespace }: PdfSummaryProps) {
const [summary, setSummary] = useState<string | null>(null);
const [loading, setLoading] = useState<boolean>(false);
useEffect(()=>{
  if(!pdfNamespace) return;
  const fetchsummary = async()=>{
    setLoading(true);
    try {
      const response = await axios.post("/chat-pdf/generate-summary",{ pdfNamespace},{withCredentials:true})
      if(response.data.success){
        setSummary(response.data.summary);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching PDF summary:", error);
      setSummary("Failed to fetch summary");
      
    }
  }
  fetchsummary();
}, [pdfNamespace]);

  return (
    <div className="bg-gray-800 text-purple-100 rounded-lg p-4 shadow mb-2">
      <h3 className="font-semibold text-purple-300 mb-2">PDF Summary</h3>
     {loading && <p className="text-sm">Loading summary...</p>}
      {!loading && <p className="text-sm">{summary || "No summary available."}</p>}
    </div>
  );
}