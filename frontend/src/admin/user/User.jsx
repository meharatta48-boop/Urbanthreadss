import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

import { FiUsers, FiUser, FiMail, FiSearch, FiRefreshCw, FiAward, FiCheck, FiSlash, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";

export default function UserList() {
  const { users: adminUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    setUsers(adminUsers || []);
  }, [adminUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/users");
      if (data.success) setUsers(data.users);
    } catch {
      // Fallback to login data
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
        toast.success(`User role updated to ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
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
        toast.success(`User ${newStatus ? "unblocked" : "blocked"} successfully`);
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: newStatus } : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setDeletingUser(userId);
    try {
      const { data } = await api.delete(`/auth/users/${userId}`);
      if (data.success) {
        toast.success("User deleted successfully");
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users", val: users.length, color: "#c9a84c" },
          { label: "Active", val: users.filter((u) => u.isActive !== false).length, color: "#4ade80" },
          { label: "Admins", val: users.filter((u) => u.role === "admin").length, color: "#c084fc" },
        ].map((s) => (
          <div key={s.label} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 text-center shadow-sm">
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-(--text-muted) text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="lux-input"
          style={{ paddingLeft: "42px" }}
        />
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
          <div className="p-8 text-center text-(--text-muted)">Loading users...</div>
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
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-(--border) hover:bg-(--bg-elevated)/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-(--text-primary) font-medium text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-(--text-secondary) text-sm">
                        <FiMail size={13} /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        user.role === "admin"
                          ? "text-(--gold) bg-(--gold)/10 border border-(--gold)/20"
                          : "text-(--text-muted) bg-(--bg-surface) border border-(--border)"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={user.isActive !== false ? "badge-delivered" : "badge-cancelled"}>
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-(--text-muted) text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === "user" ? (
                          <button
                            onClick={() => handleRoleChange(user._id, "admin")}
                            disabled={updatingRole === user._id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-(--gold)/30 text-(--gold) hover:bg-(--gold)/10 disabled:opacity-50 transition-all"
                            title="Make Admin"
                          >
                            <FiAward size={12} /> {updatingRole === user._id ? "..." : "Admin"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user._id, "user")}
                            disabled={updatingRole === user._id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-(--border) text-(--gold) hover:bg-(--gold)/5 disabled:opacity-50 transition-all"
                            title="Remove Admin"
                          >
                            <FiCheck size={12} /> {updatingRole === user._id ? "..." : "User"}
                          </button>
                        )}

                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive !== false)}
                          disabled={updatingStatus === user._id}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            user.isActive !== false 
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10" 
                              : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                          }`}
                          title={user.isActive !== false ? "Block User" : "Unblock User"}
                        >
                          <FiSlash size={12} /> {updatingStatus === user._id ? "..." : (user.isActive !== false ? "Block" : "Unblock")}
                        </button>

                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deletingUser === user._id}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                          title="Delete User"
                        >
                          <FiTrash2 size={12} /> {deletingUser === user._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
