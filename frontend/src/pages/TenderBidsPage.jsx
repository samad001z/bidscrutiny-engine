import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import {
  Search,
  TrendingDown,
  AlertTriangle,
  Award,
  FileText,
  Download,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import ScoreBar from "../components/evaluation/ScoreBar";
import Loader from "../components/common/Loader";

export default function TenderBidsPage() {
  const [tenderId, setTenderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!tenderId.trim()) {
      setError("Please enter a tender ID");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await axios.get(`/tender/${tenderId}/bids`);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setData(response.data);
      }
    } catch (err) {
      setError("Failed to fetch tender bids. Please check the tender ID.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (vendorId, vendorName) => {
    try {
      const response = await axios.get(`/vendor/${vendorId}/report`);
      const data = response.data;
      
      // Generate PDF content
      let pdfContent = `
=================================================================
              BIDSCRUTINY ENGINE - VENDOR EVALUATION REPORT
=================================================================

Report Generated: ${new Date().toLocaleString()}

=================================================================
                          VENDOR INFORMATION
=================================================================

Vendor Name:        ${data.vendor_name || "N/A"}
Vendor ID:          ${data.vendor_id || "N/A"}
Tender ID:          ${data.tender_id || "N/A"}
Tender Name:        ${data.tender_name || "N/A"}
Submission Date:    ${data.submitted_at || "N/A"}

=================================================================
                      OVERALL ASSESSMENT
=================================================================

Final Status:       ${data.overall_status || "N/A"}
Compliance Score:   ${data.compliance_score || 0}%
Fraud Score:        ${data.fraud_score || 0}%

=================================================================
                      DETAILED SCORES
=================================================================

• Eligibility Score:    ${data.scores?.eligibility || 0}%
• Technical Score:      ${data.scores?.technical || 0}%
• Financial Score:      ${data.scores?.financial || 0}%

=================================================================
                      COMPANY INFORMATION
=================================================================

Company Name:       ${data.company_info?.name || "N/A"}
Address:            ${data.company_info?.address || "N/A"}
GST Number:         ${data.company_info?.gst_number || "N/A"}
PAN Number:         ${data.company_info?.pan_number || "N/A"}

=================================================================
                      FINANCIAL INFORMATION
=================================================================

${data.financial_info ? Object.entries(data.financial_info).map(([key, value]) => 
  `• ${key.replace(/_/g, " ").toUpperCase()}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
).join("\n") : "No financial information available"}

=================================================================
                      DOCUMENT CHECKLIST
=================================================================

${data.documents && Array.isArray(data.documents) ? 
  data.documents.map((doc, idx) => 
    `${idx + 1}. ${typeof doc === 'string' ? doc : doc.name || "Document"} - ${doc.status || "N/A"}`
  ).join("\n") : "No documents listed"}

${data.missing_documents && Array.isArray(data.missing_documents) && data.missing_documents.length > 0 ? `
⚠️ MISSING DOCUMENTS:
${data.missing_documents.map((doc, idx) => `   ${idx + 1}. ${doc}`).join("\n")}
` : ""}

=================================================================
                      REQUIREMENTS ANALYSIS
=================================================================

${data.requirements && Array.isArray(data.requirements) ? 
  data.requirements.map((req, idx) => 
    `${idx + 1}. ${typeof req === 'string' ? req : req.requirement || "Requirement"}
   Status: ${req.status || "N/A"}
   Evidence: ${req.evidence || "N/A"}
   ${req.reasoning ? `Reasoning: ${req.reasoning}` : ""}`
  ).join("\n\n") : "No requirements analyzed"}

=================================================================
                      FRAUD ANALYSIS
=================================================================

Risk Level:         ${data.fraud_analysis?.risk_level?.toUpperCase() || "N/A"}
Signature Status:   ${data.fraud_analysis?.signature_status || "N/A"}

${data.fraud_analysis?.anomalies && Array.isArray(data.fraud_analysis.anomalies) && data.fraud_analysis.anomalies.length > 0 ? `
ANOMALIES DETECTED:
${data.fraud_analysis.anomalies.map((anomaly, idx) => 
  `\n${idx + 1}. ${typeof anomaly === 'string' ? anomaly : anomaly.description || anomaly}${anomaly.page_number ? ` (Page ${anomaly.page_number})` : ""}`
).join("\n")}
` : "\n✓ No anomalies detected"}

=================================================================
                      AI REASONING & RECOMMENDATION
=================================================================

${data.ai_reasoning ? 
  Object.entries(data.ai_reasoning).map(([key, value]) => 
    `${key.replace(/_/g, " ").toUpperCase()}:\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}\n`
  ).join("\n") : "No AI reasoning available"}

=================================================================
                          END OF REPORT
=================================================================
`;

      // Create downloadable text file
      const blob = new Blob([pdfContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${vendorName.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download report");
      console.error(err);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return "danger";
    if (severity === "medium") return "warning";
    return "info";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          View Tender Bids
        </h1>
        <p className="text-slate-600 mt-2">
          Enter a tender ID to view all submitted bids with rankings and fraud analysis
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tender ID
            </label>
            <input
              type="text"
              value={tenderId}
              onChange={(e) => setTenderId(e.target.value)}
              placeholder="Enter tender ID (e.g., TNDR_12345)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              <Search className="w-5 h-5 mr-2" />
              Search Bids
            </Button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Tender Info */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {data.tender_name || "Unknown Tender"}
                </h2>
                <p className="text-slate-600 mt-1">{data.tender_description || "No description"}</p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">
                      Total Bids: <strong>{data.total_bids || 0}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">
                      Eligible: <strong>{data.eligible_bids || 0}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recommended Winner */}
          {data.recommended_winner && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-8 h-8 text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900">
                    Recommended Winner
                  </h3>
                  <p className="text-green-700 mt-1">
                    {data.recommended_winner.reasoning || "No reasoning available"}
                  </p>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-sm text-green-600">Vendor</p>
                      <p className="font-bold text-green-900">
                        {data.recommended_winner.vendor_name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Quoted Price</p>
                      <p className="font-bold text-green-900">
                        ₹{(data.recommended_winner.quoted_price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Compliance</p>
                      <p className="font-bold text-green-900">
                        {data.recommended_winner.compliance_score || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Fraud Flags */}
          {data.fraud_flags && data.fraud_flags.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="w-8 h-8 text-red-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-4">
                    ⚠️ Fraud Alerts Detected
                  </h3>
                  <div className="space-y-3">
                    {data.fraud_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-red-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className={`w-5 h-5 ${
                                flag.severity === "high"
                                  ? "text-red-600"
                                  : "text-amber-600"
                              }`}
                            />
                            <Badge variant={getSeverityColor(flag.severity)}>
                              {(flag.severity || "unknown").toUpperCase()}
                            </Badge>
                          </div>
                          <Badge variant="outline">
                            {(flag.type || "unknown").replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-700 mb-2">{flag.reasoning || "No reasoning"}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Info className="w-4 h-4" />
                          <span>
                            <strong>Vendors:</strong>{" "}
                            {Array.isArray(flag.vendors) ? flag.vendors.join(" & ") : "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          <strong>Value:</strong> {flag.value || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Bids List */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              All Submitted Bids (Ranked by Compliance Score)
            </h3>
            <div className="space-y-4">
              {Array.isArray(data.bids) && data.bids.map((bid) => (
                <Card
                  key={bid.vendor_id}
                  className={
                    bid.rank === 1 && bid.status === "eligible"
                      ? "border-green-300 bg-green-50"
                      : ""
                  }
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                          bid.rank === 1
                            ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-400"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        #{bid.rank || 0}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-slate-900">
                            {bid.vendor_name || "Unknown Vendor"}
                          </h4>
                          {bid.status === "eligible" ? (
                            <Badge variant="success">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Eligible
                            </Badge>
                          ) : (
                            <Badge variant="danger">
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          Vendor ID: {bid.vendor_id}
                        </p>
                        <p className="text-sm text-slate-600">
                          Submitted: {bid.submitted_at || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/evaluation/${bid.vendor_id}`)
                        }
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleDownloadReport(bid.vendor_id, bid.vendor_name)
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Compliance Score
                      </p>
                      <ScoreBar
                        score={bid.compliance_score}
                        label="Overall"
                        showLabel={false}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Eligibility
                      </p>
                      <ScoreBar
                        score={bid.eligibility_score}
                        label="Eligibility"
                        showLabel={false}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Technical</p>
                      <ScoreBar
                        score={bid.technical_score}
                        label="Technical"
                        showLabel={false}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Financial</p>
                      <ScoreBar
                        score={bid.financial_score || 0}
                        label="Financial"
                        showLabel={false}
                      />
                    </div>
                  </div>

                  {/* Price and Fraud Score */}
                  <div className="flex gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-slate-600">Quoted Price</p>
                        <p className="font-bold text-slate-900">
                          {bid.quoted_price && bid.quoted_price > 0
                            ? `₹${Number(bid.quoted_price).toLocaleString()}`
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-slate-600">Fraud Score</p>
                        <p className="font-bold text-slate-900">
                          {bid.fraud_score || 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Missing Documents */}
                  {Array.isArray(bid.missing_documents) &&
                    bid.missing_documents.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-900 mb-2">
                          ⚠️ Missing Documents:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {bid.missing_documents.map((doc, idx) => (
                            <Badge key={idx} variant="warning">
                              {typeof doc === 'string' ? doc : "Document"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Fraud Alerts */}
                  {Array.isArray(bid.fraud_alerts) && bid.fraud_alerts.length > 0 && (
                    <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-bold text-red-900">
                          🚨 Fraud & Compliance Alerts
                        </p>
                      </div>
                      <div className="space-y-3 ml-8">
                        {bid.fraud_alerts.map((alert, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-md border border-red-200">
                            <p className="text-sm font-semibold text-red-800 mb-1">
                              Alert #{idx + 1}
                            </p>
                            <p className="text-sm text-red-700 leading-relaxed">
                              {typeof alert === 'string' ? alert : 
                               alert.description || alert.reason || alert.message || "No description available"}
                            </p>
                            {alert.page_number && (
                              <p className="text-xs text-red-600 mt-1">
                                📄 Reference: Page {alert.page_number}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
