import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Download } from "lucide-react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import api from "../services/api";

export default function ComparisonPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/compare-all");
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setVendors(getMockVendors());
    } finally {
      setLoading(false);
    }
  };

  const getMockVendors = () => [
    {
      id: "V001",
      name: "TechCorp Solutions",
      compliance_score: 92,
      eligibility_score: 95,
      technical_score: 90,
      financial_score: 91,
      missing_documents: [],
      fraud_risk: "low",
      status: "eligible",
      key_strengths: ["High turnover", "ISO certified", "5+ years experience"],
      key_weaknesses: []
    },
    {
      id: "V002",
      name: "Global Enterprises",
      compliance_score: 78,
      eligibility_score: 82,
      technical_score: 75,
      financial_score: 77,
      missing_documents: ["Bank Guarantee", "Quality Certifications"],
      fraud_risk: "medium",
      status: "not_eligible",
      key_strengths: ["Good financial standing"],
      key_weaknesses: ["Missing critical documents", "Limited experience"]
    },
    {
      id: "V003",
      name: "Innovation Systems",
      compliance_score: 88,
      eligibility_score: 90,
      technical_score: 87,
      financial_score: 87,
      missing_documents: ["Experience Certificates"],
      fraud_risk: "low",
      status: "eligible",
      key_strengths: ["Strong technical team", "ISO certified"],
      key_weaknesses: ["One missing document"]
    }
  ];

  if (loading) {
    return <Loader text="Loading vendor comparison..." />;
  }

  const categories = [
    { label: "Compliance Score", key: "compliance_score" },
    { label: "Eligibility", key: "eligibility_score" },
    { label: "Technical", key: "technical_score" },
    { label: "Financial", key: "financial_score" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Side-by-Side Vendor Comparison
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Comprehensive comparison across all evaluation criteria
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="grid gap-4" style={{ gridTemplateColumns: `250px repeat(${vendors.length}, 1fr)` }}>
            {/* Header Row */}
            <div className="sticky left-0 bg-slate-50 p-4 border border-slate-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Criteria
              </p>
            </div>
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {vendor.name}
                  </h3>
                  <Badge variant={
                    vendor.status === "eligible" || vendor.status === "Eligible" 
                      ? "success" 
                      : "danger"
                  }>
                    {vendor.status === "eligible" || vendor.status === "Eligible" 
                      ? "ELIGIBLE" 
                      : "NOT ELIGIBLE"}
                  </Badge>
                  <button
                    onClick={() => navigate(`/evaluation/${vendor.id}`)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              </Card>
            ))}

            {/* Score Rows */}
            {categories.map((category) => {
              const maxScore = Math.max(...vendors.map(v => v[category.key] || 0));
              
              return (
                <>
                  <div key={`label-${category.key}`} className="sticky left-0 bg-white p-4 border border-slate-200 rounded-lg">
                    <p className="text-sm font-semibold text-slate-700">
                      {category.label}
                    </p>
                  </div>
                  {vendors.map((vendor) => {
                    const score = vendor[category.key] || 0;
                    const isHighest = score === maxScore;
                    
                    return (
                      <Card key={`${vendor.id}-${category.key}`} className={`p-4 ${
                        isHighest ? "ring-2 ring-green-500 bg-green-50" : ""
                      }`}>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 mb-2">
                            {score}%
                          </p>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                score >= 90 ? "bg-green-600" :
                                score >= 75 ? "bg-blue-600" :
                                score >= 60 ? "bg-amber-500" : "bg-red-600"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          {isHighest && (
                            <p className="text-xs text-green-700 font-semibold mt-2">
                              HIGHEST
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </>
              );
            })}

            {/* Fraud Risk Row */}
            <div className="sticky left-0 bg-white p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">
                Fraud Risk Level
              </p>
            </div>
            {vendors.map((vendor) => (
              <Card key={`${vendor.id}-fraud`} className="p-4">
                <div className="text-center">
                  <Badge variant={
                    vendor.fraud_risk === "high" ? "danger" :
                    vendor.fraud_risk === "medium" ? "warning" : "success"
                  } className="text-sm">
                    {vendor.fraud_risk?.toUpperCase() || "LOW"}
                  </Badge>
                </div>
              </Card>
            ))}

            {/* Missing Documents Row */}
            <div className="sticky left-0 bg-white p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">
                Missing Documents
              </p>
            </div>
            {vendors.map((vendor) => (
              <Card key={`${vendor.id}-docs`} className="p-4">
                <div className="text-center">
                  {vendor.missing_documents?.length > 0 ? (
                    <>
                      <p className="text-lg font-bold text-red-600 mb-1">
                        {vendor.missing_documents.length}
                      </p>
                      <p className="text-xs text-slate-600">
                        {vendor.missing_documents.slice(0, 2).join(", ")}
                        {vendor.missing_documents.length > 2 && "..."}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-green-600 mb-1">
                        0
                      </p>
                      <p className="text-xs text-slate-600">
                        All provided
                      </p>
                    </>
                  )}
                </div>
              </Card>
            ))}

            {/* Key Strengths Row */}
            <div className="sticky left-0 bg-white p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">
                Key Strengths
              </p>
            </div>
            {vendors.map((vendor) => (
              <Card key={`${vendor.id}-strengths`} className="p-4">
                <ul className="text-xs text-slate-700 space-y-1">
                  {vendor.key_strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-600">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

            {/* Key Weaknesses Row */}
            <div className="sticky left-0 bg-white p-4 border border-slate-200 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">
                Key Weaknesses
              </p>
            </div>
            {vendors.map((vendor) => (
              <Card key={`${vendor.id}-weaknesses`} className="p-4">
                {vendor.key_weaknesses?.length > 0 ? (
                  <ul className="text-xs text-slate-700 space-y-1">
                    {vendor.key_weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-red-600">✗</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 text-center">
                    None identified
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {vendors.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-600">No vendors to compare</p>
        </Card>
      )}
    </div>
  );
}
