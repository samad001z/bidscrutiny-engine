import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

import VendorUpload from "../components/upload/VendorUpload";
import Card from "../components/common/Card";
import api from "../services/api";

export default function VendorUploadPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const [selectedTender, setSelectedTender] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(false);

  useEffect(() => {
    if (location.state?.tender) {
      setSelectedTender(location.state.tender);
    } else {
      fetchAvailableTenders();
    }
  }, [location.state]);

  // 🔹 Fetch tenders dynamically from backend
  const fetchAvailableTenders = async () => {
    try {
      setLoadingTenders(true);

      const response = await api.get("/tenders");

      if (response.data?.tenders) {
        setTenders(response.data.tenders);
      } else {
        setTenders([]);
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
      toast.error("Failed to load tenders. Please try again.");
    } finally {
      setLoadingTenders(false);
    }
  };

  const handleUpload = async (formData) => {
    try {
      setIsLoading(true);

      console.log("Uploading vendor bid...", {
        vendor_name: formData.get("vendor_name"),
        tender_id: formData.get("tender_id"),
        file: formData.get("file")?.name,
        baseURL: api.defaults.baseURL
      });

      const response = await api.post("/upload-vendor", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 300000 // 5 minutes
      });

      // 🔁 DUPLICATE / REJECTED BID
      if (response.data?.vendor_result?.status === "rejected") {
        toast.error("You have already uploaded this bid for this tender");
        setUploaded(true);
        return;
      }

      // ✅ SUCCESS
      toast.success("Bid submitted successfully");
      setUploaded(true);
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Error uploading vendor bid:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isNetworkError: !error.response,
        baseURL: api.defaults.baseURL
      });

      let errorMsg = "Failed to submit bid. ";

      if (!error.response) {
        if (error.code === "ECONNABORTED") {
          errorMsg =
            "Request timed out. The server is processing your bid through multiple AI pipelines:\n\n" +
            "• OCR (Optical Character Recognition)\n" +
            "• Fraud Detection Analysis\n" +
            "• Compliance Comparison\n" +
            "• AI Reasoning & Scoring\n\n" +
            "This can take 2–5 minutes.\n\n" +
            "Please ensure backend, Gemini API, and Firebase are running.";
        } else {
          errorMsg +=
            "Backend server is not responding. Please check the connection.";
        }
      } else if (error.response.status === 400) {
        errorMsg += `${error.response.data?.error || "Invalid form data"}.`;
      } else if (error.response.status === 413) {
        errorMsg += "File too large. Maximum 50MB allowed.";
      } else if (error.response.status === 500) {
        errorMsg +=
          `Server error: ${error.response.data?.detail || "Unknown error"}`;
      }

      toast.error(errorMsg);
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
          Bid Submitted Successfully
        </h2>
        <p className="text-slate-600 mb-1">
          Your submission is now under AI evaluation
        </p>
        <p className="text-sm text-slate-500">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Submit Vendor Bid
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload your bid document for AI-powered compliance evaluation
        </p>
      </div>

      {!selectedTender && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Select a Tender
          </h3>

          {loadingTenders ? (
            <p className="text-sm text-slate-500">Loading tenders...</p>
          ) : tenders.length === 0 ? (
            <p className="text-sm text-slate-500">
              No open tenders available at the moment.
            </p>
          ) : (
            <div className="space-y-2">
              {tenders.map((tender) => (
                <button
                  key={tender.id}
                  onClick={() => setSelectedTender(tender)}
                  className="w-full text-left p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  <p className="font-medium text-slate-900">
                    {tender.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Deadline:{" "}
                    {tender.deadline
                      ? new Date(tender.deadline).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {selectedTender && (
        <VendorUpload
          tenderId={selectedTender.id}
          tenderName={selectedTender.name}
          onUpload={handleUpload}
          isLoading={isLoading}
          disabled={uploaded}
        />
      )}
    </div>
  );
}
