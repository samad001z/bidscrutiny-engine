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
      await api.post("/upload-tender", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error uploading tender:", error);
      alert("Failed to upload tender. Please try again.");
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
