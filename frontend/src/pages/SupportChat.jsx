import { useState, useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import {
  FiSend, FiPhone, FiMail, FiMapPin,
  FiClock, FiCheckCircle, FiChevronRight,
  FiInstagram, FiFacebook, FiMessageCircle,
} from "react-icons/fi";
import { RiWhatsappLine } from "react-icons/ri";

/* ── Smart auto-reply ── */
const autoReply = (msg) => {
  const m = msg.toLowerCase();
  if (m.match(/order|track|status|kahan/))   return "Aapka order track karne ke liye apna Order ID share karein ya 'My Orders' section check karein 📦";
  if (m.match(/return|refund|wapis|vapas/))   return "Return policy: Delivery ke 7 din ke andar unopened item return kar sakte hain. WhatsApp par humse rabta karein.";
  if (m.match(/size|fit|mapi|chart/))         return "Size guide ke liye product page par 'Size Chart' dekhen — ya apni measurements share karein, hum help karenge! 📏";
  if (m.match(/pay|payment|cod|online|jazzcash|easypaisa/)) return "Hum Cash on Delivery (COD), JazzCash, EasyPaisa aur Bank Transfer accept karte hain. 💳";
  if (m.match(/deliver|shipping|kitne din|time/)) return "Delivery Lahore mein 1-2 din, baaki Pakistan mein 3-5 working days. 🚚";
  if (m.match(/price|rate|discount|offer|sale/)) return "Latest deals ke liye hamara homepage check karein ya coupon code apply karein checkout par! 🎁";
  if (m.match(/hello|hi|salam|assalam|helo|hey/)) return "Wa-Alaikum-Assalam! 😊 Hum aapki kaise khidmat kar sakte hain?";
  if (m.match(/thanks|shukriya|thank you|shukria/)) return "Meherbani! Aur koi sawaal ho to zaroor poochhein. 🙏";
  if (m.match(/whatsapp|contact|number|phone/)) return "Aap humse directly WhatsApp par bhi contact kar sakte hain — neeche WhatsApp button use karein! 📲";
  return "Shukriya aapke message ka! 😊 Hamari team jald hi jawab degi. Urgent case mein WhatsApp karen.";
};

const QUICK_CHIPS = [
  "Mera order kahan hai?",
  "Size guide chahiye",
  "Return policy kya hai?",
  "Delivery kitne din mein?",
  "Payment methods?",
];

export default function SupportChat() {
  const { settings } = useSettings();
  const brand = settings?.brandName || "Urban Thread";

  const [messages, setMessages] = useState([
    { from: "support", text: `Assalam-o-Alaikum! 👋 ${brand} mein khush amdeed.\n\nHum aapki kaise madad kar sakte hain?`, time: new Date() },
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const [tab, setTab]       = useState("chat");
  const bottomRef           = useRef(null);
  const inputRef            = useRef(null);

  useEffect(() => {
    if (settings?.brandName) {
      setMessages([{
        from: "support",
        text: `Assalam-o-Alaikum! 👋 ${settings.brandName} mein khush amdeed.\n\nHum aapki kaise madad kar sakte hain?`,
        time: new Date(),
      }]);
    }
  }, [settings?.brandName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const getSupportReplyDelay = () => 1000 + Math.random() * 600;

  const send = (text = input) => {
    const msg = text.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { from: "user", text: msg, time: new Date() }]);
    setTyping(true);
    const delay = getSupportReplyDelay();
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: "support", text: autoReply(msg), time: new Date() }]);
    }, delay);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const wa      = `https://wa.me/${(settings?.whatsapp || "923001234567").replace(/\D/g, "")}?text=Assalam-o-Alaikum! Mujhe madad chahiye.`;
  const phone   = settings?.phone   || "+92 300 1234567";
  const email   = settings?.email   || "info@urbanthread.pk";
  const address = settings?.address || "Lahore, Pakistan";
  const hours   = settings?.supportHours || "Mon–Sat: 9am – 9pm";
  const fmtTime = (d) => new Date(d).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  const contacts = [
    { icon: <RiWhatsappLine size={20} style={{ color: "#4ade80" }} />, iconBg: "rgba(74,222,128,0.08)", label: "WhatsApp Chat", sub: "Sabse fast response", href: wa, arrow: true },
    { icon: <FiPhone size={17} style={{ color: "var(--gold)" }} />,    iconBg: "rgba(201,168,76,0.08)", label: "Call Us",       sub: phone,  href: `tel:${phone}`,    arrow: true },
    { icon: <FiMail size={17} style={{ color: "#60a5fa" }} />,         iconBg: "rgba(96,165,250,0.08)", label: "Email",         sub: email,  href: `mailto:${email}`, arrow: true },
    { icon: <FiClock size={17} style={{ color: "var(--text-muted)" }} />, iconBg: "var(--bg-elevated)", label: "Hours",      sub: hours },
    { icon: <FiMapPin size={17} style={{ color: "var(--text-muted)" }} />, iconBg: "var(--bg-elevated)", label: "Location",  sub: address },
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh", background: "var(--bg-deep)" }}>

      {/* Mobile tab switcher */}
      <div className="lg:hidden flex flex-shrink-0 fixed top-[64px] left-0 right-0 z-30"
        style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
        {[
          { id: "chat", icon: <FiMessageCircle size={13} />, label: "Chat" },
          { id: "info", icon: <FiPhone size={13} />, label: "Contact Info" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all"
            style={{
              color: tab === t.id ? "var(--gold)" : "var(--text-muted)",
              borderBottom: tab === t.id ? "2px solid var(--gold)" : "2px solid transparent",
              background: "transparent",
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-5 pt-36 sm:pt-32 pb-6 grid lg:grid-cols-3 gap-4 min-h-0">

        {/* LEFT: Contact Cards */}
        <div className={`space-y-3 ${tab === "info" ? "block" : "hidden"} lg:block`}>
          {contacts.map((c, i) => {
            const inner = (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.iconBg }}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{c.label}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{c.sub}</p>
                </div>
                {c.arrow && <FiChevronRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
              </div>
            );
            return c.href
              ? <a key={i} href={c.href} target={c.href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer">{inner}</a>
              : <div key={i}>{inner}</div>;
          })}

          {/* Social */}
          {(settings?.instagram || settings?.facebook) && (
            <div className="p-3.5 rounded-xl"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-2.5" style={{ color: "var(--text-muted)" }}>Social Media</p>
              <div className="flex gap-2">
                {settings?.instagram && settings.instagram !== "#" && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ border: "1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(236,72,153,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <FiInstagram size={15} style={{ color: "#ec4899" }} />
                  </a>
                )}
                {settings?.facebook && settings.facebook !== "#" && (
                  <a href={settings.facebook} target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ border: "1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <FiFacebook size={15} style={{ color: "#3b82f6" }} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat Box */}
        <div
          className={`lg:col-span-2 flex flex-col rounded-2xl overflow-hidden ${tab === "chat" ? "flex" : "hidden"} lg:flex`}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", height: "clamp(400px, calc(100dvh - 140px), 720px)" }}
        >
          {/* Chat Header */}
          <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-black text-sm"
                style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}>
                {brand.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2"
                style={{ borderColor: "var(--bg-elevated)" }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{brand} Support</p>
              <p className="text-green-500 text-xs">Online — replies in minutes</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "support" && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-black"
                    style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}>
                    {brand.charAt(0)}
                  </div>
                )}
                <div className={`flex flex-col gap-1 max-w-[80%] sm:max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.from === "user" ? "rounded-tr-sm text-black" : "rounded-tl-sm"
                    }`}
                    style={msg.from === "user"
                      ? { background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }
                      : { background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }
                    }
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{fmtTime(msg.time)}</span>
                    {msg.from === "user" && <FiCheckCircle size={9} style={{ color: "var(--gold)" }} />}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing */}
            {typing && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#c9a84c,#e8c96a)" }}>
                  {brand.charAt(0)}
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  {[0,1,2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#c9a84c", animation: `typingBounce 1.2s ${d*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Chips */}
          <div className="px-3 sm:px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
            {QUICK_CHIPS.map((chip, i) => (
              <button key={i} onClick={() => send(chip)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                style={{ border: "1px solid var(--gold)", color: "var(--gold)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--gold)"; }}>
                {chip}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="px-3 sm:px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message likhein..."
                rows={1}
                className="flex-1 resize-none rounded-xl px-3 sm:px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  maxHeight: 80,
                  minHeight: 40,
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim() ? "linear-gradient(135deg,#c9a84c,#e8c96a)" : "var(--bg-elevated)",
                  color: input.trim() ? "#000" : "var(--text-muted)",
                  border: `1px solid ${input.trim() ? "transparent" : "var(--border)"}`,
                }}>
                <FiSend size={15} />
              </button>
            </div>
            <p className="text-[9px] mt-1.5 text-center hidden sm:block" style={{ color: "var(--text-muted)" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <a href={wa} target="_blank" rel="noreferrer"
        className="hidden lg:flex fixed bottom-6 right-6 w-13 h-13 items-center justify-center rounded-full shadow-2xl z-40 transition-transform hover:scale-110"
        style={{ background: "#25d366", width: 52, height: 52 }}>
        <RiWhatsappLine size={26} className="text-white" />
      </a>

      <style>{`
        @keyframes typingBounce {
          0%,60%,100%{transform:translateY(0)}
          30%{transform:translateY(-5px)}
        }
      `}</style>
    </div>
  );
}
