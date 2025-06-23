import { useEffect, useState } from "react";
import axios from "axios";
import { MdDeleteOutline } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
type PdfMeta = {
  pdfId: string;
  orignalFilename: string;
  s3Url: string;
  pineconeNamespace: string;
};
type PdfListProps = {
  selectedPdfId: string;
  setSelectedPdf: (pdf: PdfMeta) => void;
  refreshKey: number;
};
export default function PdfList({ selectedPdfId, setSelectedPdf ,refreshKey}: PdfListProps) {
  const [pdfs, setPdfs] = useState<PdfMeta[]>([]);
const fetchPdfs = () => {
  axios.get("/chat-pdf/get-Allpdfs", { withCredentials: true })
    .then((res) => {
      setPdfs(res.data.pdfs || []);
    });
};

useEffect(() => {
  fetchPdfs();
}, [refreshKey]);

  const handleSelect = (pdf: PdfMeta) => {
    setSelectedPdf({ ...pdf, pineconeNamespace: pdf.pineconeNamespace ?? "" });
    console.log("Selected PDF:",pdf.orignalFilename );
  };

const deleteSession = async(pdfNamespace: string) => {
try {
  const response = await axios.delete("/chat-pdf/deletepdf", {
      data: { pdfNamespace }, // <-- send in body
      withCredentials: true,
    });
  if (response.data.success) {
    setPdfs(pdfs.filter(pdf => pdf.pdfId !== pdfNamespace));
    fetchPdfs()
    toast.success("Session deleted successfully");
  } else {
    console.error("Failed to delete session:", response.data.message);
  }
  
} catch (error) {
  console.error("Error deleting session:", error);

  
}
}
  return (
    <aside className="w-full ml-5 bg-gray-900 border-r  border-purple-900/30 rounded-2xl py-6 px-4 h-[400px] flex flex-col">
      <h3 className="text-xl font-bold text-purple-300 mb-4">Your PDFs</h3>
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {pdfs.length === 0 ? (
          <li className="text-gray-400 text-center mt-10">No PDFs uploaded yet.</li>
        ) : (
          pdfs.map((pdf) => (
          <li
  key={pdf.pdfId}
  className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg transition group ${
    selectedPdfId === pdf.pdfId
      ? "bg-purple-700/80"
      : "bg-gray-800 hover:bg-purple-700/60"
  }`}
>
  <button
    className={`flex-1 text-left px-3 py-2 rounded-lg transition font-medium truncate ${
      selectedPdfId === pdf.pdfId
        ? "text-white"
        : "text-gray-200 group-hover:text-white"
    }`}
    onClick={() => handleSelect(pdf)}
    aria-current={selectedPdfId === pdf.pdfId ? "true" : undefined}
    title={pdf.orignalFilename}
  >
    {pdf.orignalFilename}
  </button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="p-2 rounded-full hover:bg-purple-900/40 transition">
        <BsThreeDots className="text-lg text-gray-400 group-hover:text-white" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="bg-gray-900 text-white min-w-[120px]">
      <DropdownMenuItem
        className="uppercase font-medium flex items-center gap-2 hover:bg-red-900/40"
        onClick={() => deleteSession(pdf.pineconeNamespace)}
      >
        <MdDeleteOutline className="text-red-400" size={22} />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</li>
          ))
        )}
      </ul>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Click a PDF to view summary and chat.
      </div>
    </aside>
  );
}