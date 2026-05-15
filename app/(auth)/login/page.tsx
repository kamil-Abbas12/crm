"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGlobeHero from "../../components/AuthGlobeHero";
import Image from "next/image";

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
      // Always read the server's error message from the response body
      const axiosErr = err as {
        response?: { data?: { error?: string }; status?: number };
      };
      const serverMsg = axiosErr?.response?.data?.error;
      setError(serverMsg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10">
    
    {/* Background Effects */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_45%)]" />
    <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute bottom-[-150px] right-[-120px] h-[320px] w-[320px] rounded-full bg-blue-700/10 blur-3xl" />

    <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_0_80px_rgba(37,99,235,0.15)] backdrop-blur-2xl md:grid-cols-2">
      
      {/* Left Side */}
<div className="hidden flex-col items-center justify-center border-r border-white/10 bg-gradient-to-br from-blue-950/40 to-cyan-950/20 p-10 text-center md:flex">
  
  <div className="flex flex-col items-center">
    
    <div className="mb-6 flex flex-col items-center">
      <Image
        src="/logo.jpg"
        alt="TopDog Logo"
        width={70}
        height={70}
        className="rounded-2xl object-cover shadow-2xl"
      />

      <h2 className="mt-4 text-2xl font-black tracking-wide text-white">
        TOP DOG CRM
      </h2>

      <p className="mt-1 text-sm text-blue-200/60">
        Lead Management Platform
      </p>
    </div>

    <div className="mb-8">
      <AuthGlobeHero />
    </div>

    <div className="space-y-4">
      <h3 className="text-4xl font-black leading-tight text-white">
        Build Your Team
        <br />
        Grow Smarter
      </h3>

      <p className="mx-auto max-w-md text-sm leading-relaxed text-blue-100/60">
        Create your secure CRM account and manage leads, clients,
        workflows, and communication from one modern platform.
      </p>
    </div>
  </div>
</div>

      {/* Right Side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="mb-8 flex flex-col items-center text-center md:hidden">
            <Image
              src="/logo.jpg"
              alt="TopDog Logo"
              width={70}
              height={70}
              className="rounded-2xl shadow-xl"
            />

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
              TOP DOG CRM
            </h1>

            <p className="mt-1 text-sm text-blue-200/50">
              Sign in to continue
            </p>
          </div>

          {/* Header */}
          <div className="mb-8 hidden md:block">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
              Welcome Back
            </p>

            <h1 className="text-4xl font-black tracking-tight text-white">
              Sign In
            </h1>

            <p className="mt-2 text-sm text-blue-100/50">
              Access your CRM dashboard securely
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0b1120]/80 p-7 shadow-2xl backdrop-blur-xl">
            
            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-blue-100/70">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-blue-100/30 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-blue-100/70">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-blue-100/30 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(37,99,235,0.45)] disabled:opacity-50"
              >
                <span className="relative z-10">
                  {loading ? "Signing in..." : "Sign In →"}
                </span>
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-blue-100/40">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
}