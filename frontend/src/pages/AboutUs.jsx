import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { SERVER_URL } from "../services/api";
import { FiArrowRight, FiCheckCircle, FiInstagram, FiTwitter, FiLinkedin, FiUser } from "react-icons/fi";

export default function AboutUs() {
    const { settings } = useSettings();

    const getUrl = (path) => resolveMediaUrl(path, SERVER_URL);

    if (!settings) return null;

    const founders = [
        {
            name: settings.founder1Name || "Founder One",
            role: settings.founder1Role || "Co-Founder",
            bio: settings.founder1Bio || "Passionate about bringing authentic Pakistani streetwear to the global stage.",
            image: settings.founder1Image
        },
        {
            name: settings.founder2Name || "Founder Two",
            role: settings.founder2Role || "Co-Founder",
            bio: settings.founder2Bio || "Dedicated to quality craftsmanship and innovative urban designs.",
            image: settings.founder2Image
        }
    ];

    return (
        <div className="min-h-screen bg-(--bg-deep) pb-20 transition-colors duration-500">
            {/* ── HERO SECTION ── */}
            <section className="relative w-full h-[50vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] flex items-center justify-center overflow-hidden">
                {settings.aboutUsHeroImage ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <img
                                src={getUrl(settings.aboutUsHeroImage)}
                                alt="About Us Hero"
                                className="w-full h-full object-cover object-center scale-105"
                            />
                        </div>
                        {/* Adaptive Overlay: Lighter/Gold-ish in light mode, Dark/Deep in dark mode */}
                        <div className="absolute inset-0 z-0 bg-linear-to-b from-white/40 via-white/20 to-(--bg-deep) dark:from-black/80 dark:via-black/50 dark:to-(--bg-deep)" />
                    </>
                ) : (
                    <div className="absolute inset-0 z-0 bg-linear-to-br from-(--bg-surface) to-(--bg-deep)" />
                )}

                <div className="relative z-10 text-center px-3 sm:px-4 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full border border-(--gold)/30 bg-(--gold)/10 text-(--gold) text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold mb-4 sm:mb-6 backdrop-blur-sm">
                            Established 2020
                        </span>
                        <h1 className="text-(--text-primary) font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4 sm:mb-6 drop-shadow-sm dark:drop-shadow-2xl">
                            {settings.aboutUsHeroTitle || "Our Story"}
                        </h1>
                        <p className="text-(--text-secondary) text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide italic px-2">
                            {settings.aboutUsHeroSubtitle || "A journey of two visionaries redefining the streets of Pakistan."}
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-(--gold)"
                >
                    <div className="w-px h-16 bg-linear-to-b from-transparent via-(--gold) to-transparent mx-auto" />
                </motion.div>
            </section>

            {/* ── THE DUO STORY ── */}
            <section className="container-custom py-16 sm:py-24 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-7 space-y-6 sm:space-y-8"
                    >
                        <div className="space-y-3 sm:space-y-4">
                            <h2 className="text-(--text-primary) font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                {settings.aboutUsStoryTitle || "The Vision of Two"}
                            </h2>
                            <div className="w-20 sm:w-24 h-1 bg-(--gold) rounded-full" />
                        </div>

                        <div className="space-y-4 sm:space-y-6 text-(--text-secondary) text-base sm:text-lg md:text-xl leading-relaxed font-light">
                            <p className="first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-display first-letter:text-(--gold) first-letter:mr-2 sm:first-letter:mr-3 first-letter:float-left">
                                {settings.aboutUsStoryText1 || "Urban Thread wasn't just built on fabric; it was built on a friendship and a shared obsession for street culture. What started as late-night discussions between two friends in Lahore has now evolved into a movement."}
                            </p>
                            <p>
                                {settings.aboutUsStoryText2 || "We believed that the streets of Pakistan had a story to tell—one that global fashion was missing. Together, we set out to create a brand that speaks the language of the youth, blending high-end craftsmanship with the raw energy of urban life."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-2 sm:pt-4">
                            <div>
                                <p className="text-(--gold) text-2xl sm:text-3xl md:text-4xl font-display font-bold">50k+</p>
                                <p className="text-(--text-muted) text-xs sm:text-sm uppercase tracking-widest mt-1">Happy Customers</p>
                            </div>
                            <div>
                                <p className="text-(--gold) text-2xl sm:text-3xl md:text-4xl font-display font-bold">100%</p>
                                <p className="text-(--text-muted) text-xs sm:text-sm uppercase tracking-widest mt-1">Made in Pakistan</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="relative z-10 aspect-3/4 sm:aspect-4/5 rounded-2xl sm:rounded-4xl overflow-hidden border border-(--border) shadow-2xl group">
                            {settings.aboutUsStoryImage ? (
                                <img src={getUrl(settings.aboutUsStoryImage)} alt="Story" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-(--bg-card) flex items-center justify-center text-(--text-muted) text-sm sm:text-base">Brand Story Image</div>
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 sm:-top-10 -right-6 sm:-right-10 w-24 sm:w-40 h-24 sm:h-40 border-t-2 border-r-2 border-(--gold)/30 rounded-tr-2xl sm:rounded-tr-[3rem] z-0" />
                        <div className="absolute -bottom-6 sm:-bottom-10 -left-6 sm:-left-10 w-24 sm:w-40 h-24 sm:h-40 border-b-2 border-l-2 border-(--gold)/30 rounded-bl-2xl sm:rounded-bl-[3rem] z-0" />
                    </motion.div>
                </div>
            </section>

            {/* ── MEET THE FOUNDERS ── */}
            <section className="bg-(--bg-surface) py-16 sm:py-24 md:py-32 relative">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 space-y-3 sm:space-y-4 px-4">
                        <h2 className="text-(--text-primary) font-display text-3xl sm:text-4xl md:text-5xl font-bold">Behind The Thread</h2>
                        <p className="text-(--text-secondary) text-base sm:text-lg font-light tracking-wide">Meet the duo driving the creative engine of Urban Thread.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto px-4">
                        {founders.map((founder, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.2 }}
                                className="group"
                            >
                                <div className="relative mb-6 sm:mb-8 rounded-2xl sm:rounded-[2.5rem] overflow-hidden aspect-3/4 sm:aspect-4/5 shadow-xl border border-(--border) bg-(--bg-card)">
                                    {founder.image ? (
                                        <img src={getUrl(founder.image)} alt={founder.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-(--bg-elevated) text-(--text-muted)">
                                            <FiUser size={48} className="opacity-20" />
                                        </div>
                                    )}

                                    {/* Social Overlay */}
                                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex gap-2 sm:gap-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                                        <button className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-(--gold) hover:text-black transition-all text-sm sm:text-base">
                                            <FiInstagram size={16} className="sm:w-4.5" />
                                        </button>
                                        <button className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-(--gold) hover:text-black transition-all text-sm sm:text-base">
                                            <FiTwitter size={16} className="sm:w-4.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-center space-y-1.5 sm:space-y-2">
                                    <h3 className="text-lg sm:text-2xl font-display font-bold text-(--text-primary)">{founder.name}</h3>
                                    <p className="text-(--gold) text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">{founder.role}</p>
                                    <p className="text-(--text-muted) text-sm sm:text-base font-light leading-relaxed max-w-sm">
                                        {founder.bio}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUR MISSION ── */}
            <section className="py-16 sm:py-24 md:py-32 overflow-hidden px-4">
                <div className="container-custom">
                    <div className="bg-(--bg-card) rounded-2xl sm:rounded-3xl lg:rounded-[3rem] p-6 sm:p-12 md:p-16 lg:p-20 border border-(--border) relative overflow-hidden shadow-2xl">
                        {/* Background gradient */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-(--gold)/5 to-transparent z-0" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center relative z-10">
                            <div className="space-y-6 sm:space-y-8">
                                <div className="space-y-3 sm:space-y-4">
                                    <h2 className="text-(--text-primary) font-display text-3xl sm:text-4xl md:text-5xl font-bold">The Mission</h2>
                                    <div className="w-12 sm:w-16 h-1 bg-(--gold) rounded-full" />
                                </div>
                                <blockquote className="text-(--text-secondary) text-lg sm:text-2xl md:text-3xl font-light italic leading-tight border-l-4 border-(--gold) pl-4 sm:pl-8 py-2 sm:py-4">
                                    "{settings.aboutUsMissionText || "To empower the youth with clothing that speaks louder than words. Quality fabrics, bold designs, and zero compromises."}"
                                </blockquote>
                                <div className="pt-2 sm:pt-4 space-y-3 sm:space-y-4">
                                    {["Uncompromising Quality", "Authentic Expression", "Community Driven"].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 sm:gap-4 text-(--text-primary) text-sm sm:text-base font-medium">
                                            <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-(--gold)/20 flex items-center justify-center text-(--gold) shrink-0">
                                                <FiCheckCircle size={12} className="sm:w-3.5" />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-video rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl border border-(--border)">
                                    {settings.aboutUsMissionImage ? (
                                        <img src={getUrl(settings.aboutUsMissionImage)} alt="Mission" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-(--bg-elevated) flex items-center justify-center text-(--text-muted) text-sm">Mission Image</div>
                                    )}
                                </div>
                                {/* Floating badge */}
                                <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 bg-(--gold) text-black p-3 sm:p-6 rounded-lg sm:rounded-2xl shadow-2xl rotate-3">
                                    <p className="text-xs uppercase tracking-widest font-black">Quality Guaranteed</p>
                                    <p className="text-xl sm:text-2xl font-display font-bold">100% Cotton</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CALL TO ACTION ── */}
            <section className="container-custom py-12 sm:py-20 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-linear-to-br from-(--bg-card) to-(--bg-deep) dark:from-[#0f0f0f] dark:to-[#050505] rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] py-12 sm:py-16 md:py-20 px-4 sm:px-8 border border-(--border) dark:border-[#1a1a1a] shadow-2xl"
                >
                    <h2 className="text-(--text-primary) dark:text-white font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">Ready to define your style?</h2>
                    <Link to="/shop" className="btn-gold px-6 sm:px-8 md:px-12! py-3 sm:py-4 md:py-5! text-sm sm:text-base md:text-lg! rounded-full! shadow-2xl shadow-(--gold)/30 inline-flex items-center gap-2">
                        Shop the Collection <FiArrowRight size={16} className="sm:w-5" />
                    </Link>
                </motion.div>
            </section>

        </div>
    );
}
