import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  ArrowUpDown,
  Trophy,
  ThumbsDown,
  FileText,
  Filter
} from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ScoreBar from "../../components/evaluation/ScoreBar";
import api from "../../services/api";

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState("compliance"); // compliance, best, worst, tender
  const [filterStatus, setFilterStatus] = useState("all"); // all, eligible, not_eligible

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/compare-all");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Use mock data for demo if API fails
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    vendors: [
      {
        id: "V001",
        name: "TechCorp Solutions Pvt Ltd",
        compliance_score: 92,
        missing_documents: [],
        fraud_risk: "low",
        status: "eligible",
        eligibility_score: 95,
        technical_score: 90,
        financial_score: 91
      },
      {
        id: "V002",
        name: "Global Enterprises",
        compliance_score: 78,
        missing_documents: ["Bank Guarantee", "Quality Certifications"],
        fraud_risk: "medium",
        status: "not_eligible",
        eligibility_score: 82,
        technical_score: 75,
        financial_score: 77
      },
      {
        id: "V003",
        name: "Innovation Systems Ltd",
        compliance_score: 88,
        missing_documents: ["Experience Certificates"],
        fraud_risk: "low",
        status: "eligible",
        eligibility_score: 90,
        technical_score: 87,
        financial_score: 87
      }
    ],
    summary: {
      total_vendors: 3,
      eligible_vendors: 2,
      flagged_vendors: 1,
      avg_compliance: 86
    }
  });

  if (loading) {
    return <Loader text="Loading dashboard data..." />;
  }

  const stats = data?.summary || {};
  let vendors = data?.vendors || [];

  // Apply filters
  if (filterStatus !== "all") {
    vendors = vendors.filter(v => v.status === filterStatus);
  }

  // Apply sorting
  const sortedVendors = [...vendors].sort((a, b) => {
    switch (sortBy) {
      case "best":
        return (b.compliance_score || 0) - (a.compliance_score || 0);
      case "worst":
        return (a.compliance_score || 0) - (b.compliance_score || 0);
      case "tender":
        return (a.tender_name || "").localeCompare(b.tender_name || "");
      case "compliance":
      default:
        return (b.compliance_score || 0) - (a.compliance_score || 0);
    }
  });

  const eligibleVendors = vendors.filter(v => v.status === "eligible" || v.status === "Eligible");
  const flaggedVendors = vendors.filter(v => v.fraud_risk === "high" || v.fraud_risk === "medium");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Government Evaluator Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Real-time vendor compliance and evaluation overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vendors"
          value={stats.total_vendors || vendors.length}
          subtitle="Submitted bids"
          icon={Users}
        />
        <StatCard
          title="Fully Compliant"
          value={eligibleVendors.length}
          subtitle="Eligible for award"
          icon={CheckCircle}
        />
        <StatCard
          title="Flagged Issues"
          value={flaggedVendors.length}
          subtitle="Require attention"
          icon={AlertTriangle}
        />
        <StatCard
          title="Avg Compliance"
          value={`${stats.avg_compliance || Math.round(vendors.reduce((sum, v) => sum + (v.compliance_score || 0), 0) / vendors.length)}%`}
          subtitle="Overall score"
          icon={TrendingUp}
        />
      </div>

      {/* Compliance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Compliance Summary - Across All Vendors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreBar 
            label="Eligibility Criteria" 
            score={vendors.length > 0 ? Math.round(vendors.reduce((sum, v) => sum + (v.eligibility_score || 0), 0) / vendors.length) : 0}
            color="blue"
          />
          <ScoreBar 
            label="Technical Compliance" 
            score={vendors.length > 0 ? Math.round(vendors.reduce((sum, v) => sum + (v.technical_score || 0), 0) / vendors.length) : 0}
            color="green"
          />
          <ScoreBar 
            label="Financial Compliance" 
            score={vendors.length > 0 ? Math.round(vendors.reduce((sum, v) => sum + (v.financial_score || 0), 0) / vendors.length) : 0}
            color="amber"
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Quick Actions
            </h3>
            <p className="text-sm text-slate-600">
              Search for specific tender bids and analysis
            </p>
          </div>
          <Button onClick={() => navigate("/tender-bids")}>
            <FileText className="w-4 h-4 mr-2" />
            Search Tender Bids
          </Button>
        </div>
      </Card>

      {/* Vendor Comparison Table */}
      <Card>
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Vendor Comparison
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                All submitted bids across tenders
              </p>
            </div>
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-medium text-slate-700">Sort:</span>
              
              <Button
                variant={sortBy === "best" ? "primary" : "outline"}
                onClick={() => setSortBy("best")}
                className="text-xs px-2 py-1"
              >
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Best
              </Button>
              
              <Button
                variant={sortBy === "worst" ? "primary" : "outline"}
                onClick={() => setSortBy("worst")}
                className="text-xs px-2 py-1"
              >
                <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Worst
              </Button>
              
              <Button
                variant={sortBy === "tender" ? "primary" : "outline"}
                onClick={() => setSortBy("tender")}
                className="text-xs px-2 py-1"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Tender
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-medium text-slate-700">Filter:</span>

              <Button
                variant={filterStatus === "all" ? "primary" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="text-xs px-2 py-1"
              >
                All ({data?.vendors?.length || 0})
              </Button>
              
              <Button
                variant={filterStatus === "eligible" ? "primary" : "outline"}
                onClick={() => setFilterStatus("eligible")}
                className="text-xs px-2 py-1"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Eligible
              </Button>
              
              <Button
                variant={filterStatus === "not_eligible" ? "primary" : "outline"}
                onClick={() => setFilterStatus("not_eligible")}
                className="text-xs px-2 py-1"
              >
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Rejected
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Tender ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Vendor
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Score
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Documents
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Risk
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedVendors.map((vendor, index) => (
                <tr 
                  key={vendor.id} 
                  className={`hover:bg-slate-50 transition ${
                    index === 0 && sortBy === "best" ? "bg-green-50" : 
                    index === 0 && sortBy === "worst" ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 && sortBy === "best" 
                        ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-400"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {index === 0 && sortBy === "best" ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-xs font-mono text-blue-600 font-semibold break-all max-w-[200px]">
                      {vendor.tender_id && typeof vendor.tender_id === 'string' ? vendor.tender_id : "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-slate-900 max-w-[150px] truncate">
                      {vendor.name || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {vendor.id && typeof vendor.id === 'string' ? vendor.id.substring(0, 8) : vendor.id || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${
                        vendor.compliance_score >= 80 ? "text-green-600" :
                        vendor.compliance_score >= 60 ? "text-amber-600" :
                        "text-red-600"
                      }`}>
                        {vendor.compliance_score || 0}%
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {Array.isArray(vendor.missing_documents) && vendor.missing_documents.length > 0 ? (
                      <Badge variant="warning" className="text-xs">
                        {vendor.missing_documents.length} missing
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">
                        ✓ Complete
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge 
                      variant={
                        vendor.fraud_risk === "high" ? "danger" : 
                        vendor.fraud_risk === "medium" ? "warning" : "success"
                      }
                      className="text-xs"
                    >
                      {typeof vendor.fraud_risk === 'string' && vendor.fraud_risk === "high" ? "HIGH" :
                       typeof vendor.fraud_risk === 'string' && vendor.fraud_risk === "medium" ? "MED" :
                       "LOW"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge 
                      variant={
                        typeof vendor.status === 'string' && (vendor.status === "eligible" || vendor.status === "Eligible") 
                          ? "success" 
                          : "danger"
                      }
                      className="text-xs"
                    >
                      {typeof vendor.status === 'string' && (vendor.status === "eligible" || vendor.status === "Eligible") 
                        ? "✓" 
                        : "✗"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/evaluation/${vendor.id}`)}
                      className="text-xs px-2 py-1"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedVendors.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-600">
              {filterStatus !== "all" 
                ? `No ${filterStatus === "eligible" ? "eligible" : "rejected"} vendors found`
                : "No vendor submissions yet"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
