"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const user = useAuth();

  return (
    <header className="h-14 bg-[#0d0d0d] border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 z-10">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition shrink-0"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h2 className="text-white font-black text-base tracking-tight flex-1 truncate">{title}</h2>

      <div className="flex items-center gap-2 shrink-0">
        {user?.role !== "admin" && (
          <Link href="/activity"
            className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/8 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            📝 Log Activity
          </Link>
        )}
        <Link href="/leads/new"
          className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-lg shadow-red-900/30">
          <span className="hidden sm:inline">＋ New Lead</span>
          <span className="sm:hidden">＋</span>
        </Link>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || "?"}</span>
        </div>
      </div>
    </header>
  );
}