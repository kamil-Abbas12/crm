"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Topbar({ title }: { title: string }) {
  const user = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeUser = mounted ? user : null;

  const toggleSidebar = () => {
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-white/5 bg-[#0d0d0d] px-3 sm:h-16 sm:px-4 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10 md:hidden"
        aria-label="Open sidebar"
      >
        ☰
      </button>

      <h2 className="min-w-0 flex-1 truncate text-sm sm:text-base font-black tracking-tight text-white">
        {title}
      </h2>

      <div className="flex items-center gap-2 sm:gap-3">
        {safeUser && safeUser.role !== "admin" && (
          <Link
            href="/activity"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10"
          >
            <span>📝</span>
            <span>Log Activity</span>
          </Link>
        )}

        <Link
          href="/leads/new"
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500 sm:px-3.5"
        >
          <span>＋</span>
          <span className="hidden xs:inline sm:inline">New Lead</span>
        </Link>

        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-700 to-red-950">
          <span className="text-xs font-bold text-white">
            {safeUser?.name?.charAt(0) || "?"}
          </span>
        </div>
      </div>
    </header>
  );
}
