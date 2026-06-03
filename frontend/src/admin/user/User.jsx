import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiUsers, FiMail, FiSearch, FiRefreshCw, FiAward,
  FiCheck, FiSlash, FiTrash2, FiChevronDown, FiChevronUp,
  FiStar, FiDollarSign, FiPhone, FiSave, FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SEGMENT_CONFIG = {
  new:     { label: "New",     color: "#64b5f6", bg: "rgba(100,181,246,0.12)" },
  regular: { label: "Regular", color: "#c9a84c", bg: "rgba(201,168,76,0.12)"  },
  vip:     { label: "VIP",     color: "#ce93d8", bg: "rgba(206,147,216,0.12)" },
};

function SegmentBadge({ segment }) {
  const cfg = SEGMENT_CONFIG[segment] || SEGMENT_CONFIG.new;
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: "999px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

function EditProfileDrawer({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    loyaltyPoints: user.loyaltyPoints ?? 0,
    storeCredit:   user.storeCredit   ?? 0,
    customerSegment: user.customerSegment ?? "new",
    phone: user.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/auth/users/${user._id}/profile`, form);
      if (data.success) {
        toast.success("User profile updated");
        onSaved(data.user || { ...user, ...form });
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "18px 20px",
        marginTop: "8px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
      }}
    >
      {/* Loyalty Points */}
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <FiStar size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Loyalty Points
        </span>
        <input
          type="number"
          min="0"
          value={form.loyaltyPoints}
          onChange={(e) => setForm({ ...form, loyaltyPoints: e.target.value })}
          className="lux-input"
          style={{ padding: "8px 12px", fontSize: "0.85rem" }}
        />
      </label>

      {/* Store Credit */}
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <FiDollarSign size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Store Credit (PKR)
        </span>
        <input
          type="number"
          min="0"
          value={form.storeCredit}
          onChange={(e) => setForm({ ...form, storeCredit: e.target.value })}
          className="lux-input"
          style={{ padding: "8px 12px", fontSize: "0.85rem" }}
        />
      </label>

      {/* Customer Segment */}
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <FiAward size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Segment
        </span>
        <select
          value={form.customerSegment}
          onChange={(e) => setForm({ ...form, customerSegment: e.target.value })}
          className="lux-input"
          style={{ padding: "8px 12px", fontSize: "0.85rem" }}
        >
          <option value="new">New</option>
          <option value="regular">Regular</option>
          <option value="vip">VIP</option>
        </select>
      </label>

      {/* Phone */}
      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <FiPhone size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Phone
        </span>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+92 300 0000000"
          className="lux-input"
          style={{ padding: "8px 12px", fontSize: "0.85rem" }}
        />
      </label>

      {/* Actions */}
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
        <button
          onClick={onClose}
          className="btn-outline"
          style={{ padding: "7px 16px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}
        >
          <FiX size={13} /> Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="btn-gold"
          style={{ padding: "7px 18px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}
        >
          <FiSave size={13} /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}

export default function UserList() {
  const { users: adminUsers } = useAuth();
  const [users, setUsers]           = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [updatingRole, setUpdatingRole]     = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingUser, setDeletingUser]     = useState(null);
  const [expandedUser, setExpandedUser]     = useState(null);
  const [segmentFilter, setSegmentFilter]   = useState("all");

  useEffect(() => {
    setUsers(adminUsers || []);
  }, [adminUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/users");
      if (data.success) setUsers(data.users);
    } catch {
      setUsers(adminUsers || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      const { data } = await api.put(`/auth/users/${userId}/role`, { role: newRole });
      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setUpdatingStatus(userId);
    const newStatus = !currentStatus;
    try {
      const { data } = await api.put(`/auth/users/${userId}/status`, { isActive: newStatus });
      if (data.success) {
        toast.success(`User ${newStatus ? "unblocked" : "blocked"}`);
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: newStatus } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingUser(userId);
    try {
      const { data } = await api.delete(`/auth/users/${userId}`);
      if (data.success) {
        toast.success("User deleted");
        setUsers(users.filter(u => u._id !== userId));
        if (expandedUser === userId) setExpandedUser(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleProfileSaved = (updatedUser) => {
    setUsers(users.map(u => u._id === updatedUser._id ? { ...u, ...updatedUser } : u));
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === "all" || u.customerSegment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const stats = [
    { label: "Total",   val: users.length,                                   color: "#c9a84c" },
    { label: "Active",  val: users.filter(u => u.isActive !== false).length, color: "#4ade80" },
    { label: "VIP",     val: users.filter(u => u.customerSegment === "vip").length, color: "#ce93d8" },
    { label: "Admins",  val: users.filter(u => u.role === "admin").length,   color: "#60a5fa" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h2 className="font-display text-3xl font-bold text-(--text-primary)">Users</h2>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-outline flex items-center gap-2"
          style={{ padding: "10px 18px", fontSize: "0.82rem" }}
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center shadow-sm">
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-(--text-muted) text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH + SEGMENT FILTER */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="lux-input"
            style={{ paddingLeft: "42px" }}
          />
        </div>
        <div className="flex gap-2">
          {["all", "new", "regular", "vip"].map(seg => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              style={{
                padding: "7px 14px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: `1px solid ${segmentFilter === seg ? "var(--gold)" : "var(--border)"}`,
                background: segmentFilter === seg ? "rgba(201,168,76,0.12)" : "var(--bg-surface)",
                color: segmentFilter === seg ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {seg === "all" ? "All Segments" : seg}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2">
            <FiUsers size={16} className="text-(--gold)" /> All Users
          </h3>
          <span className="badge-gold">{filtered.length} users</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-(--text-muted)">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-(--text-muted)">
            <FiUsers size={32} className="mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-(--bg-surface) text-(--text-muted) text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Segment</th>
                  <th className="px-6 py-3">Points</th>
                  <th className="px-6 py-3">Credit</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <>
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className="border-t border-(--border) hover:bg-(--bg-elevated)/30 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-(--text-primary) font-medium text-sm">{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 text-(--text-secondary) text-sm">
                          <FiMail size={13} /> {user.email}
                        </div>
                      </td>

                      {/* Segment */}
                      <td className="px-6 py-3">
                        <SegmentBadge segment={user.customerSegment || "new"} />
                      </td>

                      {/* Loyalty Points */}
                      <td className="px-6 py-3">
                        <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: "0.85rem" }}>
                          ★ {user.loyaltyPoints ?? 0}
                        </span>
                      </td>

                      {/* Store Credit */}
                      <td className="px-6 py-3">
                        <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.82rem" }}>
                          ₨ {(user.storeCredit ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          user.role === "admin"
                            ? "text-(--gold) bg-(--gold)/10 border border-(--gold)/20"
                            : "text-(--text-muted) bg-(--bg-surface) border border-(--border)"
                        }`}>
                          {user.role || "user"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3">
                        <span className={user.isActive !== false ? "badge-delivered" : "badge-cancelled"}>
                          {user.isActive !== false ? "Active" : "Blocked"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-3 text-(--text-muted) text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK") : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Expand/Edit loyalty */}
                          <button
                            onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                            style={{
                              display: "flex", alignItems: "center", gap: 4,
                              fontSize: "0.75rem", padding: "5px 10px", borderRadius: "8px",
                              border: `1px solid ${expandedUser === user._id ? "var(--gold)" : "var(--border)"}`,
                              background: expandedUser === user._id ? "rgba(201,168,76,0.1)" : "var(--bg-surface)",
                              color: expandedUser === user._id ? "var(--gold)" : "var(--text-muted)",
                              cursor: "pointer", transition: "all 0.2s",
                            }}
                            title="Edit profile details"
                          >
                            {expandedUser === user._id ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                            Edit
                          </button>

                          {/* Role toggle */}
                          {user.role === "user" ? (
                            <button
                              onClick={() => handleRoleChange(user._id, "admin")}
                              disabled={updatingRole === user._id}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-(--gold)/30 text-(--gold) hover:bg-(--gold)/10 disabled:opacity-50 transition-all"
                              title="Make Admin"
                            >
                              <FiAward size={12} /> {updatingRole === user._id ? "…" : "Admin"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user._id, "user")}
                              disabled={updatingRole === user._id}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-(--border) text-(--gold) hover:bg-(--gold)/5 disabled:opacity-50 transition-all"
                              title="Demote to User"
                            >
                              <FiCheck size={12} /> {updatingRole === user._id ? "…" : "User"}
                            </button>
                          )}

                          {/* Block/Unblock */}
                          <button
                            onClick={() => handleStatusToggle(user._id, user.isActive !== false)}
                            disabled={updatingStatus === user._id}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                              user.isActive !== false
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                            }`}
                            title={user.isActive !== false ? "Block" : "Unblock"}
                          >
                            <FiSlash size={12} /> {updatingStatus === user._id ? "…" : (user.isActive !== false ? "Block" : "Unblock")}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={deletingUser === user._id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                            title="Delete User"
                          >
                            <FiTrash2 size={12} /> {deletingUser === user._id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* EXPANDED EDIT DRAWER */}
                    {expandedUser === user._id && (
                      <tr key={`${user._id}-drawer`} className="border-t-0">
                        <td colSpan={9} className="px-6 pb-4">
                          <AnimatePresence>
                            <EditProfileDrawer
                              key={user._id}
                              user={user}
                              onClose={() => setExpandedUser(null)}
                              onSaved={handleProfileSaved}
                            />
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
