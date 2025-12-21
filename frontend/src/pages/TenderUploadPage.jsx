import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import TenderUpload from "../components/upload/TenderUpload";
import api from "../services/api";

export default function TenderUploadPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (formData) => {
    try {
      setIsLoading(true);
      
      // Log upload attempt
      console.log("Uploading tender...", {
        name: formData.get("name"),
        description: formData.get("description"),
        file: formData.get("file")?.name,
        baseURL: api.defaults.baseURL
      });
      
      const response = await api.post("/upload-tender", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 300000 
      });
      
      console.log("Upload successful:", response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error uploading tender:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isNetworkError: !error.response,
        baseURL: api.defaults.baseURL
      });
      
      let errorMsg = "Failed to upload tender. ";
      
      if (!error.response) {
        if (error.code === "ECONNABORTED") {
          errorMsg = "Request timed out. The server is processing your tender through OCR + AI:\n\n" +
                     "• Optical Character Recognition (OCR)\n" +
                     "• Gemini AI Extraction\n\n" +
                     "This can take 2-5 minutes. Processing takes time!\n\n" +
                     "Make sure:\n" +
                     "1. Backend is running\n" +
                     "2. GEMINI_API_KEY is valid\n" +
                     "3. Firebase is configured\n\n" +
                     "Try again - the AI is working for you!";
        } else {
          errorMsg += "Backend server is not responding. Please check the connection and try again.";
        }
      } else if (error.response.status === 400) {
        errorMsg += "Invalid file or form data. Please check the file and try again.";
      } else if (error.response.status === 413) {
        errorMsg += "File is too large. Maximum 50MB allowed.";
      } else if (error.response.status === 500) {
        errorMsg += `Server error: ${error.response.data?.detail || 'Unknown error'}`;
      }
      
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tender Uploaded Successfully
        </h2>
        <p className="text-slate-600">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Upload New Tender
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload tender document for AI-powered requirement extraction
        </p>
      </div>

      <TenderUpload onUpload={handleUpload} isLoading={isLoading} />
    </div>
  );
}
