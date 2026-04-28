"use client";

import { useState, useEffect } from "react";
import api from "../../lib/axios";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

type Tab = "profile" | "password" | "team" | "notifications" | "system";

export default function SettingsPage() {
  const user = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  // Notifications
  const [notifs, setNotifs] = useState({
    newLead: true,
    conversion: true,
    dailySummary: false,
    weeklyReport: true,
    agentActivity: true,
  });

  // System (admin only)
  const [system, setSystem] = useState({
    allowSignup: true,
    requireEmailVerification: false,
    sessionTimeout: "7",
    companyName: "Top Dog Leads LLC",
    companyEmail: "info@topdogleads.com",
    timezone: "America/Chicago",
  });
  const [systemSaving, setSystemSaving] = useState(false);
  const [systemMsg, setSystemMsg] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: "👤" },
    { key: "password" as const, label: "Password", icon: "🔒" },
    { key: "notifications" as const, label: "Notifications", icon: "🔔" },
    { key: "team" as const, label: "Team", icon: "👥" },
    { key: "system" as const, label: "System", icon: "⚙️", adminOnly: true },
  ].filter(t => !t.adminOnly || user?.role === "admin") as { key: Tab; label: string; icon: string; adminOnly?: boolean }[];

  const inputCls = "w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition";
  const labelCls = "block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5";

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    // Simulate save — wire to /api/users/me when ready
    await new Promise(r => setTimeout(r, 800));
    setProfileMsg("✅ Profile updated successfully");
    setProfileSaving(false);
    setTimeout(() => setProfileMsg(""), 3000);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassMsg("");
    if (passwords.newPass.length < 8) { setPassError("New password must be at least 8 characters."); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError("Passwords do not match."); return; }
    setPassSaving(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPassMsg("✅ Password changed successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      setPassError(err?.response?.data?.error || "Failed to change password");
    } finally {
      setPassSaving(false);
      setTimeout(() => setPassMsg(""), 3000);
    }
  };

  const handleSystemSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSystemMsg("✅ System settings saved");
    setSystemSaving(false);
    setTimeout(() => setSystemMsg(""), 3000);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-red-600" : "bg-white/10"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed lg:static z-30 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar with mobile menu */}
        <header className="h-14 bg-[#0d0d0d] border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-white font-black text-base tracking-tight flex-1">Settings</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Page header */}
            <div>
              <h1 className="text-white font-black text-xl sm:text-2xl tracking-tight">Settings</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your account and workspace preferences</p>
            </div>

            {/* Tab navigation — scrollable on mobile */}
            <div className="overflow-x-auto">
              <div className="flex gap-1 bg-[#111] border border-white/5 rounded-xl p-1 min-w-max sm:min-w-0">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                      tab === t.key
                        ? "bg-red-600/20 text-red-400 border border-red-800/30"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}>
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── PROFILE TAB ── */}
            {tab === "profile" && (
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 sm:p-6">
                <h3 className="text-white font-black text-base mb-5">Profile Information</h3>

                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 p-4 bg-white/3 border border-white/5 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center shrink-0 text-2xl font-black text-white">
                    {profile.name?.charAt(0) || "?"}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-white font-black text-lg">{profile.name}</p>
                    <p className="text-gray-500 text-sm">{profile.email}</p>
                    <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      user?.role === "admin"
                        ? "bg-amber-950 text-amber-400 border-amber-800/40"
                        : "bg-blue-950 text-blue-400 border-blue-800/40"
                    }`}>
                      {user?.role === "admin" ? "👑 Admin" : "🎯 Agent"}
                    </span>
                  </div>
                </div>

                {profileMsg && (
                  <div className="mb-4 p-3 bg-green-950/60 border border-green-800/40 rounded-lg text-green-400 text-sm">{profileMsg}</div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Your name" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                        placeholder="you@email.com" className={inputCls} />
                    </div>
                  </div>
                  <div className="pt-1">
                    <button type="submit" disabled={profileSaving}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                      {profileSaving ? "Saving…" : "Save Profile →"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── PASSWORD TAB ── */}
            {tab === "password" && (
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 sm:p-6">
                <h3 className="text-white font-black text-base mb-1">Change Password</h3>
                <p className="text-gray-600 text-sm mb-5">Choose a strong password with at least 8 characters.</p>

                {passMsg && <div className="mb-4 p-3 bg-green-950/60 border border-green-800/40 rounded-lg text-green-400 text-sm">{passMsg}</div>}
                {passError && <div className="mb-4 p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-red-400 text-sm">⚠ {passError}</div>}

                <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                  <div>
                    <label className={labelCls}>Current Password</label>
                    <input type="password" required placeholder="••••••••"
                      value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Password</label>
                    <input type="password" required placeholder="Min. 8 characters"
                      value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm New Password</label>
                    <input type="password" required placeholder="Re-enter new password"
                      value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={`${inputCls} ${passwords.confirm && passwords.newPass !== passwords.confirm ? "border-red-700/60" : ""}`} />
                    {passwords.confirm && passwords.newPass !== passwords.confirm && (
                      <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                    )}
                  </div>
                  <button type="submit" disabled={passSaving}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                    {passSaving ? "Updating…" : "Update Password →"}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-white/3 border border-white/5 rounded-xl">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Forgot your password?</p>
                  <p className="text-gray-600 text-sm mb-3">We'll send a reset link to your email address.</p>
                  <a href="/forgot-password"
                    className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-semibold transition">
                    Send reset email →
                  </a>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {tab === "notifications" && (
              <div className="bg-[#111] border border-white/5 rounded-xl p-5 sm:p-6">
                <h3 className="text-white font-black text-base mb-1">Notification Preferences</h3>
                <p className="text-gray-600 text-sm mb-5">Choose what you want to be notified about.</p>

                <div className="space-y-1">
                  {[
                    { key: "newLead", label: "New Lead Assigned", desc: "Get notified when a lead is assigned to you", icon: "🎯" },
                    { key: "conversion", label: "Lead Converted", desc: "Alert when a lead status changes to converted", icon: "✅" },
                    { key: "dailySummary", label: "Daily Summary", desc: "Receive a daily digest of your activity", icon: "📊" },
                    { key: "weeklyReport", label: "Weekly Report", desc: "Weekly performance report every Monday", icon: "📅" },
                    ...(user?.role === "admin" ? [{ key: "agentActivity", label: "Agent Activity", desc: "Admin alerts for agent performance", icon: "👥" }] : []),
                  ].map((item) => (
                    <div key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-white/3 transition group">
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-semibold">{item.label}</p>
                          <p className="text-gray-600 text-xs mt-0.5 truncate">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={(notifs as any)[item.key]}
                        onChange={() => setNotifs(n => ({ ...n, [item.key]: !(n as any)[item.key] }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <button className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                    Save Preferences →
                  </button>
                </div>
              </div>
            )}

            {/* ── TEAM TAB ── */}
            {tab === "team" && (
              <div className="space-y-4">
                <div className="bg-[#111] border border-white/5 rounded-xl p-5 sm:p-6">
                  <h3 className="text-white font-black text-base mb-1">Team & Access</h3>
                  <p className="text-gray-600 text-sm mb-5">How roles work in TopDog CRM.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-amber-950/20 border border-amber-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">👑</span>
                        <p className="text-amber-400 font-black text-sm">Admin</p>
                      </div>
                      <ul className="space-y-1.5">
                        {["View all leads from all agents", "Manage and promote users", "Access reports & analytics", "Configure system settings", "Delete any lead or user"].map(p => (
                          <li key={p} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="text-amber-600 mt-0.5 shrink-0">✓</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-950/20 border border-blue-800/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🎯</span>
                        <p className="text-blue-400 font-black text-sm">Agent</p>
                      </div>
                      <ul className="space-y-1.5">
                        {["View and manage own leads only", "Log calls and activity", "Track personal stats", "Add new leads", "Reset own password"].map(p => (
                          <li key={p} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="text-blue-600 mt-0.5 shrink-0">✓</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-white/3 border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-semibold">Manage user roles</p>
                      <p className="text-gray-600 text-xs mt-0.5">Promote agents to admin or remove access</p>
                    </div>
                    {user?.role === "admin" ? (
                      <a href="/agents"
                        className="shrink-0 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-red-900/30">
                        Go to Agents →
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">Contact your admin</span>
                    )}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-[#111] border border-red-900/30 rounded-xl p-5 sm:p-6">
                  <h3 className="text-red-400 font-black text-base mb-1">Danger Zone</h3>
                  <p className="text-gray-600 text-sm mb-4">These actions are irreversible. Please be certain.</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-semibold">Sign out of all devices</p>
                      <p className="text-gray-600 text-xs mt-0.5">Invalidates all active sessions</p>
                    </div>
                    <button
                      onClick={() => {
                        document.cookie = "token=; path=/; max-age=0";
                        document.cookie = "user_role=; path=/; max-age=0";
                        document.cookie = "user_name=; path=/; max-age=0";
                        window.location.href = "/login";
                      }}
                      className="shrink-0 border border-red-800/50 text-red-400 hover:bg-red-950/50 text-sm font-bold px-4 py-2 rounded-lg transition">
                      Sign Out Everywhere
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── SYSTEM TAB (admin only) ── */}
            {tab === "system" && user?.role === "admin" && (
              <div className="space-y-4">
                <div className="bg-[#111] border border-white/5 rounded-xl p-5 sm:p-6">
                  <h3 className="text-white font-black text-base mb-5">System Configuration</h3>

                  {systemMsg && <div className="mb-4 p-3 bg-green-950/60 border border-green-800/40 rounded-lg text-green-400 text-sm">{systemMsg}</div>}

                  <form onSubmit={handleSystemSave} className="space-y-5">
                    {/* Company info */}
                    <div>
                      <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-3">Company Information</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Company Name</label>
                          <input value={system.companyName} onChange={e => setSystem({ ...system, companyName: e.target.value })}
                            className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Company Email</label>
                          <input type="email" value={system.companyEmail} onChange={e => setSystem({ ...system, companyEmail: e.target.value })}
                            className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Timezone</label>
                          <select value={system.timezone} onChange={e => setSystem({ ...system, timezone: e.target.value })}
                            className={inputCls}>
                            {["America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles", "America/Phoenix"].map(tz => (
                              <option key={tz} value={tz}>{tz}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Session Timeout (days)</label>
                          <select value={system.sessionTimeout} onChange={e => setSystem({ ...system, sessionTimeout: e.target.value })}
                            className={inputCls}>
                            {["1", "3", "7", "14", "30"].map(d => (
                              <option key={d} value={d}>{d} day{d !== "1" ? "s" : ""}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Access control */}
                    <div>
                      <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-3">Access Control</p>
                      <div className="space-y-1">
                        {[
                          { key: "allowSignup", label: "Allow public signup", desc: "Anyone can create an agent account" },
                          { key: "requireEmailVerification", label: "Require email verification", desc: "New accounts must verify email before access" },
                        ].map(item => (
                          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/3 transition">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-white text-sm font-semibold">{item.label}</p>
                              <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
                            </div>
                            <Toggle
                              checked={(system as any)[item.key]}
                              onChange={() => setSystem(s => ({ ...s, [item.key]: !(s as any)[item.key] }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={systemSaving}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                      {systemSaving ? "Saving…" : "Save System Settings →"}
                    </button>
                  </form>
                </div>

                {/* Environment info */}
                <div className="bg-[#111] border border-white/5 rounded-xl p-5 sm:p-6">
                  <h3 className="text-white font-black text-sm mb-4">Environment Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Platform", value: "Next.js 16" },
                      { label: "Database", value: "MongoDB Atlas" },
                      { label: "Environment", value: process.env.NODE_ENV || "development" },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-white/3 border border-white/5 rounded-lg">
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
                        <p className="text-white text-sm font-semibold mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}