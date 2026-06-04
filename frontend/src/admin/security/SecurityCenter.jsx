import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { FiShield, FiFileText, FiTrash2, FiUsers, FiDatabase, FiDownload } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function SecurityCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

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

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/auth/users");
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch {
      toast.error("Failed to load admin users");
    } finally {
      setLoadingUsers(false);
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

  const handleToggleUserStatus = async (userRecord) => {
    setUpdatingUserId(userRecord._id);
    try {
      const res = await api.put(`/auth/users/${userRecord._id}/status`, { isActive: !userRecord.isActive });
      if (res.data.success) {
        toast.success(`User ${res.data.user.email} is now ${res.data.user.isActive ? "Active" : "Blocked"}`);
        setUsers((current) => current.map((u) => (u._id === userRecord._id ? res.data.user : u)));
      }
    } catch {
      toast.error("Unable to update user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleChangeUserRole = async (userRecord, newRole) => {
    if (userRecord.role === newRole) return;
    setUpdatingUserId(userRecord._id);
    try {
      const res = await api.put(`/auth/users/${userRecord._id}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(`Role updated to ${res.data.user.role}`);
        setUsers((current) => current.map((u) => (u._id === userRecord._id ? res.data.user : u)));
      }
    } catch {
      toast.error("Unable to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      loadLogs();
    }
    if (activeTab === "roles") {
      loadUsers();
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
              <div className="space-y-2 max-h-100 overflow-y-auto pr-1">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-(--border)/50 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Authorized Admin Accounts</h4>
              <span className="text-[10px] text-(--text-muted)">{loadingUsers ? "Refreshing admin roster..." : `${users.length} accounts loaded`}</span>
            </div>

            {loadingUsers ? (
              <p className="text-xs text-(--text-muted) text-center py-6">Loading admin user list...</p>
            ) : users.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-(--border) text-center text-[10px] text-(--text-muted)">
                No admin roster available yet. Use the admin login panel to invite users and assign roles. Refresh this page after user creation.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {users.map((userRecord) => (
                  <div key={userRecord._id} className="p-4 rounded-xl bg-(--bg-elevated) border border-(--border) grid gap-4 md:grid-cols-[1fr_auto] items-start">
                    <div>
                      <p className="font-bold text-(--text-primary)">{userRecord.name || userRecord.email}</p>
                      <p className="text-[10px] text-(--text-muted) font-mono">{userRecord.email}</p>
                      <p className="text-[10px] text-(--text-muted) mt-1">Joined: {new Date(userRecord.createdAt).toLocaleDateString("en-PK")}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${userRecord.role === "admin" ? "bg-(--gold)/15 text-(--gold) border border-(--gold)/20" : "bg-slate-700/10 text-(--text-muted) border border-(--border)"}`}>
                        {userRecord.role === "admin" ? "Administrator" : "User"}
                      </span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${userRecord.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {userRecord.isActive ? "Active" : "Blocked"}
                      </span>
                      <button
                        disabled={updatingUserId === userRecord._id || user?.id === userRecord._id}
                        onClick={() => handleToggleUserStatus(userRecord)}
                        className="btn-outline text-[10px] py-1 px-2"
                      >
                        {userRecord.isActive ? "Block" : "Activate"}
                      </button>
                      <button
                        disabled={updatingUserId === userRecord._id || user?.id === userRecord._id}
                        onClick={() => handleChangeUserRole(userRecord, userRecord.role === "admin" ? "user" : "admin")}
                        className="btn-gold text-[10px] py-1 px-2"
                      >
                        {userRecord.role === "admin" ? "Demote to User" : "Promote to Admin"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
