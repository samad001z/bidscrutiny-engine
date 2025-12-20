import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Building2, Store, ShieldCheck } from "lucide-react";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!selectedRole) return;
    loginAs(selectedRole);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Top government accent bar */}
      <div className="w-full h-1.5 bg-blue-700" />

      {/* Main content */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
            <ShieldCheck className="text-blue-700 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            BidScrutiny Engine
          </h1>
          <p className="mt-2 text-slate-700 text-sm">
            AI-Powered Tender Evaluation & Vendor Compliance System
          </p>
          <p className="text-slate-600 text-sm">
            Secure Gateway for Procurement Integrity
          </p>
        </div>

        {/* Role selection container */}
        <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-xl shadow-md p-8">
          <h2 className="text-xs font-semibold tracking-widest text-slate-600 text-center mb-6">
            SELECT USER ROLE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Government Evaluator */}
            <button
              onClick={() => setSelectedRole("government")}
              className={`relative border rounded-lg p-6 text-left transition
                ${
                  selectedRole === "government"
                    ? "border-blue-700 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white border rounded-md">
                  <Building2 className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Government Evaluator
                  </h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Access tender submissions, compliance reports, and AI-driven
                    evaluation tools.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-blue-700">
                    AUTHORIZED PERSONNEL ONLY
                  </p>
                </div>
              </div>

              <span className="absolute top-4 right-4 w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center">
                {selectedRole === "government" && (
                  <span className="w-2 h-2 rounded-full bg-blue-700" />
                )}
              </span>
            </button>

            {/* Vendor */}
            <button
              onClick={() => setSelectedRole("vendor")}
              className={`relative border rounded-lg p-6 text-left transition
                ${
                  selectedRole === "vendor"
                    ? "border-blue-700 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white border rounded-md">
                  <Store className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Vendor</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Submit proposals, manage certifications, upload documents,
                    and track tender status updates.
                  </p>
                </div>
              </div>

              <span className="absolute top-4 right-4 w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center">
                {selectedRole === "vendor" && (
                  <span className="w-2 h-2 rounded-full bg-blue-700" />
                )}
              </span>
            </button>
          </div>

          {/* Proceed button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleProceed}
              disabled={!selectedRole}
              className={`px-8 py-3 rounded-md text-sm font-semibold
                ${
                  selectedRole
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
            >
              Proceed to Authentication →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-500 max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span className="font-semibold tracking-wide">
              OFFICIAL SECURE SYSTEM
            </span>
          </div>
          <p>
            System usage is monitored for security and audit purposes.
            Unauthorized access is prohibited and subject to prosecution.
          </p>
          <p className="mt-2">
            System Status &nbsp;•&nbsp; Help Desk &nbsp;•&nbsp; v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
