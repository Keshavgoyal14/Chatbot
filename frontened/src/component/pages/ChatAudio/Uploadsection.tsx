import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const Uploadsection = ({ setAudioNamespace }: { setAudioNamespace: React.Dispatch<React.SetStateAction<string | null>> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB.");
      return;
    }
    setFile(selected || null);
    setError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an audio file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response =await axios.post("chat-audio/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", withCredentials: true },
      });
      toast.success("Audio uploaded successfully!");
        setAudioNamespace(response.data.namespace);
      console.log(response.data);
    } catch (err: any) {
      // Only show error if it's about file size or selection, not upload failed
      // setError(err.response?.data?.message || "Upload failed.");
    }
    setUploading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-zinc-900 border border-dashed border-purple-400 rounded-2xl shadow-2xl text-white">
      <h2 className="text-2xl font-bold text-purple-400">Upload Audio File</h2>
      <p className="text-sm text-purple-300 mt-1 mb-4">Supported: mp3, wav, m4a, ogg. Max 100MB.</p>

      <form onSubmit={handleUpload} className="space-y-5">
        <label
          htmlFor="audio-upload"
          className={`block w-full text-center border border-purple-400 rounded-lg py-6 px-4 ${
            file ? "text-purple-400" : "text-zinc-300"
          } bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition`}
        >
          {file ? file.name : "Click to select an audio file"}
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {file && (
          <div className="w-full flex justify-center">
            <audio
              controls
              className="w-full rounded-lg border border-purple-400 bg-zinc-800 shadow-md"
              style={{ outline: "none", marginTop: 8 }}
            >
              <source src={URL.createObjectURL(file)} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full py-2 font-semibold rounded-md shadow transition ${
            uploading || !file
              ? "bg-purple-500/75 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-600"
          } text-zinc-900`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {error && (
          <div className="bg-red-800/20 border border-red-500 text-red-400 p-3 rounded-md text-sm font-medium">
            ❌ {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default Uploadsection;