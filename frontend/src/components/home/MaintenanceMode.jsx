import { useSettings } from "../../context/SettingsContext";

export default function MaintenanceMode() {
  const { settings } = useSettings();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
      <div className="max-w-md w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-3xl p-8 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-3xl">🛠️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-[#c9a84c] mb-2">We'll be back soon!</h1>
          <p className="text-[#999] text-sm leading-relaxed">
            {settings?.brandName || "Our website"} is currently undergoing scheduled maintenance. 
            We should be back shortly. Thank you for your patience!
          </p>
        </div>
      </div>
    </div>
  );
}
