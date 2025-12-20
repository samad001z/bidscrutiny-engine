import { AlertTriangle, XCircle, Info } from "lucide-react";
import Card from "../common/Card";

export default function RiskFlag({ type, severity, reason, pageNumber, recommendation }) {
  const severityConfig = {
    high: {
      icon: XCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-100 text-red-800"
    },
    medium: {
      icon: AlertTriangle,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800"
    },
    low: {
      icon: Info,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-800"
    }
  };

  const config = severityConfig[severity] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.border} ${config.bg}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {type}
              </h4>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config.badge}`}>
                {severity.toUpperCase()} RISK
              </span>
            </div>
            
            <p className="text-sm text-slate-800 leading-relaxed mb-3">
              {reason || "No description provided"}
            </p>

            {pageNumber && (
              <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                <span className="font-semibold">📄 Evidence Found:</span>
                Page {pageNumber} of submitted document
              </p>
            )}

            {recommendation && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  💡 Recommendation:
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

