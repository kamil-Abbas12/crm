"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/leads", label: "Leads", icon: "🎯" },
  { href: "/transfers", label: "Live Transfers", icon: "📞" },
  { href: "/pipeline", label: "Pipeline", icon: "🔄" },
  { href: "/agents", label: "Agents", icon: "👥" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#0d0d0d] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
            <span className="text-white font-black text-sm">TD</span>
          </div>
          <div>
            <h1 className="text-white font-black text-base leading-none tracking-tight">
              TOPDOG
            </h1>
            <p className="text-red-500 text-[10px] font-semibold tracking-widest uppercase">
              CRM
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase px-3 mb-2">
          Main Menu
        </p>
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-red-600/15 text-red-400 border border-red-800/40"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}

        <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase px-3 mb-2 mt-5">
          System
        </p>
        {navItems.slice(5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-red-600/15 text-red-400 border border-red-800/40"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">Admin</p>
            <p className="text-gray-600 text-xs truncate">admin@topdog.com</p>
          </div>
          <span className="text-gray-600 text-xs">›</span>
        </div>
      </div>
    </aside>
  );
}