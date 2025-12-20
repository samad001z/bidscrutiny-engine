import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import ScoreBar from "../components/evaluation/ScoreBar";
import RequirementMatch from "../components/evaluation/RequirementMatch";
import RiskFlag from "../components/evaluation/RiskFlag";
import api from "../services/api";

export default function EvaluationPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      if (!vendorId) {
        console.error("No vendor ID provided");
        setVendor(null);
        return;
      }
      const response = await api.get(`/vendor/${vendorId}`);
      if (response.data && !response.data.error) {
        setVendor(response.data);
      } else {
        console.error("Vendor not found:", response.data.error);
        setVendor(null);
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  const getMockVendorData = () => ({
    id: vendorId,
    name: "TechCorp Solutions Pvt Ltd",
    compliance_score: 92,
    eligibility_score: 95,
    technical_score: 90,
    financial_score: 91,
    status: "eligible",
    fraud_risk: "low",
    submitted_date: "2025-01-05",
    documents: [
      { name: "GST Certificate", provided: true, status: "met", evidence: "Page 1, GST No: 29XXXXX" },
      { name: "PAN Card", provided: true, status: "met", evidence: "Page 2, PAN: ABCDE1234F" },
      { name: "Company Registration", provided: true, status: "met", evidence: "Page 3, CIN: U12345MH2020PTC" },
      { name: "Financial Statements", provided: true, status: "met", evidence: "Pages 4-8" },
      { name: "Technical Proposal", provided: true, status: "met", evidence: "Pages 9-15" },
      { name: "Commercial Proposal", provided: true, status: "met", evidence: "Pages 16-18" },
      { name: "Experience Certificates", provided: true, status: "met", evidence: "Pages 19-22" },
      { name: "Bank Guarantee", provided: false, status: "missing", evidence: null },
      { name: "Quality Certifications", provided: true, status: "met", evidence: "Page 23, ISO 9001:2015" }
    ],
    requirements: [
      {
        category: "Eligibility",
        items: [
          { requirement: "Valid GST Registration", provided: "GST No: 29XXXXX (Valid till 2026)", status: "met", evidence: "Page 1" },
          { requirement: "Company Registration (Min 5 years)", provided: "Registered 2018 (7 years)", status: "met", evidence: "Page 3" },
          { requirement: "Minimum Turnover ₹50L", provided: "₹1.2 Crore (FY 2023-24)", status: "met", evidence: "Page 5" }
        ]
      },
      {
        category: "Technical",
        items: [
          { requirement: "Experience in similar projects (Min 3)", provided: "5 similar projects completed", status: "met", evidence: "Pages 19-22" },
          { requirement: "Technical team size (Min 10)", provided: "15 qualified engineers", status: "met", evidence: "Page 11" },
          { requirement: "Quality certifications", provided: "ISO 9001:2015, ISO 27001", status: "met", evidence: "Page 23" }
        ]
      },
      {
        category: "Financial",
        items: [
          { requirement: "Audited financial statements (Last 3 years)", provided: "FY 2021-22, 2022-23, 2023-24", status: "met", evidence: "Pages 4-8" },
          { requirement: "Bank solvency certificate", provided: "Provided, dated Dec 2024", status: "met", evidence: "Page 7" },
          { requirement: "EMD/Bank Guarantee", provided: "Not provided", status: "missing", evidence: null }
        ]
      }
    ],
    fraud_alerts: [
      {
        type: "Document Verification",
        severity: "low",
        reason: "All documents appear authentic with proper seals and signatures",
        pageNumber: null,
        recommendation: "No immediate action required"
      }
    ],
    ai_explanation: {
      summary: "TechCorp Solutions Pvt Ltd demonstrates strong compliance across eligibility, technical, and financial criteria. The vendor has provided comprehensive documentation with only one missing item (Bank Guarantee).",
      eligibility: "The vendor meets all eligibility requirements with valid GST registration, company age of 7 years (exceeding minimum 5 years), and annual turnover of ₹1.2 Crore (well above ₹50L threshold).",
      technical: "Technical qualifications are excellent with 5 similar completed projects, a team of 15 qualified engineers, and valid ISO certifications including ISO 9001:2015 and ISO 27001.",
      financial: "Financial documentation is comprehensive with audited statements for the required 3 years and a recent bank solvency certificate. However, the mandatory EMD/Bank Guarantee is missing.",
      recommendation: "ELIGIBLE - Subject to submission of Bank Guarantee before contract award. All other criteria are satisfactorily met.",
      risk_assessment: "Low risk. No red flags detected in document authenticity checks."
    }
  });

  if (loading) {
    return <Loader text="Loading vendor evaluation..." />;
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Vendor not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-slate-100 rounded-md"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor Evaluation Detail
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Comprehensive compliance and requirement analysis
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Vendor Profile Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {vendor.name || "Unknown Vendor"}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>ID: {vendor.id || "N/A"}</span>
              <span>•</span>
              <span>Submitted: {vendor.submitted_date ? new Date(vendor.submitted_date).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={
              vendor.status === "eligible" || vendor.status === "Eligible" 
                ? "success" 
                : "danger"
            } className="text-sm px-3 py-1">
              {vendor.status === "eligible" || vendor.status === "Eligible" 
                ? "ELIGIBLE" 
                : "NOT ELIGIBLE"}
            </Badge>
            <p className="text-xs text-slate-600 mt-2">
              Overall Compliance Score
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {vendor.compliance_score}%
            </p>
          </div>
        </div>
      </Card>

      {/* Compliance Scores */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Compliance Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreBar 
            label="Eligibility Criteria" 
            score={vendor.eligibility_score}
            color="blue"
          />
          <ScoreBar 
            label="Technical Compliance" 
            score={vendor.technical_score}
            color="green"
          />
          <ScoreBar 
            label="Financial Compliance" 
            score={vendor.financial_score}
            color="amber"
          />
        </div>
      </Card>

      {/* AI Explanation */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                AI Evaluation Summary
              </h3>
              <p className="text-sm text-slate-700 mt-1">
                Comprehensive analysis by Gemini AI
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-white border border-blue-200 rounded-lg p-5">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">
                Overall Assessment:
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {vendor.ai_explanation?.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Eligibility:
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vendor.ai_explanation?.eligibility}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Technical:
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vendor.ai_explanation?.technical}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Financial:
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vendor.ai_explanation?.financial}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">
                Final Recommendation:
              </p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {vendor.ai_explanation?.recommendation}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Requirements Matching */}
      {vendor.requirements && Array.isArray(vendor.requirements) && vendor.requirements.map((category) => (
        <Card key={category.category} className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {category.category || "Requirements"}
          </h3>
          <div className="space-y-3">
            {Array.isArray(category.items) && category.items.map((item, idx) => (
              <RequirementMatch
                key={idx}
                requirement={item.requirement || "Requirement"}
                provided={item.provided || "N/A"}
                status={item.status || "unknown"}
                evidence={item.evidence || null}
              />
            ))}
          </div>
        </Card>
      ))}

      {/* Fraud & Anomaly Alerts */}
      {vendor.fraud_alerts && Array.isArray(vendor.fraud_alerts) && vendor.fraud_alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Fraud & Anomaly Detection
          </h3>
          <div className="space-y-3">
            {vendor.fraud_alerts.map((alert, idx) => {
              const alertType = typeof alert === 'string' ? "General Alert" : (alert.type || "Alert");
              const alertSeverity = typeof alert === 'string' ? "medium" : (alert.severity || "medium");
              const alertReason = typeof alert === 'string' ? alert : (alert.reason || alert.description || alert.message || "No description provided");
              const alertPage = alert.pageNumber || alert.page_number;
              const alertRecommendation = alert.recommendation;
              
              return (
                <RiskFlag
                  key={idx}
                  type={alertType}
                  severity={alertSeverity}
                  reason={alertReason}
                  pageNumber={alertPage}
                  recommendation={alertRecommendation}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted Documents Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Submitted Documents Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vendor.documents && Array.isArray(vendor.documents) && vendor.documents.map((doc, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                doc.provided
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {doc.provided ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {doc.name || "Document"}
                </p>
                {doc.evidence && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {doc.evidence}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
