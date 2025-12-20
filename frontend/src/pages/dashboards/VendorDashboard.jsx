import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, CheckCircle, AlertCircle, Upload } from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      // Fetch available tenders
      const tendersResponse = await api.get("/tenders");
      setTenders(tendersResponse.data.tenders || []);
      
      // Fetch my submissions (would need vendor-specific endpoint)
      // For now, use mock data
      setMySubmissions(getMockSubmissions());
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      setTenders(getMockTenders());
      setMySubmissions(getMockSubmissions());
    } finally {
      setLoading(false);
    }
  };

  const getMockTenders = () => [
    {
      id: "T001",
      name: "Supply of Office Equipment 2025",
      description: "Procurement of computers, printers, and office furniture",
      deadline: "2025-01-15",
      status: "open"
    },
    {
      id: "T002",
      name: "IT Infrastructure Upgrade",
      description: "Server hardware and network equipment supply",
      deadline: "2025-01-20",
      status: "open"
    }
  ];

  const getMockSubmissions = () => [
    {
      id: "S001",
      tender_id: "T001",
      tender_name: "Supply of Office Equipment 2025",
      submitted_date: "2025-01-05",
      status: "under_review",
      compliance_preview: {
        score: 88,
        missing_docs: ["Bank Guarantee"]
      }
    }
  ];

  if (loading) {
    return <Loader text="Loading your dashboard..." />;
  }

  const openTenders = tenders.filter(t => t.status === "open");
  const submittedTenderIds = mySubmissions.map(s => s.tender_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Vendor Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          View available tenders and track your submissions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {openTenders.length}
              </p>
              <p className="text-sm text-slate-600">
                Open Tenders
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {mySubmissions.filter(s => s.status === "submitted" || s.status === "under_review").length}
              </p>
              <p className="text-sm text-slate-600">
                Submitted Bids
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {mySubmissions.filter(s => s.status === "under_review").length}
              </p>
              <p className="text-sm text-slate-600">
                Under Review
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Tenders */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Available Tenders
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Open tenders accepting vendor submissions
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {openTenders.map((tender) => {
            const isSubmitted = submittedTenderIds.includes(tender.id);
            const daysLeft = Math.ceil((new Date(tender.deadline) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div key={tender.id} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-semibold text-slate-900">
                        {tender.name}
                      </h4>
                      {isSubmitted && (
                        <Badge variant="success">
                          SUBMITTED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-3">
                      {tender.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(tender.deadline).toLocaleDateString()}
                      </span>
                      <span className={`font-medium ${daysLeft <= 3 ? "text-red-600" : "text-slate-600"}`}>
                        {daysLeft} days left
                      </span>
                    </div>
                  </div>
                  <div>
                    {!isSubmitted ? (
                      <Button
                        onClick={() => navigate("/upload-vendor", { state: { tender } })}
                        variant="primary"
                        className="whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4 inline mr-1" />
                        Submit Bid
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                      >
                        Already Submitted
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {openTenders.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-600">No open tenders available at the moment</p>
          </div>
        )}
      </Card>

      {/* My Submissions */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            My Submissions
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Track the status of your submitted bids
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {mySubmissions.map((submission) => (
            <div key={submission.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-slate-900 mb-2">
                    {submission.tender_name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span>
                      Submitted: {new Date(submission.submitted_date).toLocaleDateString()}
                    </span>
                    <Badge variant={
                      submission.status === "under_review" ? "warning" :
                      submission.status === "approved" ? "success" : "default"
                    }>
                      {submission.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {submission.compliance_preview && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Compliance Preview
                      </p>
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-sm text-slate-600">Score: </span>
                          <span className="text-lg font-bold text-slate-900">
                            {submission.compliance_preview.score}%
                          </span>
                        </div>
                        {submission.compliance_preview.missing_docs?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-xs text-slate-700">
                                <span className="font-semibold">Missing: </span>
                                {submission.compliance_preview.missing_docs.join(", ")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {mySubmissions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-600">You haven't submitted any bids yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Browse available tenders above to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
