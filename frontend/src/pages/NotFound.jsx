import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiArrowRight } from "react-icons/fi";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--bg-deep)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="font-display text-[140px] leading-none font-bold gold-text opacity-20">404</div>
        <h1 className="font-display text-3xl font-bold -mt-8" style={{ color: "var(--text-primary)" }}>Page Not Found</h1>
        <p className="max-w-sm" style={{ color: "var(--text-muted)" }}>
          Yeh page exist nahi karta. Shayad link galat hai.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate("/")} className="btn-gold">
            <FiHome /> Go Home
          </button>
          <button onClick={() => navigate("/shop")} className="btn-outline">
            Shop <FiArrowRight />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
