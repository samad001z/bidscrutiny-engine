export default function Button({ 
  children, 
  onClick, 
  variant = "primary", 
  type = "button",
  disabled = false,
  className = "" 
}) {
  const baseStyles = "px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-700 text-white hover:bg-blue-800 disabled:hover:bg-blue-700",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:hover:bg-slate-200",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:hover:bg-white",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
