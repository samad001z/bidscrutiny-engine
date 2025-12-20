import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function RequirementMatch({ requirement, provided, status, evidence }) {
  const statusConfig = {
    met: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200"
    },
    partial: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200"
    },
    missing: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`border ${config.border} ${config.bg} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            {requirement}
          </h4>
          <p className="text-sm text-slate-700 mb-2">
            <span className="font-medium">Provided: </span>
            {provided || "Not provided"}
          </p>
          {evidence && (
            <p className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
              <span className="font-medium">Evidence: </span>
              {evidence}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
