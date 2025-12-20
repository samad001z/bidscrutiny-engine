import Card from "../common/Card";

export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-600">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${
              trend.positive ? "text-green-700" : "text-red-700"
            }`}>
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-700" />
          </div>
        )}
      </div>
    </Card>
  );
}
