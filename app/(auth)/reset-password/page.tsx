"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/reset-password", { token, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Reset failed. The link may have expired.");
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
          <p className="text-gray-600 text-sm mt-1">Choose a new password</p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-950/60 border border-green-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-white font-black text-lg mb-2">Password updated!</h2>
              <p className="text-gray-500 text-sm">Your password has been changed. Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-black text-lg mb-1">Set new password</h2>
              <p className="text-gray-600 text-sm mb-5">Must be at least 8 characters.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-red-400 text-sm">
                  <span>⚠</span> {error}
                  {error.includes("expired") && (
                    <div className="mt-2">
                      <Link href="/forgot-password" className="text-red-300 underline text-xs">Request a new link →</Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">New Password</label>
                  <input
                    type="password" required placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">Confirm Password</label>
                  <input
                    type="password" required placeholder="Re-enter password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none transition ${
                      form.confirm && form.password !== form.confirm
                        ? "border-red-700/60 focus:border-red-600"
                        : "border-white/8 focus:border-red-700/50"
                    }`}
                  />
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                  )}
                </div>
                <button type="submit" disabled={loading || !token}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                  {loading ? "Updating…" : "Update Password →"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-gray-600 text-sm text-center mt-4">
          <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}