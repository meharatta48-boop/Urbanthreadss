import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

import { FiUsers, FiUser, FiMail, FiSearch, FiRefreshCw, FiAward, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

export default function UserList() {
  const { users: adminUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);

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
          <h2 className="font-display text-3xl font-bold text-white">Users</h2>
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
          <div key={s.label} className="bg-[#0c0c0c] border border-[#111] rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[#444] text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="lux-input"
          style={{ paddingLeft: "42px" }}
        />
      </div>

      {/* TABLE */}
      <div className="bg-[#0c0c0c] border border-[#111] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#111] flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiUsers size={16} className="text-[#c9a84c]" /> All Users
          </h3>
          <span className="badge-gold">{filtered.length} users</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#333]">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[#333]">
            <FiUsers size={32} className="mx-auto mb-3 opacity-30" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111] text-[#444] text-xs uppercase tracking-wider">
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
                    className="border-t border-[#111] hover:bg-[#111] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-white font-medium text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#9a9a9a] text-sm">
                        <FiMail size={13} /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        user.role === "admin"
                          ? "text-[#c9a84c] bg-[rgba(201,168,76,0.1)] border border-[#c9a84c]/20"
                          : "text-[#555] bg-[#111] border border-[#1a1a1a]"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={user.isActive !== false ? "badge-delivered" : "badge-cancelled"}>
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#444] text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === "user" ? (
                          <button
                            onClick={() => handleRoleChange(user._id, "admin")}
                            disabled={updatingRole === user._id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[rgba(201,168,76,0.1)] disabled:opacity-50 transition-all"
                            title="Make Admin"
                          >
                            <FiAward size={12} /> {updatingRole === user._id ? "..." : "Make Admin"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user._id, "user")}
                            disabled={updatingRole === user._id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#555]/30 text-[#c9a84c] hover:bg-[rgba(201,168,76,0.05)] disabled:opacity-50 transition-all"
                            title="Remove Admin"
                          >
                            <FiCheck size={12} /> {updatingRole === user._id ? "..." : "Remove Admin"}
                          </button>
                        )}
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
