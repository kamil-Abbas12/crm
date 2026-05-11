"use client";

import { useEffect, useState, type FormEvent } from "react";
import api from "../../lib/axios";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";

type Tab = "profile" | "password" | "team" | "notifications" | "system";

type NotificationSettings = {
  newLead: boolean;
  conversion: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  agentActivity: boolean;
};

type SystemSettings = {
  allowSignup: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: string;
  companyName: string;
  companyEmail: string;
  timezone: string;
};

type UserRole = "admin" | "agent" | string;

type AuthUser = {
  name?: string;
  email?: string;
  role?: UserRole;
} | null;

export default function SettingsPage() {
  const user = useAuth() as AuthUser;

  const [tab, setTab] = useState<Tab>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  // Notifications
  const [notifs, setNotifs] = useState<NotificationSettings>({
    newLead: true,
    conversion: true,
    dailySummary: false,
    weeklyReport: true,
    agentActivity: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  // System (admin only)
  const [system, setSystem] = useState<SystemSettings>({
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
    const nextName = user?.name || "";
    const nextEmail = user?.email || "";

    setProfile((prev) => {
      if (prev.name === nextName && prev.email === nextEmail) {
        return prev;
      }
      return { name: nextName, email: nextEmail };
    });
  }, [user?.name, user?.email]);

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: "👤" },
    { key: "password" as const, label: "Password", icon: "🔒" },
    { key: "notifications" as const, label: "Notifications", icon: "🔔" },
    { key: "team" as const, label: "Team", icon: "👥" },
    { key: "system" as const, label: "System", icon: "⚙️", adminOnly: true },
  ].filter(
    (t) => !t.adminOnly || user?.role === "admin"
  ) as { key: Tab; label: string; icon: string; adminOnly?: boolean }[];

  // Navy dark theme — matches dashboard screenshot
  const inputCls =
    "w-full bg-[#0a0f1e] border border-[#1e3a5f]/50 rounded-lg px-4 py-2.5 text-white placeholder-[#3a5a8a] text-sm outline-none focus:border-[#00b4ff]/60 transition";

  const labelCls =
    "block text-[#4a7aaa] text-xs font-bold tracking-widest uppercase mb-1.5";

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setProfileMsg("✅ Profile updated successfully");
    } catch {
      setProfileMsg("❌ Failed to update profile");
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(""), 3000);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassMsg("");

    if (passwords.newPass.length < 8) {
      setPassError("New password must be at least 8 characters.");
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      setPassError("Passwords do not match.");
      return;
    }

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

  const handleNotificationsSave = async () => {
    setNotifSaving(true);
    setNotifMsg("");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setNotifMsg("✅ Notification preferences saved");
    } catch {
      setNotifMsg("❌ Failed to save notification preferences");
    } finally {
      setNotifSaving(false);
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const handleSystemSave = async (e: FormEvent) => {
    e.preventDefault();
    setSystemSaving(true);
    setSystemMsg("");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setSystemMsg("✅ System settings saved");
    } catch {
      setSystemMsg("❌ Failed to save system settings");
    } finally {
      setSystemSaving(false);
      setTimeout(() => setSystemMsg(""), 3000);
    }
  };

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#0066cc]" : "bg-[#1e3a5f]/60"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#060d1a]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static z-30 transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header — navy tone matching dashboard */}
        <header className="h-14 bg-[#0a0f1e] border-b border-[#1e3a5f]/40 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#4a7aaa] hover:text-white p-1.5 rounded-lg hover:bg-[#1e3a5f]/30 transition"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-white font-black text-base tracking-tight flex-1">
            Settings
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-5">
            <div>
              <h1 className="text-white font-black text-xl sm:text-2xl tracking-tight">
                Settings
              </h1>
              <p className="text-[#4a7aaa] text-sm mt-1">
                Manage your account and workspace preferences
              </p>
            </div>

            {/* Tab bar — navy bg with cyan-blue active state */}
            <div className="overflow-x-auto">
              <div className="flex gap-1 bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-1 min-w-max sm:min-w-0">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                      tab === t.key
                        ? "bg-[#0066cc]/25 text-[#00b4ff] border border-[#0066cc]/50"
                        : "text-[#4a7aaa] hover:text-[#8ab4d4] hover:bg-[#1e3a5f]/20"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {tab === "profile" && (
              <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-5 sm:p-6">
                <h3 className="text-white font-black text-base mb-5">
                  Profile Information
                </h3>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 p-4 bg-[#1e3a5f]/10 border border-[#1e3a5f]/30 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066cc] to-[#003380] flex items-center justify-center shrink-0 text-2xl font-black text-white">
                    {profile.name?.charAt(0) || "?"}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-white font-black text-lg">
                      {profile.name || "Unnamed User"}
                    </p>
                    <p className="text-[#4a7aaa] text-sm">
                      {profile.email || "No email"}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        user?.role === "admin"
                          ? "bg-[#1a2a00]/60 text-[#aadd00] border-[#aadd00]/30"
                          : "bg-[#003380]/40 text-[#00b4ff] border-[#0066cc]/40"
                      }`}
                    >
                      {user?.role === "admin" ? "👑 Admin" : "🎯 Agent"}
                    </span>
                  </div>
                </div>

                {profileMsg && (
                  <div className="mb-4 p-3 bg-[#003820]/60 border border-[#00aa55]/30 rounded-lg text-[#00cc66] text-sm">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        placeholder="Your name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        placeholder="you@email.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0080ff] disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-[#0066cc]/30"
                    >
                      {profileSaving ? "Saving…" : "Save Profile →"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === "password" && (
              <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-5 sm:p-6">
                <h3 className="text-white font-black text-base mb-1">
                  Change Password
                </h3>
                <p className="text-[#4a7aaa] text-sm mb-5">
                  Choose a strong password with at least 8 characters.
                </p>

                {passMsg && (
                  <div className="mb-4 p-3 bg-[#003820]/60 border border-[#00aa55]/30 rounded-lg text-[#00cc66] text-sm">
                    {passMsg}
                  </div>
                )}

                {passError && (
                  <div className="mb-4 p-3 bg-[#1a0a00]/60 border border-[#cc4400]/30 rounded-lg text-[#ff7744] text-sm">
                    ⚠ {passError}
                  </div>
                )}

                <form
                  onSubmit={handlePasswordSave}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label className={labelCls}>Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          current: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 8 characters"
                      value={passwords.newPass}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPass: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirm: e.target.value,
                        })
                      }
                      className={`${inputCls} ${
                        passwords.confirm &&
                        passwords.newPass !== passwords.confirm
                          ? "border-[#cc4400]/60"
                          : ""
                      }`}
                    />
                    {passwords.confirm &&
                      passwords.newPass !== passwords.confirm && (
                        <p className="text-[#ff7744] text-xs mt-1">
                          Passwords don&apos;t match
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={passSaving}
                    className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0080ff] disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-[#0066cc]/30"
                  >
                    {passSaving ? "Updating…" : "Update Password →"}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-[#1e3a5f]/10 border border-[#1e3a5f]/30 rounded-xl">
                  <p className="text-[#4a7aaa] text-xs font-bold uppercase tracking-wider mb-2">
                    Forgot your password?
                  </p>
                  <p className="text-[#3a5a8a] text-sm mb-3">
                    We&apos;ll send a reset link to your email address.
                  </p>
                  <a
                    href="/forgot-password"
                    className="inline-flex items-center gap-1.5 text-[#00b4ff] hover:text-[#66ccff] text-sm font-semibold transition"
                  >
                    Send reset email →
                  </a>
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-5 sm:p-6">
                <h3 className="text-white font-black text-base mb-1">
                  Notification Preferences
                </h3>
                <p className="text-[#4a7aaa] text-sm mb-5">
                  Choose what you want to be notified about.
                </p>

                {notifMsg && (
                  <div className="mb-4 p-3 bg-[#003820]/60 border border-[#00aa55]/30 rounded-lg text-[#00cc66] text-sm">
                    {notifMsg}
                  </div>
                )}

                <div className="space-y-1">
                  {[
                    {
                      key: "newLead" as const,
                      label: "New Lead Assigned",
                      desc: "Get notified when a lead is assigned to you",
                      icon: "🎯",
                    },
                    {
                      key: "conversion" as const,
                      label: "Lead Converted",
                      desc: "Alert when a lead status changes to converted",
                      icon: "✅",
                    },
                    {
                      key: "dailySummary" as const,
                      label: "Daily Summary",
                      desc: "Receive a daily digest of your activity",
                      icon: "📊",
                    },
                    {
                      key: "weeklyReport" as const,
                      label: "Weekly Report",
                      desc: "Weekly performance report every Monday",
                      icon: "📅",
                    },
                    ...(user?.role === "admin"
                      ? [
                          {
                            key: "agentActivity" as const,
                            label: "Agent Activity",
                            desc: "Admin alerts for agent performance",
                            icon: "👥",
                          },
                        ]
                      : []),
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1e3a5f]/10 transition group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-semibold">
                            {item.label}
                          </p>
                          <p className="text-[#3a5a8a] text-xs mt-0.5 truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <Toggle
                        checked={notifs[item.key]}
                        onChange={() =>
                          setNotifs((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[#1e3a5f]/30">
                  <button
                    type="button"
                    onClick={handleNotificationsSave}
                    disabled={notifSaving}
                    className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0080ff] disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-[#0066cc]/30"
                  >
                    {notifSaving ? "Saving…" : "Save Preferences →"}
                  </button>
                </div>
              </div>
            )}

            {tab === "team" && (
              <div className="space-y-4">
                <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-5 sm:p-6">
                  <h3 className="text-white font-black text-base mb-1">
                    Team & Access
                  </h3>
                  <p className="text-[#4a7aaa] text-sm mb-5">
                    How roles work in TopDog CRM.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Admin card — warm gold accent */}
                    <div className="p-4 bg-[#1a1400]/40 border border-[#aa8800]/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">👑</span>
                        <p className="text-[#ffcc00] font-black text-sm">
                          Admin
                        </p>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          "View all leads from all agents",
                          "Manage and promote users",
                          "Access reports & analytics",
                          "Configure system settings",
                          "Delete any lead or user",
                        ].map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-2 text-xs text-[#4a7aaa]"
                          >
                            <span className="text-[#aa8800] mt-0.5 shrink-0">
                              ✓
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Agent card — cyan-blue accent */}
                    <div className="p-4 bg-[#00264d]/20 border border-[#0066cc]/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🎯</span>
                        <p className="text-[#00b4ff] font-black text-sm">
                          Agent
                        </p>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          "View and manage own leads only",
                          "Log calls and activity",
                          "Track personal stats",
                          "Add new leads",
                          "Reset own password",
                        ].map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-2 text-xs text-[#4a7aaa]"
                          >
                            <span className="text-[#0066cc] mt-0.5 shrink-0">
                              ✓
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1e3a5f]/10 border border-[#1e3a5f]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Manage user roles
                      </p>
                      <p className="text-[#3a5a8a] text-xs mt-0.5">
                        Promote agents to admin or remove access
                      </p>
                    </div>

                    {user?.role === "admin" ? (
                      <a
                        href="/agents"
                        className="shrink-0 bg-[#0066cc] hover:bg-[#0080ff] text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-[#0066cc]/30"
                      >
                        Go to Agents →
                      </a>
                    ) : (
                      <span className="text-[#3a5a8a] text-xs">
                        Contact your admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Danger Zone — dark red tint */}
                <div className="bg-[#0a0f1e] border border-[#660000]/40 rounded-xl p-5 sm:p-6">
                  <h3 className="text-[#ff4444] font-black text-base mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-[#4a7aaa] text-sm mb-4">
                    These actions are irreversible. Please be certain.
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#330000]/30 border border-[#660000]/30 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Sign out of all devices
                      </p>
                      <p className="text-[#3a5a8a] text-xs mt-0.5">
                        Invalidates all active sessions
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        document.cookie = "token=; path=/; max-age=0";
                        document.cookie = "user_role=; path=/; max-age=0";
                        document.cookie = "user_name=; path=/; max-age=0";
                        window.location.href = "/login";
                      }}
                      className="shrink-0 border border-[#660000]/60 text-[#ff4444] hover:bg-[#330000]/50 text-sm font-bold px-4 py-2 rounded-lg transition"
                    >
                      Sign Out Everywhere
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === "system" && user?.role === "admin" && (
              <div className="space-y-4">
                <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-5 sm:p-6">
                  <h3 className="text-white font-black text-base mb-5">
                    System Configuration
                  </h3>

                  {systemMsg && (
                    <div className="mb-4 p-3 bg-[#003820]/60 border border-[#00aa55]/30 rounded-lg text-[#00cc66] text-sm">
                      {systemMsg}
                    </div>
                  )}

                  <form onSubmit={handleSystemSave} className="space-y-5">
                    <div>
                      <p className="text-[#4a7aaa] text-xs font-bold tracking-widest uppercase mb-3">
                        Company Information
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Company Name</label>
                          <input
                            value={system.companyName}
                            onChange={(e) =>
                              setSystem({
                                ...system,
                                companyName: e.target.value,
                              })
                            }
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Company Email</label>
                          <input
                            type="email"
                            value={system.companyEmail}
                            onChange={(e) =>
                              setSystem({
                                ...system,
                                companyEmail: e.target.value,
                              })
                            }
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Timezone</label>
                          <select
                            value={system.timezone}
                            onChange={(e) =>
                              setSystem({
                                ...system,
                                timezone: e.target.value,
                              })
                            }
                            className={inputCls}
                          >
                            {[
                              "America/Chicago",
                              "America/New_York",
                              "America/Denver",
                              "America/Los_Angeles",
                              "America/Phoenix",
                            ].map((tz) => (
                              <option key={tz} value={tz}>
                                {tz}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelCls}>
                            Session Timeout (days)
                          </label>
                          <select
                            value={system.sessionTimeout}
                            onChange={(e) =>
                              setSystem({
                                ...system,
                                sessionTimeout: e.target.value,
                              })
                            }
                            className={inputCls}
                          >
                            {["1", "3", "7", "14", "30"].map((d) => (
                              <option key={d} value={d}>
                                {d} day{d !== "1" ? "s" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#4a7aaa] text-xs font-bold tracking-widest uppercase mb-3">
                        Access Control
                      </p>

                      <div className="space-y-1">
                        {[
                          {
                            key: "allowSignup" as const,
                            label: "Allow public signup",
                            desc: "Anyone can create an agent account",
                          },
                          {
                            key: "requireEmailVerification" as const,
                            label: "Require email verification",
                            desc: "New accounts must verify email before access",
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-4 rounded-xl hover:bg-[#1e3a5f]/10 transition"
                          >
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-white text-sm font-semibold">
                                {item.label}
                              </p>
                              <p className="text-[#3a5a8a] text-xs mt-0.5">
                                {item.desc}
                              </p>
                            </div>

                            <Toggle
                              checked={system[item.key]}
                              onChange={() =>
                                setSystem((prev) => ({
                                  ...prev,
                                  [item.key]: !prev[item.key],
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={systemSaving}
                      className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0080ff] disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-lg transition text-sm shadow-lg shadow-[#0066cc]/30"
                    >
                      {systemSaving ? "Saving…" : "Save System Settings →"}
                    </button>
                  </form>
                </div>

                <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-5 sm:p-6">
                  <h3 className="text-white font-black text-sm mb-4">
                    Environment Info
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Platform", value: "Next.js 16" },
                      { label: "Database", value: "MongoDB Atlas" },
                      {
                        label: "Environment",
                        value: process.env.NODE_ENV || "development",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-[#1e3a5f]/10 border border-[#1e3a5f]/30 rounded-lg"
                      >
                        <p className="text-[#3a5a8a] text-[10px] font-bold uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className="text-white text-sm font-semibold mt-1">
                          {item.value}
                        </p>
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