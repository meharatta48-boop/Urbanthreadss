import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield, FiFileText, FiTrash2, FiUsers, FiDatabase,
  FiDownload, FiClock, FiSearch, FiMonitor, FiMapPin,
  FiCheckCircle, FiXCircle, FiRefreshCw
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function SecurityCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("logs");

  // ── Logs ──
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Admin Roles ──
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // ── Login History ──
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  /* ──────────── DATA LOADERS ──────────── */
  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/activity-logs");
      if (res.data.success) setLogs(res.data.logs || []);
    } catch { toast.error("Failed to load security logs"); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/auth/users");
      if (res.data.success) setUsers(res.data.users || []);
    } catch { toast.error("Failed to load admin users"); }
    finally { setLoadingUsers(false); }
  };

  const loadLoginHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/auth/login-history");
      if (res.data.success) setLoginHistory(res.data.history || []);
    } catch { toast.error("Failed to load login history"); }
    finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    if (activeTab === "logs")    loadLogs();
    if (activeTab === "roles")   loadUsers();
    if (activeTab === "history") loadLoginHistory();
  }, [activeTab]);

  /* ──────────── HANDLERS ──────────── */
  const handleClearLogs = async () => {
    if (!window.confirm("Permanently clear all activity logs? This is irreversible.")) return;
    try {
      const res = await api.delete("/activity-logs/clear");
      if (res.data.success) { toast.success("Logs cleared"); loadLogs(); }
    } catch { toast.error("Failed to clear logs"); }
  };

  const handleToggleUserStatus = async (ur) => {
    setUpdatingUserId(ur._id);
    try {
      const res = await api.put(`/auth/users/${ur._id}/status`, { isActive: !ur.isActive });
      if (res.data.success) {
        toast.success(`User is now ${res.data.user.isActive ? "Active" : "Blocked"}`);
        setUsers((c) => c.map((u) => (u._id === ur._id ? res.data.user : u)));
      }
    } catch { toast.error("Unable to update user status"); }
    finally { setUpdatingUserId(null); }
  };

  const handleChangeRole = async (ur, newRole) => {
    if (ur.role === newRole) return;
    setUpdatingUserId(ur._id);
    try {
      const res = await api.put(`/auth/users/${ur._id}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(`Role → ${res.data.user.role}`);
        setUsers((c) => c.map((u) => (u._id === ur._id ? res.data.user : u)));
      }
    } catch { toast.error("Unable to update user role"); }
    finally { setUpdatingUserId(null); }
  };

  /* ──────────── DERIVED ──────────── */
  const filteredHistory = loginHistory.filter((h) => {
    const s = historySearch.toLowerCase();
    return !s || h.email?.toLowerCase().includes(s) || h.ip?.includes(s) || h.device?.toLowerCase().includes(s);
  });

  const TABS = [
    { id: "logs",    label: "Activity Logs",  icon: <FiFileText size={13} /> },
    { id: "roles",   label: "Admin Roles",    icon: <FiUsers    size={13} /> },
    { id: "history", label: "Login History",  icon: <FiClock    size={13} /> },
    { id: "backups", label: "DB Backup",      icon: <FiDatabase size={13} /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="bg-linear-to-r from-red-950/20 to-slate-900/10 border border-red-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-red-400 uppercase mb-0.5">Admin Security Control</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">Security Center</h2>
        <p className="text-(--text-muted) text-xs mt-1">
          Review audit trails, manage admin roles, monitor login sessions, and backup the database.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
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

        {/* ────── TAB 1: Activity Logs ────── */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-(--border)/50 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Admin Audit Trail</h4>
              <div className="flex items-center gap-3">
                <button onClick={loadLogs} className="text-(--text-muted) hover:text-(--gold) transition-colors">
                  <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
                </button>
                {logs.length > 0 && (
                  <button onClick={handleClearLogs} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <FiTrash2 size={12} /> Clear Logs
                  </button>
                )}
              </div>
            </div>
            {loading ? (
              <p className="text-xs text-(--text-muted) text-center py-6">Loading audit trails...</p>
            ) : logs.length === 0 ? (
              <p className="text-xs text-(--text-muted) text-center py-6 border border-dashed border-(--border) rounded-xl">
                No administrative activity recorded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log._id} className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border) flex justify-between items-start text-xs">
                    <div>
                      <p className="text-(--text-primary) font-semibold">
                        <span className="text-(--gold)">{log.adminName}</span>
                        {" · "}
                        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-900/10 border border-cyan-500/10 px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                      </p>
                      <p className="text-[10px] text-(--text-muted) mt-1">{log.details}</p>
                    </div>
                    <div className="text-right text-[9px] text-(--text-muted) font-mono shrink-0 ml-4">
                      <p>{new Date(log.createdAt).toLocaleString("en-PK")}</p>
                      <p className="mt-0.5">IP: {log.ipAddress || "Unknown"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────── TAB 2: Admin Roles ────── */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-(--border)/50 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Authorized Admin Accounts</h4>
              <span className="text-[10px] text-(--text-muted)">
                {loadingUsers ? "Refreshing..." : `${users.length} accounts loaded`}
              </span>
            </div>
            {loadingUsers ? (
              <p className="text-xs text-(--text-muted) text-center py-6">Loading admin user list...</p>
            ) : users.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-(--border) text-center text-[10px] text-(--text-muted)">
                No admin accounts found.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {users.map((ur) => (
                  <div key={ur._id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) grid gap-4 md:grid-cols-[1fr_auto] items-start">
                    <div>
                      <p className="font-bold text-(--text-primary)">{ur.name || ur.email}</p>
                      <p className="text-[10px] text-(--text-muted) font-mono">{ur.email}</p>
                      <p className="text-[10px] text-(--text-muted) mt-1">Joined: {new Date(ur.createdAt).toLocaleDateString("en-PK")}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${ur.role === "admin" ? "bg-(--gold)/15 text-(--gold) border border-(--gold)/20" : "bg-slate-700/10 text-(--text-muted) border border-(--border)"}`}>
                        {ur.role === "admin" ? "Administrator" : "User"}
                      </span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${ur.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {ur.isActive ? "Active" : "Blocked"}
                      </span>
                      <button
                        disabled={updatingUserId === ur._id || user?.id === ur._id}
                        onClick={() => handleToggleUserStatus(ur)}
                        className="btn-outline text-[10px] py-1 px-2"
                      >
                        {ur.isActive ? "Block" : "Activate"}
                      </button>
                      <button
                        disabled={updatingUserId === ur._id || user?.id === ur._id}
                        onClick={() => handleChangeRole(ur, ur.role === "admin" ? "user" : "admin")}
                        className="btn-gold text-[10px] py-1 px-2"
                      >
                        {ur.role === "admin" ? "Demote" : "Promote to Admin"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────── TAB 3: Login History ────── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-(--border)/50 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary) flex items-center gap-1.5">
                <FiShield size={13} className="text-(--gold)" /> Login History
              </h4>
              <div className="flex-1" />
              <div className="relative max-w-xs w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={12} />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter by email, IP or device..."
                  className="lux-input text-xs py-1.5 pl-8 w-full"
                />
              </div>
              <button onClick={loadLoginHistory} className="text-(--text-muted) hover:text-(--gold) transition-colors shrink-0">
                <FiRefreshCw size={12} className={loadingHistory ? "animate-spin" : ""} />
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex flex-col items-center gap-3 py-10 text-(--text-muted)">
                <div className="w-6 h-6 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Loading login history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <p className="text-xs text-(--text-muted) text-center py-8 border border-dashed border-(--border) rounded-xl">
                {historySearch ? "No matches found." : "No login history recorded yet."}
              </p>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {filteredHistory.map((h, i) => (
                    <motion.div
                      key={h._id || i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${h.success ? "text-green-400" : "text-red-400"}`}>
                          {h.success ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                        </div>
                        <div>
                          <p className="font-semibold text-(--text-primary)">{h.email || "Unknown"}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-(--text-muted)">
                            {h.ip && (
                              <span className="flex items-center gap-0.5">
                                <FiMapPin size={9} /> {h.ip}
                              </span>
                            )}
                            {h.device && (
                              <span className="flex items-center gap-0.5">
                                <FiMonitor size={9} /> {h.device.slice(0, 60)}{h.device.length > 60 ? "…" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.success ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {h.success ? "Success" : "Failed"}
                        </span>
                        <p className="text-[9px] text-(--text-muted) font-mono mt-1">
                          {new Date(h.timestamp || h.createdAt).toLocaleString("en-PK")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ────── TAB 4: Database Backup ────── */}
        {activeTab === "backups" && (
          <div className="space-y-4 text-center py-6 max-w-md mx-auto">
            <FiDatabase size={42} className="mx-auto text-(--gold)" />
            <h4 className="text-sm font-bold text-(--text-primary)">Database Backup Management</h4>
            <p className="text-xs text-(--text-muted)">
              Export settings and collections configuration as a JSON snapshot.
              Re-import it in Settings to restore visual defaults.
            </p>
            <button
              onClick={async () => {
                try {
                  const res = await api.get("/settings");
                  const blob = new Blob([JSON.stringify(res.data.settings, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `urbanthreads_backup_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Database configuration backup downloaded!");
                } catch { toast.error("Failed to backup settings"); }
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
