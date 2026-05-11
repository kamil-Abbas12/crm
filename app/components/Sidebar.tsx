"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

const agentNav = [
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/leads", label: "My Leads", icon: "🎯" },
  { href: "/activity", label: "Log Activity", icon: "📝" },
  { href: "/my-stats", label: "My Stats", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/leads", label: "All Leads", icon: "🎯" },
  { href: "/activity", label: "Activity Log", icon: "📝" },
  { href: "/agents", label: "Agents", icon: "👥" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {user} = useAuth();
  const nav = user?.role === "admin" ? adminNav : agentNav;

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "user_role=; path=/; max-age=0";
    document.cookie = "user_name=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside className="w-60 h-full min-h-screen bg-[#0d1526] border-r border-blue-900/30 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-blue-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <span className="text-white font-black text-xs">TD</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">TOPDOG</p>
            <p className="text-blue-400 text-[10px] font-semibold tracking-widest">CRM</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-blue-700 hover:text-white p-1 rounded-lg hover:bg-blue-900/30 transition lg:hidden">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Role badge */}
      {user && (
        <div className="px-4 pt-4 pb-1">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${
            user.role === "admin"
              ? "bg-amber-950/60 text-amber-400 border-amber-800/40"
              : "bg-blue-950/60 text-blue-400 border-blue-800/40"
          }`}>
            {user.role === "admin" ? "👑 Admin" : "🎯 Agent"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600/20 text-blue-300 border border-blue-600/40"
                  : "text-blue-300/50 hover:text-blue-100 hover:bg-blue-900/20"
              }`}>
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-blue-900/30">
        {user && (
          <div className="mb-3 px-1">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <p className="text-blue-400/50 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-400/50 hover:text-blue-300 hover:bg-blue-900/30 text-sm transition">
          <span>⬅</span> Sign out
        </button>
      </div>
    </aside>
  );
}