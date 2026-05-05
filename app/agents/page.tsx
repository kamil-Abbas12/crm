"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

type Role = "admin" | "agent";

type AgentUser = {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  role: Role;
  createdAt?: string;
};

export default function AgentsPage() {
  const router = useRouter();
const { user, loading} = useAuth();

  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    // If your useAuth hook returns null while hydrating, wait.
    if (user === null) return;

    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/users");
        setAgents(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("Failed to load users:", err);

        if (err?.response?.status === 401) {
          router.replace("/login");
          return;
        }

        if (err?.response?.status === 403) {
          router.replace("/dashboard");
          return;
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchUsers();
  }, [user, router]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!confirm(`Change this user to ${newRole}?`)) return;

    setUpdating(userId);

    try {
      const res = await api.put(`/api/users/${userId}`, { role: newRole });

      setAgents((prev) =>
        prev.map((agent) =>
          agent._id === userId
            ? { ...agent, role: res.data?.role ?? newRole }
            : agent
        )
      );
    } catch (err: any) {
      console.error("Failed to update role:", err);
      alert(err?.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/api/users/${userId}`);
      setAgents((prev) => prev.filter((agent) => agent._id !== userId));
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;

    return agents.filter(
      (agent) =>
        agent.name?.toLowerCase().includes(q) ||
        agent.email?.toLowerCase().includes(q)
    );
  }, [agents, search]);

  const adminCount = agents.filter((agent) => agent.role === "admin").length;
  const agentCount = agents.filter((agent) => agent.role === "agent").length;

  if (user === null) {
    return (
      <AppLayout title="Agents">
        <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
          Loading…
        </div>
      </AppLayout>
    );
  }

  if (user.role !== "admin") {
    return (
      <AppLayout title="Agents">
        <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
          Redirecting…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Agents">
      <main className="p-3 sm:p-5 space-y-3 sm:space-y-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Total Users", value: agents.length, icon: "👥", color: "text-white" },
            { label: "Admins", value: adminCount, icon: "👑", color: "text-amber-400" },
            { label: "Agents", value: agentCount, icon: "🎯", color: "text-blue-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111] border border-white/5 rounded-xl p-3 sm:p-4 text-center"
            >
              <p className="text-lg sm:text-xl mb-1">{stat.icon}</p>
              <p className={`text-xl sm:text-2xl font-black ${stat.color}`}>
                {pageLoading ? "…" : stat.value}
              </p>
              <p className="text-gray-600 text-[10px] sm:text-xs mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg sm:text-xl">
              User Management
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Promote agents to admin or remove access
            </p>
          </div>
        </div>

        <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <span className="text-amber-400 text-base sm:text-lg shrink-0">👑</span>
          <div>
            <p className="text-amber-300 text-xs sm:text-sm font-semibold">
              Admin Access Control
            </p>
            <p className="text-amber-500/70 text-xs mt-0.5 leading-relaxed">
              All new signups are created as{" "}
              <strong className="text-amber-400">Agent</strong> by default.
              Only admins can promote users to Admin or revoke access from here.
            </p>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl p-3 sm:p-4">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs bg-[#1a1a1a] border border-white/8 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition"
          />
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
          {pageLoading ? (
            <div className="p-4 sm:p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 sm:h-12 bg-white/5 rounded animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-600 text-sm">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="border-b border-white/5">
                  <tr>
                    {["User", "Email", "Role", "Joined", "Actions"].map((heading) => (
                      <th
                        key={heading}
                        className="px-3 sm:px-4 py-3 text-left text-gray-600 font-bold text-xs uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {filtered.map((agent) => (
                    <tr key={agent._id} className="group hover:bg-white/3 transition">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              agent.role === "admin"
                                ? "bg-amber-900/60 text-amber-300"
                                : "bg-red-900/60 text-red-300"
                            }`}
                          >
                            {agent.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-xs sm:text-sm truncate">
                              {agent.name || "Unnamed user"}
                            </p>
                            {agent._id === user.id && (
                              <p className="text-gray-600 text-[10px]">— you</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">
                        {agent.email || "—"}
                      </td>

                      <td className="px-3 sm:px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${
                            agent.role === "admin"
                              ? "bg-amber-950 text-amber-400 border-amber-800/40"
                              : "bg-blue-950 text-blue-400 border-blue-800/40"
                          }`}
                        >
                          {agent.role === "admin" ? "👑 Admin" : "🎯 Agent"}
                        </span>
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {agent.createdAt
                          ? new Date(agent.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-3 sm:px-4 py-3">
                        {agent._id !== user.id ? (
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <button
                              disabled={updating === agent._id}
                              onClick={() =>
                                handleRoleChange(
                                  agent._id,
                                  agent.role === "admin" ? "agent" : "admin"
                                )
                              }
                              className={`text-xs font-semibold px-2 py-1 rounded-lg border transition disabled:opacity-50 whitespace-nowrap ${
                                agent.role === "admin"
                                  ? "text-blue-400 border-blue-800/40 bg-blue-950/40 hover:bg-blue-950/70"
                                  : "text-amber-400 border-amber-800/40 bg-amber-950/40 hover:bg-amber-950/70"
                              }`}
                            >
                              {updating === agent._id
                                ? "…"
                                : agent.role === "admin"
                                ? "Demote"
                                : "Promote"}
                            </button>

                            <button
                              onClick={() => handleDelete(agent._id, agent.name || "this user")}
                              className="text-xs text-red-500 hover:text-red-400 px-1.5 py-1 rounded-lg hover:bg-red-950/40 transition opacity-0 group-hover:opacity-100"
                            >
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
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
