import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FiShield, FiFileText, FiTrash2, FiUsers, FiLock, FiDatabase, FiDownload, FiCheckCircle } from "react-icons/fi";

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/activity-logs");
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch {
      toast.error("Failed to load security logs");
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all activity logs? This action is irreversible.")) return;
    try {
      const res = await api.delete("/activity-logs/clear");
      if (res.data.success) {
        toast.success("Security logs cleared");
        loadLogs();
      }
    } catch {
      toast.error("Failed to clear logs");
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-linear-to-r from-red-950/20 to-slate-900/10 border border-red-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-red-400 uppercase mb-0.5">Admin Security Control</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">Security Center</h2>
        <p className="text-(--text-muted) text-xs mt-1">Review system activity audit trials, configure admin roles, and download database backup snapshots.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {[
          { id: "logs", label: "Activity Logs", icon: <FiFileText /> },
          { id: "roles", label: "Admin Roles", icon: <FiUsers /> },
          { id: "backups", label: "Database Backups", icon: <FiDatabase /> }
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
        {/* TAB 1: Activity Logs */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-(--border)/50 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Admin Audit Trail</h4>
              {logs.length > 0 && (
                <button onClick={handleClearLogs} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                  <FiTrash2 size={12} /> Clear Logs
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-xs text-(--text-muted) text-center py-6">Loading audit trails...</p>
            ) : logs.length === 0 ? (
              <p className="text-xs text-(--text-muted) text-center py-6 border border-dashed border-(--border) rounded-xl">No administrative activity recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log._id} className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border) flex justify-between items-start text-xs">
                    <div>
                      <p className="text-(--text-primary) font-semibold">
                        <span className="text-(--gold)">{log.adminName}</span> · <span className="font-mono text-[10px] text-cyan-400 bg-cyan-900/10 border border-cyan-500/10 px-1.5 py-0.2 rounded">{log.action}</span>
                      </p>
                      <p className="text-[10px] text-(--text-muted) mt-1">{log.details}</p>
                    </div>
                    <div className="text-right text-[9px] text-(--text-muted) font-mono">
                      <p>{new Date(log.createdAt).toLocaleString("en-PK")}</p>
                      <p className="mt-0.5">IP: {log.ipAddress || "Unknown"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Roles */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Authorized Admin Accounts</h4>
            <div className="space-y-2 text-xs">
              {[
                { name: "Super CTO", email: "cto@urbanthread.pk", role: "Super Administrator", active: true },
                { name: "Fulfillment Executive", email: "ops@urbanthread.pk", role: "Staff Handler (Orders Only)", active: true }
              ].map((staff, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between">
                  <div>
                    <p className="font-bold text-(--text-primary)">{staff.name}</p>
                    <p className="text-[10px] text-(--text-muted) font-mono">{staff.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-(--gold)/10 text-(--gold) border border-(--gold)/25 px-2 py-0.5 rounded text-[10px] font-bold">{staff.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Backups */}
        {activeTab === "backups" && (
          <div className="space-y-4 text-center py-6 max-w-md mx-auto">
            <FiDatabase size={42} className="mx-auto text-(--gold)" />
            <h4 className="text-sm font-bold text-(--text-primary)">Database Backup Management</h4>
            <p className="text-xs text-(--text-muted)">Export settings and collections configuration. You can import JSON backups in Settings to restore visual defaults.</p>
            <button
              onClick={async () => {
                try {
                  const res = await api.get("/settings");
                  const blob = new Blob([JSON.stringify(res.data.settings, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `urbanthreads_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  toast.success("Database configuration backup downloaded!");
                } catch {
                  toast.error("Failed to backup settings");
                }
              }}
              className="btn-gold mx-auto flex items-center gap-2 mt-4"
            >
              <FiDownload /> Download Settings JSON Backup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
