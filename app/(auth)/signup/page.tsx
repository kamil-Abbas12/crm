"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", form);
      router.push("/login?created=1");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 75% 25%, #ef4444 0%, transparent 50%), radial-gradient(circle at 25% 75%, #7f1d1d 0%, transparent 50%)`,
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-[#111111] border border-white/8 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
              <span className="text-white font-black text-sm">TD</span>
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none tracking-tight">TOPDOG</h1>
              <p className="text-red-500 text-[10px] font-semibold tracking-widest uppercase">CRM Platform</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-white text-2xl font-black tracking-tight">Create account</h2>
            <p className="text-gray-600 text-sm mt-1">Join the TopDog CRM platform</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                placeholder="John Smith"
                onChange={handleChange}
                value={form.name}
                required
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-3 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/60 focus:bg-[#1e1e1e] transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@topdog.com"
                onChange={handleChange}
                value={form.email}
                required
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-3 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/60 focus:bg-[#1e1e1e] transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                onChange={handleChange}
                value={form.password}
                required
                minLength={8}
                className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-3 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/60 focus:bg-[#1e1e1e] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-lg transition-colors shadow-lg shadow-red-900/30 text-sm tracking-wide mt-2"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-gray-600 text-sm mt-5 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-gray-700 text-xs text-center mt-5">
          © 2024 Top Dog Leads LLC · Houston, TX
        </p>
      </div>
    </div>
  );
}