import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// Upload function calls backend API at dynamic URL
async function uploadResume(file) {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/resume/upload/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
  return response.json();
}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxFileSizeMB = 5;
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validateFile = (file) => {
    if (!file) return false;
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PDF, DOC, DOCX allowed.");
      return false;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds ${maxFileSizeMB} MB.`);
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!validateFile(file)) return;
    setLoading(true);
    try {
      await uploadResume(file);
      toast.success("File uploaded successfully.");
      setFile(null);
    } catch (err) {
      toast.error("Failed to upload. Please try again.");
    }
    setLoading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (validateFile(droppedFile)) setFile(droppedFile);
    e.dataTransfer.clearData();
  };

  const onChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (validateFile(selectedFile)) setFile(selectedFile);
  };

  return (
    <>
      <Toaster position="top-right" />
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex justify-center items-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 space-y-8 hover:scale-[1.02] transition-transform duration-300">
          <header className="text-center">
            <h1 className="text-5xl font-extrabold text-blue-700 mb-2">
              Upload Your Resume
            </h1>
            <p className="text-lg text-blue-600 opacity-80">
              Supported formats: PDF, DOC, DOCX (Max 5 MB)
            </p>
          </header>
          <form
            onSubmit={handleUpload}
            className="flex flex-col gap-6"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={onDrop}
          >
            <label
              htmlFor="file-upload"
              className={`relative flex flex-col items-center justify-center border-4 border-dashed rounded-3xl p-16 cursor-pointer text-center transition-colors duration-300 ${
                dragOver ? "border-blue-600 bg-blue-50" : "border-blue-400 bg-blue-100"
              } hover:border-blue-600 hover:bg-blue-50`}
            >
              <svg
                className="w-20 h-20 text-blue-600 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1"></path>
                <path d="M12 12v8"></path>
                <path d="M8 16l4 4 4-4"></path>
              </svg>
              <span className="text-lg font-semibold text-blue-700">
                {file ? file.name : "Drag & drop a file or click to browse"}
              </span>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={onChange}
                disabled={loading}
              />
            </label>

            {file && (
              <div className="flex justify-between items-center text-blue-700">
                <p className="font-medium">{file.name}</p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={loading}
                  className="text-red-600 hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 text-white py-4 rounded-3xl font-bold text-xl shadow-lg hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
