import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiShoppingCart } from "react-icons/fi";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useSettings } from "../../context/SettingsContext";
import { toast } from "react-toastify";
import { SERVER_URL } from "../../services/api";

const API_BASE = SERVER_URL;

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    api.get("/products")
      .then((r) => setProducts((r.data.data || r.data.products || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (!products.length) return null;

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ background: "var(--bg-deep)" }}>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="section-label mb-2 sm:mb-3">{settings?.featuredLabel || "Curated Picks"}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}>
              {(settings?.featuredTitle || "Featured Collection").split(" ").slice(0,-1).join(" ")}{" "}
              <span className="gold-text">
                {(settings?.featuredTitle || "Featured Collection").split(" ").slice(-1)[0]}
              </span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            View All <FiArrowRight />
          </Link>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22,1,0.36,1] }}
              className="product-card group"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden aspect-3/4">
                <img
                  src={`${API_BASE}${p.images?.[0]}`}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  style={{ transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                {/* OVERLAY */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <button
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    if (p.sizes?.length > 0 || p.colors?.length > 0) {
                      navigate(`/product/${p._id}`);
                    } else {
                      addToCart(p); 
                      toast.success("Added to cart!"); 
                    }
                  }}
                  className="absolute bottom-8 left-0 right-0 mx-auto w-max btn-gold opacity-0 group-hover:opacity-100 transition-opacity duration-400 whitespace-nowrap shadow-xl"
                  style={{ padding: "10px 20px", fontSize: "0.75rem", zIndex: 20 }}
                >
                  <FiShoppingCart size={14} /> Quick Add
                </button>

                {/* STOCK BADGE */}
                {p.stock < 5 && p.stock > 0 && (
                  <span className="absolute top-3 left-3 badge-gold text-[10px]">Low Stock</span>
                )}
              </div>

              {/* INFO */}
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                  {p.category?.name}
                </p>
                <h3 className="font-semibold text-sm leading-snug truncate" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="gold-text font-bold text-base font-display">
                    Rs. {p.price?.toLocaleString()}
                  </span>
                  <Link
                    to={`/product/${p._id}`}
                    className="text-xs transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link to="/shop" className="btn-outline">View All Products</Link>
        </div>
      </div>
    </section>
  );
}
