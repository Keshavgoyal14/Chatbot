
import { useState } from 'react';
import {useDropzone} from 'react-dropzone';
import { FaDropbox,FaSpinner } from "react-icons/fa6";
import axios from 'axios';
import { toast } from 'sonner';
function PdfUpload({ handleUploadSuccess }: { handleUploadSuccess: () => void }) {
  const [uploading,setUploading]=useState(false);
 const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: async(acceptedFiles) => {
        if(!acceptedFiles[0]) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", acceptedFiles[0]);
        try {
          await axios.post("/chat-pdf/upload",formData,{headers:{"Content-Type":"multipart/form-data"},withCredentials:true});
          setUploading(false);
          handleUploadSuccess();
          toast.success("PDF uploaded successfully"); 
        } catch (error) {
          setUploading(false);
          toast.error("PDF upload failed");
          console.error("Error uploading PDF:", error);
        }
    },
  });
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition ${
        isDragActive ? "border-purple-600 bg-purple-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {uploading? (
        <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-purple-600 text-3xl mb-2" />
        </div>
      ) : isDragActive ? (
        <div className='flex flex-row gap-2 ml-[30%] mr-[30%]'><FaDropbox  size={20} className='mt-1' /> <p> Drop the PDF here ...</p></div>
        
      ) : (
        <div className='flex flex-row gap-2 ml-[30%] mr-[30%] '><FaDropbox size={20} className='mt-1' /> <p> Drag & drop a PDF here, or click to select</p></div>
       
      )}
    </div>
  );
}

export default PdfUpload