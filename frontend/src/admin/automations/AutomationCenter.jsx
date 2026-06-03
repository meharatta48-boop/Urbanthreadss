import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiMessageSquare, FiSmartphone, FiBell, FiZap, FiSettings, FiCheckCircle, FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";

export default function AutomationCenter() {
  const [activeTab, setActiveTab] = useState("email");

  // Email Triggers State
  const [emailTriggers, setEmailTriggers] = useState([
    { id: "welcome", name: "Welcome Sequence", desc: "Sent immediately after user registration.", isActive: true, subject: "Welcome to Urban Threads Family! 🎉" },
    { id: "cart_recovery", name: "Abandoned Cart Alert", desc: "Sent 2 hours after shopper leaves items in cart.", isActive: true, subject: "Don't forget your streetwear drip! 🛍️" },
    { id: "order_confirmation", name: "Order Receipt Notification", desc: "Sent instantly on order placement.", isActive: true, subject: "Order Confirmed - ID #{{orderId}}" }
  ]);

  // WhatsApp Templates State
  const [waTemplates, setWaTemplates] = useState([
    { id: "cod_confirm", name: "COD Order Verification", body: "Assalam-o-Alaikum {{name}}, Aap ka Urban Threads order received ho gaya hai. Total billing Rs. {{total}} hai. Kia aap delivery confirm karte hain?", isActive: true },
    { id: "shipped_alert", name: "Courier Shipped Alert", body: "Hello {{name}}, Aap ka streetwear block par dispatch ho gaya hai! Leopard tracking link: {{trackingLink}}", isActive: true }
  ]);

  // SMS Notifications
  const [smsTemplates, setSmsTemplates] = useState([
    { id: "sms_ship", name: "Courier dispatch text", body: "Urban Threads: Order #{{id}} has been shipped via Leopard. Track here: {{link}}", isActive: true }
  ]);

  const toggleTrigger = (id) => {
    setEmailTriggers(emailTriggers.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    toast.success("Trigger configuration saved!");
  };

  const toggleWa = (id) => {
    setWaTemplates(waTemplates.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    toast.success("WhatsApp template status toggled!");
  };

  const handleTestTrigger = (triggerName) => {
    toast.info(`Sending test payload for "${triggerName}" to admin email...`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-950/20 to-slate-900/10 border border-orange-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-orange-400 uppercase mb-0.5">Alert Dispatch Console</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">Automation Center</h2>
        <p className="text-(--text-muted) text-xs mt-1">Configure transactional templates and triggers for Email, WhatsApp, SMS and Push notifications.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {[
          { id: "email", label: "Email Automations", icon: <FiMail /> },
          { id: "whatsapp", label: "WhatsApp alerts", icon: <FiMessageSquare /> },
          { id: "sms", label: "SMS Gateways", icon: <FiSmartphone /> },
          { id: "push", label: "Push Broadcast", icon: <FiBell /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? "border-(--gold) text-(--gold) bg-(--gold)/5"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl">
        {/* TAB 1: Email */}
        {activeTab === "email" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Trigger Workflows</h4>
            <div className="space-y-3">
              {emailTriggers.map((trig) => (
                <div key={trig.id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-(--text-primary)">{trig.name}</p>
                    <p className="text-[10px] text-(--text-muted)">{trig.desc}</p>
                    <p className="text-[10px] text-(--gold) font-mono">Subject: {trig.subject}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleTestTrigger(trig.name)} className="btn-outline text-[11px] py-1.5 px-3">
                      Test Send
                    </button>
                    <button
                      onClick={() => toggleTrigger(trig.id)}
                      className="w-12 h-6 rounded-full transition-all relative border border-(--border)"
                      style={{ background: trig.isActive ? "var(--gold)" : "var(--bg-elevated)" }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                        style={{ left: trig.isActive ? "calc(100% - 22px)" : 2, background: trig.isActive ? "#000" : "var(--text-muted)" }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WhatsApp */}
        {activeTab === "whatsapp" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-(--border)/50 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">WhatsApp Alert Templates</h4>
              <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold border border-green-500/25">Gateway Status: Connected</span>
            </div>
            <div className="space-y-3">
              {waTemplates.map((template) => (
                <div key={template.id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-(--text-primary)">{template.name}</p>
                    <button
                      onClick={() => toggleWa(template.id)}
                      className="w-12 h-6 rounded-full transition-all relative border border-(--border)"
                      style={{ background: template.isActive ? "var(--gold)" : "var(--bg-elevated)" }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                        style={{ left: template.isActive ? "calc(100% - 22px)" : 2, background: template.isActive ? "#000" : "var(--text-muted)" }}
                      />
                    </button>
                  </div>
                  <div className="bg-(--bg-card) p-3 rounded-lg border border-(--border) text-[11px] text-(--text-muted) font-light italic">
                    "{template.body}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SMS */}
        {activeTab === "sms" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">SMS Courier integrations</h4>
            <div className="space-y-3">
              {smsTemplates.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-(--text-primary)">{t.name}</p>
                    <span className="text-[9px] bg-(--gold)/10 text-(--gold) border border-(--gold)/25 px-2 py-0.5 rounded font-mono">SMS API: Active</span>
                  </div>
                  <p className="text-[11px] text-(--text-muted) font-mono italic">"{t.body}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Push */}
        {activeTab === "push" && (
          <div className="space-y-4 max-w-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Broadcast Push Notification</h4>
            <div>
              <label className="text-[10px] text-(--text-muted) block mb-1">Notification Title</label>
              <input placeholder="e.g. New Drop Live!" className="lux-input w-full" />
            </div>
            <div>
              <label className="text-[10px] text-(--text-muted) block mb-1">Message Body</label>
              <textarea placeholder="Shop the Winter Pakistani drop now before stock sells out!" className="lux-input w-full" rows={3} />
            </div>
            <button onClick={() => toast.success("Push broadcast dispatched to 1,240 subscribers!")} className="btn-gold">
              Send Broadcast Push
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
