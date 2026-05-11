"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGlobeHero from "../../components/AuthGlobeHero";

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
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f1e] px-4 py-10">
      {/* Background glows */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-blue-700/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center">
        <div className="w-full">
          <AuthGlobeHero />

          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/50">
              <span className="text-base font-black text-white">TD</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">TOPDOG CRM</h1>
            <p className="mt-1 text-sm text-blue-400/50">Sign in to your workspace</p>
          </div>

          <div className="rounded-2xl border border-blue-900/30 bg-[#0d1526]/90 p-6 backdrop-blur-md">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-800/40 bg-red-950/60 p-3 text-sm text-red-400">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-blue-400/60">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-blue-900/40 bg-[#0a0f1e] px-4 py-2.5 text-sm text-white placeholder-blue-900/60 outline-none transition focus:border-blue-600/60"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-blue-400/60">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-400 transition hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-blue-900/40 bg-[#0a0f1e] px-4 py-2.5 text-sm text-white placeholder-blue-900/60 outline-none transition focus:border-blue-600/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-black tracking-wide text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-blue-400/40">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}