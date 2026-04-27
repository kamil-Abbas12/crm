"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", form);
      const { token, role, name } = res.data;
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
      document.cookie = `user_role=${role}; path=/; max-age=${maxAge}`;
      document.cookie = `user_name=${encodeURIComponent(name)}; path=/; max-age=${maxAge}`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-900/40">
            <span className="text-white font-black text-base">TD</span>
          </div>
          <h1 className="text-white font-black text-2xl tracking-tight">TOPDOG CRM</h1>
          <p className="text-gray-600 text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">Email</label>
              <input type="email" required placeholder="you@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-gray-500 text-xs font-semibold tracking-wider uppercase">Password</label>
                <Link href="/forgot-password" className="text-red-400 hover:text-red-300 text-xs font-semibold transition">
                  Forgot password?
                </Link>
              </div>
              <input type="password" required placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition text-sm tracking-wide shadow-lg shadow-red-900/30 mt-1">
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-gray-600 text-sm text-center mt-4">
          No account?{" "}
          <Link href="/signup" className="text-red-400 hover:text-red-300 font-semibold">Create one</Link>
        </p>
      </div>
    </div>
  );
}