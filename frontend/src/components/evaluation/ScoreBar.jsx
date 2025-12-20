export default function ScoreBar({ label, score, maxScore = 100, color = "blue" }) {
  const percentage = (score / maxScore) * 100;
  
  const colorStyles = {
    blue: "bg-blue-700",
    green: "bg-green-600",
    amber: "bg-amber-500",
    red: "bg-red-600"
  };

  const bgColorStyles = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    amber: "bg-amber-100",
    red: "bg-red-100"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">{score}%</span>
      </div>
      <div className={`w-full h-2 rounded-full ${bgColorStyles[color]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
