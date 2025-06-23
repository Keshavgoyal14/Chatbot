import PdfList from './PdfList'
import Pdfchat from './Pdfchat'
import PdfUpload from './PdfUpload'
import PdfSummary from './PdfSummary'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
type PdfMeta = {
  pdfId: string;
  orignalFilename: string;
  s3Url: string;
  pineconeNamespace: string;
};

function Chatpdf() {
    const [selectedPdf, setSelectedPdf] = useState<PdfMeta| null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.user && !auth?.authLoading) {
      navigate("/login")
    }
  }, [auth?.authLoading,auth?.user,navigate])
  
const handleUploadSuccess = () => {
  setRefreshKey(prev => prev + 1);
};
  return (
  <div className="relative min-h-screen bg-gray-950 overflow-hidden">
    {/* Decorative blurred circles */}
    <div className="absolute -top-32 -left-42 w-[500px] h-[500px] bg-purple-800 opacity-20 rounded-full blur-3xl pointer-events-none z-0" />
    <div className="absolute -bottom-32 -right-42 w-[500px] h-[500px] bg-purple-800 opacity-20 rounded-full blur-3xl pointer-events-none z-0" />
    {/* Main content */}
    <div
      className="
        relative flex flex-col md:flex-row justify-between items-start
        pt-8 md:pt-20
        pb-8 md:pb-10
        px-4 md:px-10
        min-h-screen z-10 gap-8
      "
      style={{
        paddingTop: '80px',      // 80px top padding on large screens
        paddingBottom: '40px',   // 40px bottom padding on large screens
      }}
    >
      {/* PdfList above on mobile, right on desktop */}
      <div className="w-full md:hidden mb-8">
        <PdfList
          refreshKey={refreshKey}
          selectedPdfId={selectedPdf?.pdfId ?? ""}
          setSelectedPdf={setSelectedPdf}
        />
      </div>
      <div className="flex flex-col gap-4 md:gap-2 justify-between w-full md:w-2/3">
        <PdfUpload handleUploadSuccess={handleUploadSuccess} />
        <PdfSummary pdfNamespace={selectedPdf?.pineconeNamespace ?? ""} />
        <Pdfchat pdfNamespace={selectedPdf?.pineconeNamespace ?? ""} />
      </div>
      <div className="w-full md:w-1/3 md:pl-8 mt-8 md:mt-0 hidden md:block">
        <PdfList
          refreshKey={refreshKey}
          selectedPdfId={selectedPdf?.pdfId ?? ""}
          setSelectedPdf={setSelectedPdf}
        />
      </div>
    </div>
  </div>
);

}

export default Chatpdf