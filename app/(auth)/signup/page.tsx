"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGlobeHero from "../../components/AuthGlobeHero";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/signup", { ...form, role: "agent" });
      const { token, role, name } = res.data as { token: string; role: string; name: string };
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
      document.cookie = `user_role=${role}; path=/; max-age=${maxAge}`;
      document.cookie = `user_name=${encodeURIComponent(name)}; path=/; max-age=${maxAge}`;
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof FormState; label: string; type: string; placeholder: string }[] = [
    { key: "name",            label: "Full Name",        type: "text",     placeholder: "John Smith" },
    { key: "email",           label: "Email Address",    type: "email",    placeholder: "you@email.com" },
    { key: "password",        label: "Password",         type: "password", placeholder: "Min. 8 characters" },
    { key: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Re-enter password" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f1e] px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
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
            <p className="mt-1 text-sm text-blue-400/50">Create your agent account</p>
          </div>

          <div className="rounded-2xl border border-blue-900/30 bg-[#0d1526]/90 p-6 backdrop-blur-md">
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-800/30 bg-blue-950/40 p-3">
              <span className="mt-0.5 shrink-0 text-base text-blue-400">ℹ</span>
              <p className="text-xs leading-relaxed text-blue-300">
                New accounts are created as <strong>Agent</strong> by default.
                Admin access is granted by your administrator.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-800/40 bg-red-950/60 p-3 text-sm text-red-400">
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-blue-400/60">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    required
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-blue-900/40 bg-[#0a0f1e] px-4 py-2.5 text-sm text-white placeholder-blue-900/60 outline-none transition focus:border-blue-600/60"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-blue-400/40">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}