export default function LoadingSpinner({ size = "md", message = "Loading..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 bg-white">
      <div className={`${sizeClasses[size]} border-4 border-(--gold) border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="text-sm text-(--text-muted) animate-pulse">{message}</p>}
    </div>
  );
}