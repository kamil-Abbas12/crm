"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const user = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") { router.push("/dashboard"); return; }
    api.get("/api/users").then(r => setAgents(r.data)).finally(() => setLoading(false));
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: "admin" | "agent") => {
    if (!confirm(`Change this user to ${newRole}?`)) return;
    setUpdating(userId);
    try {
      const res = await api.put(`/api/users/${userId}`, { role: newRole });
      setAgents(prev => prev.map(a => a._id === userId ? { ...a, role: res.data.role } : a));
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      setAgents(prev => prev.filter(a => a._id !== userId));
    } catch {
      alert("Failed to delete user");
    }
  };

  const filtered = agents.filter(a =>
    !search ||
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = agents.filter(a => a.role === "admin").length;
  const agentCount = agents.filter(a => a.role === "agent").length;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Agents" />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Users", value: agents.length, icon: "👥", color: "text-white" },
              { label: "Admins", value: adminCount, icon: "👑", color: "text-amber-400" },
              { label: "Agents", value: agentCount, icon: "🎯", color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className={`text-2xl font-black ${s.color}`}>{loading ? "…" : s.value}</p>
                <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-black text-xl">User Management</h2>
              <p className="text-gray-600 text-sm">Promote agents to admin or remove access</p>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-amber-400 text-lg shrink-0">👑</span>
            <div>
              <p className="text-amber-300 text-sm font-semibold">Admin Access Control</p>
              <p className="text-amber-500/70 text-xs mt-0.5 leading-relaxed">
                All new signups are created as <strong className="text-amber-400">Agent</strong> by default.
                Only admins can promote users to Admin or revoke access from here.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-[#111] border border-white/5 rounded-xl p-4">
            <input type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition max-w-xs" />
          </div>

          {/* Table */}
          <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-600">No users found</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-white/5">
                  <tr>
                    {["User", "Email", "Current Role", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-bold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {filtered.map(agent => (
                    <tr key={agent._id} className="group hover:bg-white/3 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            agent.role === "admin" ? "bg-amber-900/60 text-amber-300" : "bg-red-900/60 text-red-300"
                          }`}>
                            {agent.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{agent.name}</p>
                            {agent._id === user?.id && (
                              <p className="text-gray-600 text-[10px]">— you</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{agent.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          agent.role === "admin"
                            ? "bg-amber-950 text-amber-400 border-amber-800/40"
                            : "bg-blue-950 text-blue-400 border-blue-800/40"
                        }`}>
                          {agent.role === "admin" ? "👑 Admin" : "🎯 Agent"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {agent._id !== user?.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={updating === agent._id}
                              onClick={() => handleRoleChange(agent._id, agent.role === "admin" ? "agent" : "admin")}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition disabled:opacity-50 ${
                                agent.role === "admin"
                                  ? "text-blue-400 border-blue-800/40 bg-blue-950/40 hover:bg-blue-950/70"
                                  : "text-amber-400 border-amber-800/40 bg-amber-950/40 hover:bg-amber-950/70"
                              }`}>
                              {updating === agent._id ? "…" : agent.role === "admin" ? "Demote to Agent" : "Promote to Admin"}
                            </button>
                            <button
                              onClick={() => handleDelete(agent._id, agent.name)}
                              className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-950/40 transition opacity-0 group-hover:opacity-100">
                              Remove
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-700 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}