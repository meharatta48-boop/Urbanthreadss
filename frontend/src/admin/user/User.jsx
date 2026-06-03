import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiUsers, FiUser, FiMail, FiSearch, FiRefreshCw, FiAward,
  FiCheck, FiSlash, FiTrash2, FiPhone, FiStar, FiDollarSign,
  FiChevronDown, FiChevronUp, FiShoppingBag, FiTag, FiCreditCard
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SEGMENT_STYLE = {
  vip:      { bg: "rgba(201,168,76,0.15)",  border: "rgba(201,168,76,0.35)",  text: "#c9a84c",  label: "⭐ VIP" },
  loyal:    { bg: "rgba(129,140,248,0.15)", border: "rgba(129,140,248,0.35)", text: "#818cf8",  label: "💎 Loyal" },
  regular:  { bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)",   text: "#4ade80",  label: "✅ Regular" },
  new:      { bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",   text: "#60a5fa",  label: "🆕 New" },
  inactive: { bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)", text: "#f87171",  label: "💤 Inactive" },
};

function SegmentBadge({ segment }) {
  const s = SEGMENT_STYLE[segment] || SEGMENT_STYLE.new;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {s.label}
    </span>
  );
}

export default function UserList() {
  const { users: adminUsers } = useAuth();
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [segFilter, setSegFilter] = useState("all");
  const [updatingRole, setUpdatingRole]     = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingUser, setDeletingUser]     = useState(null);

  useEffect(() => { setUsers(adminUsers || []); }, [adminUsers]);

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
        toast.success(`Role → ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally { setUpdatingRole(null); }
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally { setUpdatingStatus(null); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    setDeletingUser(userId);
    try {
      const { data } = await api.delete(`/auth/users/${userId}`);
      if (data.success) {
        toast.success("User deleted");
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally { setDeletingUser(null); }
  };

  const segments = ["all", "vip", "loyal", "regular", "new", "inactive"];

  const filtered = users.filter(u => {
    const matchSeg = segFilter === "all" ? true : u.segment === segFilter;
    if (!matchSeg) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s)
    );
  });

  const totalLoyalty    = users.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0);
  const totalCredit     = users.reduce((sum, u) => sum + (u.storeCredit || 0), 0);
  const vipCount        = users.filter(u => u.segment === "vip").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h2 className="font-display text-3xl font-bold text-(--text-primary)">Users & Customers</h2>
          <p className="text-(--text-muted) text-sm mt-1">{users.length} total members · {vipCount} VIP</p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 text-xs text-(--text-muted) border border-(--border) px-4 py-2.5 rounded-xl hover:text-(--text-primary) hover:border-(--border-light) transition-all">
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Users",    val: users.length,                                         color: "#c9a84c", icon: <FiUsers size={14}/> },
          { label: "Active",         val: users.filter(u => u.isActive !== false).length,        color: "#4ade80", icon: <FiCheck size={14}/> },
          { label: "Admins",         val: users.filter(u => u.role === "admin").length,           color: "#c084fc", icon: <FiAward size={14}/> },
          { label: "Total Loyalty",  val: `${totalLoyalty.toLocaleString()} pts`,                color: "#f59e0b", icon: <FiStar size={14}/> },
          { label: "Store Credits",  val: `Rs. ${totalCredit.toLocaleString()}`,                 color: "#60a5fa", icon: <FiCreditCard size={14}/> },
        ].map((s) => (
          <div key={s.label} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center shadow-sm">
            <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
            <div className="font-display text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-(--text-muted) text-[10px] mt-0.5 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH + SEGMENT FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="lux-input w-full" style={{ paddingLeft: "42px" }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {segments.map(seg => (
            <button key={seg} onClick={() => setSegFilter(seg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize tracking-wide transition-all ${
                segFilter === seg
                  ? "gold-gradient text-black shadow"
                  : "border border-(--border) text-(--text-muted) hover:border-(--border-light)"
              }`}>
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h3 className="text-(--text-primary) font-semibold flex items-center gap-2">
            <FiUsers size={16} className="text-(--gold)" /> All Members
          </h3>
          <span className="badge-gold">{filtered.length} users</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-(--text-muted) flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-(--gold) border-t-transparent rounded-full animate-spin" />
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-(--text-muted)">
            <FiUsers size={32} className="mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-(--bg-surface) text-(--text-muted) text-[10px] uppercase tracking-wider border-b border-(--border)">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Segment</th>
                  <th className="px-5 py-3">Loyalty</th>
                  <th className="px-5 py-3">Credit</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const isOpen = expanded === user._id;
                  return (
                    <>
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setExpanded(isOpen ? null : user._id)}
                        className={`border-t border-(--border) cursor-pointer transition-colors ${isOpen ? "bg-(--bg-surface)" : "hover:bg-(--bg-elevated)/30"}`}
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs shrink-0">
                              {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-(--text-primary) font-medium text-sm whitespace-nowrap">{user.name}</p>
                              {isOpen
                                ? <FiChevronUp size={10} className="text-(--gold)" />
                                : <FiChevronDown size={10} className="text-(--text-muted)" />
                              }
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <a href={`mailto:${user.email}`} onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-(--text-secondary) text-xs hover:text-(--gold) transition-colors">
                              <FiMail size={11} /> {user.email}
                            </a>
                            {user.phone && (
                              <a href={`tel:${user.phone}`} onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[#16a34a] text-xs hover:underline">
                                <FiPhone size={11} /> {user.phone}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* SEGMENT */}
                        <td className="px-5 py-4">
                          {user.segment ? <SegmentBadge segment={user.segment} /> : <span className="text-(--text-muted) text-xs">—</span>}
                        </td>

                        {/* LOYALTY POINTS */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-[#f59e0b]">
                            <FiStar size={11} />
                            <span className="font-bold text-sm">{(user.loyaltyPoints || 0).toLocaleString()}</span>
                            <span className="text-(--text-muted) text-[10px]">pts</span>
                          </div>
                        </td>

                        {/* STORE CREDIT */}
                        <td className="px-5 py-4">
                          <span className="text-[#60a5fa] font-semibold text-sm">
                            {user.storeCredit > 0 ? `Rs. ${user.storeCredit.toLocaleString()}` : <span className="text-(--text-muted)">—</span>}
                          </span>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                            user.role === "admin"
                              ? "text-(--gold) bg-(--gold)/10 border border-(--gold)/20"
                              : "text-(--text-muted) bg-(--bg-surface) border border-(--border)"
                          }`}>
                            {user.role || "user"}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span className={user.isActive !== false ? "badge-delivered" : "badge-cancelled"}>
                            {user.isActive !== false ? "Active" : "Blocked"}
                          </span>
                        </td>

                        {/* JOINED */}
                        <td className="px-5 py-4 text-(--text-muted) text-xs whitespace-nowrap">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {user.role === "user" ? (
                              <button onClick={() => handleRoleChange(user._id, "admin")}
                                disabled={updatingRole === user._id}
                                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-(--gold)/30 text-(--gold) hover:bg-(--gold)/10 disabled:opacity-50 transition-all"
                                title="Make Admin">
                                <FiAward size={11} /> {updatingRole === user._id ? "..." : "Admin"}
                              </button>
                            ) : (
                              <button onClick={() => handleRoleChange(user._id, "user")}
                                disabled={updatingRole === user._id}
                                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-(--border) text-(--text-muted) hover:bg-(--bg-surface) disabled:opacity-50 transition-all"
                                title="Demote to User">
                                <FiCheck size={11} /> {updatingRole === user._id ? "..." : "User"}
                              </button>
                            )}

                            <button onClick={() => handleStatusToggle(user._id, user.isActive !== false)}
                              disabled={updatingStatus === user._id}
                              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all ${
                                user.isActive !== false
                                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                              }`}
                              title={user.isActive !== false ? "Block User" : "Unblock User"}>
                              <FiSlash size={11} /> {updatingStatus === user._id ? "..." : (user.isActive !== false ? "Block" : "Unblock")}
                            </button>

                            <button onClick={() => handleDelete(user._id)}
                              disabled={deletingUser === user._id}
                              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                              title="Delete User">
                              <FiTrash2 size={11} /> {deletingUser === user._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* EXPANDED DETAIL */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.tr key={`${user._id}-detail`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan={9} className="bg-(--bg-deep) border-t border-(--border) px-6 py-5">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                {/* LOYALTY & CREDIT CARD */}
                                <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4 space-y-3">
                                  <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                    <FiStar size={11} className="text-(--gold)" /> Loyalty & Credits
                                  </p>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-(--text-muted) text-xs">Loyalty Points</span>
                                      <span className="text-[#f59e0b] font-bold">{(user.loyaltyPoints || 0).toLocaleString()} pts</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-(--text-muted) text-xs">Store Credit</span>
                                      <span className="text-[#60a5fa] font-bold">Rs. {(user.storeCredit || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-(--text-muted) text-xs">Segment</span>
                                      {user.segment ? <SegmentBadge segment={user.segment} /> : <span className="text-(--text-muted) text-xs">—</span>}
                                    </div>
                                  </div>
                                </div>

                                {/* ACCOUNT INFO */}
                                <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4 space-y-3">
                                  <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                    <FiUser size={11} className="text-(--gold)" /> Account Info
                                  </p>
                                  <div className="flex flex-col gap-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-(--text-muted)">User ID</span>
                                      <span className="text-(--text-primary) font-mono text-[10px]">{user._id?.slice(-12).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-(--text-muted)">Role</span>
                                      <span className="text-(--text-primary) font-semibold capitalize">{user.role || "user"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-(--text-muted)">Status</span>
                                      <span className={user.isActive !== false ? "text-[#4ade80] font-semibold" : "text-red-400 font-semibold"}>
                                        {user.isActive !== false ? "Active" : "Blocked"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-(--text-muted)">Joined</span>
                                      <span className="text-(--text-primary)">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CONTACT DETAILS */}
                                <div className="bg-(--bg-surface) border border-(--border) rounded-xl p-4 space-y-3">
                                  <p className="text-(--text-muted) text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                    <FiMail size={11} className="text-(--gold)" /> Contact Details
                                  </p>
                                  <div className="flex flex-col gap-2 text-xs">
                                    <div>
                                      <p className="text-(--text-muted) text-[10px] mb-0.5">Email</p>
                                      <a href={`mailto:${user.email}`} className="text-[#3b82f6] hover:underline break-all">{user.email}</a>
                                    </div>
                                    {user.phone && (
                                      <div>
                                        <p className="text-(--text-muted) text-[10px] mb-0.5">Phone</p>
                                        <a href={`tel:${user.phone}`} className="text-[#16a34a] hover:underline">{user.phone}</a>
                                      </div>
                                    )}
                                    {user.addresses?.length > 0 && (
                                      <div>
                                        <p className="text-(--text-muted) text-[10px] mb-0.5">Saved Addresses</p>
                                        <p className="text-(--text-primary)">{user.addresses.length} address{user.addresses.length > 1 ? "es" : ""}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-right text-(--text-muted) text-xs">
        Showing {filtered.length} of {users.length} users
      </div>
    </div>
  );
}
