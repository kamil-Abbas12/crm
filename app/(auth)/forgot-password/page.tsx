"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
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
          <p className="text-gray-600 text-sm mt-1">Reset your password</p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-950/60 border border-green-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-white font-black text-lg mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                If <span className="text-white font-semibold">{email}</span> is registered, you'll receive a password reset link shortly. Check your spam folder if you don't see it.
              </p>
              <p className="text-gray-600 text-xs">The link expires in 1 hour.</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-black text-lg mb-1">Forgot your password?</h2>
              <p className="text-gray-600 text-sm mb-5">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-xs font-semibold tracking-wider uppercase mb-1.5">Email Address</label>
                  <input
                    type="email" required placeholder="you@topdog.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                  {loading ? "Sending…" : "Send Reset Link →"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-gray-600 text-sm text-center mt-4">
          Remember it?{" "}
          <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}