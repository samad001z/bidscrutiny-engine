import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - App Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              BidScrutiny Engine
            </h1>
            <p className="text-xs text-slate-600">
              AI-Powered Tender Evaluation System
            </p>
          </div>
        </div>

        {/* Right - Role Badge & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-600 font-medium">
              Logged in as
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {role === "government" ? "Government Evaluator" : "Vendor (Bidder)"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
