import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import VendorUpload from "../components/upload/VendorUpload";
import Card from "../components/common/Card";
import api from "../services/api";

export default function VendorUploadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    if (location.state?.tender) {
      setSelectedTender(location.state.tender);
    } else {
      fetchAvailableTenders();
    }
  }, [location.state]);

  const fetchAvailableTenders = async () => {
    try {
      // const response = await api.get("/tenders");
      // setTenders(response.data);
      
      // Mock data
      setTenders([
        {
          id: "T001",
          name: "Supply of Office Equipment 2025",
          deadline: "2025-01-15"
        },
        {
          id: "T002",
          name: "IT Infrastructure Upgrade",
          deadline: "2025-01-20"
        }
      ]);
    } catch (error) {
      console.error("Error fetching tenders:", error);
    }
  };

  const handleUpload = async (formData) => {
    try {
      setIsLoading(true);
      await api.post("/upload-vendor", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error uploading vendor bid:", error);
      alert("Failed to submit bid. Please try again.");
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

      {!selectedTender && tenders.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Select a Tender
          </h3>
          <div className="space-y-2">
            {tenders.map((tender) => (
              <button
                key={tender.id}
                onClick={() => setSelectedTender(tender)}
                className="w-full text-left p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                <p className="font-medium text-slate-900">{tender.name}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Deadline: {new Date(tender.deadline).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedTender && (
        <VendorUpload
          tenderId={selectedTender.id}
          tenderName={selectedTender.name}
          onUpload={handleUpload}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
