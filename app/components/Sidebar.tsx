"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

const agentNav = [
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/leads", label: "My Leads", icon: "🎯" },
  { href: "/activity", label: "Log Activity", icon: "📝" },
  { href: "/my-stats", label: "My Stats", icon: "📊" },
];

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
  { href: "/leads", label: "All Leads", icon: "🎯" },
  { href: "/activity", label: "Activity Log", icon: "📝" },
  { href: "/agents", label: "Agents", icon: "👥" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeUser = mounted ? user : null;
  const nav = safeUser?.role === "admin" ? adminNav : agentNav;

  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    const handleClose = () => setOpen(false);

    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);

    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] transition-opacity md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-white/5 bg-[#0d0d0d] transition-transform duration-300 md:static md:z-0 md:min-h-screen md:w-60 md:max-w-none ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/50 shrink-0">
              <span className="text-xs font-black text-white">TD</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black leading-none text-white">TOPDOG</p>
              <p className="text-[10px] font-semibold tracking-widest text-red-500">CRM</p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {safeUser && (
          <div className="px-4 pt-4 pb-2">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                safeUser.role === "admin"
                  ? "border-amber-800/40 bg-amber-950/60 text-amber-400"
                  : "border-blue-800/40 bg-blue-950/60 text-blue-400"
              }`}
            >
              {safeUser.role === "admin" ? "👑 Admin" : "🎯 Agent"}
            </span>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "border border-red-800/30 bg-red-600/15 text-red-400"
                    : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <span className="w-5 text-center text-base leading-none shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 px-4 py-4">
          {safeUser && (
            <div className="mb-3 px-2 min-w-0">
              <p className="truncate text-sm font-semibold text-white">{safeUser.name}</p>
              <p className="truncate text-xs text-gray-600">{safeUser.email}</p>
            </div>
          )}

          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-red-950/30 hover:text-red-400"
          >
            <span>⬅</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
