import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { SERVER_URL } from "../services/api";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function AboutUs() {
  const { settings } = useSettings();

  const getUrl = (path) => resolveMediaUrl(path, SERVER_URL);

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-(--bg-deep) pb-20">
      {/* ── HERO SECTION ── */}
      <section className="relative w-full h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        {settings.aboutUsHeroImage && (
          <>
            <div className="absolute inset-0 z-0">
              <img
                src={getUrl(settings.aboutUsHeroImage)}
                alt="About Us Hero"
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 z-0 bg-black/60" />
          </>
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-(--gold) font-semibold tracking-[0.2em] uppercase text-sm mb-4">
              {settings.aboutUsHeroSubtitle || "Redefining Streetwear in Pakistan"}
            </p>
            <h1 className="text-white font-display text-5xl sm:text-7xl font-bold leading-tight drop-shadow-lg">
              {settings.aboutUsHeroTitle || "Our Story"}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── BRAND STORY SECTION ── */}
      <section className="container-custom py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-(--gold)"></span>
              <span className="text-(--gold) font-bold tracking-widest uppercase text-xs">The Beginning</span>
            </div>
            <h2 className="text-(--text-primary) font-display text-4xl sm:text-5xl font-bold leading-tight">
              {settings.aboutUsStoryTitle || "How It All Started"}
            </h2>
            <div className="space-y-4 text-(--text-secondary) text-lg leading-relaxed">
              <p>{settings.aboutUsStoryText1 || "Urban Thread started with a simple idea: premium streetwear shouldn't be a luxury imported from abroad."}</p>
              <p>{settings.aboutUsStoryText2 || "We wanted to create something that represents the raw, unfiltered energy of our streets, combining global trends with local culture."}</p>
            </div>
            <div className="pt-6">
               <Link to="/shop" className="btn-gold inline-flex items-center gap-2 px-8 py-4 text-sm tracking-wider uppercase">
                 Explore Collection <FiArrowRight />
               </Link>
            </div>
          </motion.div>

          {settings.aboutUsStoryImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-(--border)">
                <img
                  src={getUrl(settings.aboutUsStoryImage)}
                  alt="Brand Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-(--gold)/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-(--gold)/10 rounded-full blur-3xl -z-0"></div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── MISSION SECTION ── */}
      <section className="bg-(--bg-surface) py-20 sm:py-32 relative overflow-hidden">
         {/* Decorative Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-(--gold)/5 blur-[120px]"></div>
           <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-(--gold)/5 blur-[120px]"></div>
         </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {settings.aboutUsMissionImage && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <div className="aspect-square rounded-full overflow-hidden shadow-2xl border-8 border-(--bg-card) p-2 bg-gradient-to-tr from-(--gold) to-(--bg-deep)">
                  <img
                    src={getUrl(settings.aboutUsMissionImage)}
                    alt="Our Mission"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-(--gold)"></span>
                <span className="text-(--gold) font-bold tracking-widest uppercase text-xs">Our Purpose</span>
              </div>
              <h2 className="text-(--text-primary) font-display text-4xl sm:text-5xl font-bold leading-tight">
                {settings.aboutUsMissionTitle || "Our Mission"}
              </h2>
              <p className="text-(--text-secondary) text-xl sm:text-2xl font-light italic leading-relaxed border-l-4 border-(--gold) pl-6 py-2">
                "{settings.aboutUsMissionText || "To empower the youth with clothing that speaks louder than words. Quality fabrics, bold designs, and zero compromises."}"
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  "Premium Quality Fabrics",
                  "Authentic Streetwear Designs",
                  "Made for the Urban Culture"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-(--text-primary) font-medium">
                    <FiCheckCircle className="text-(--gold) flex-shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
