import { useSettings } from "../../context/SettingsContext";

export default function MaintenanceMode() {
  const { settings } = useSettings();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-deep) text-(--text-primary) p-6 text-center transition-colors duration-500">
      <div className="max-w-md w-full bg-(--bg-surface) border border-(--border) rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-(--bg-elevated) border border-(--border) flex items-center justify-center">
          <span className="text-3xl">🛠️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-(--gold) mb-2">We'll be back soon!</h1>
          <p className="text-(--text-secondary) text-sm leading-relaxed">
            {settings?.brandName || "Our website"} is currently undergoing scheduled maintenance. 
            We should be back shortly. Thank you for your patience!
          </p>
        </div>
      </div>
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 transition-opacity duration-1000">
        <div className="w-[60vw] h-[60vw] rounded-full bg-(--gold) blur-[150px]"></div>
      </div>
    </div>
  );
}
