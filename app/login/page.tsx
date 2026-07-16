"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mountain, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-charcoal topo-bg flex flex-col relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-trail-orange/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-alpine-green/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Mountain SVG Backdrop */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-10">
        <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 400L120 320L240 360L360 280L480 340L600 260L720 320L840 240L960 300L1080 220L1200 280L1320 200L1440 260V400H0Z" fill="#FF6B2C" />
          <path d="M0 400L180 340L360 380L540 300L720 360L900 280L1080 340L1260 260L1440 320V400H0Z" fill="#2DD4A7" opacity="0.5" />
        </svg>
      </div>

      {/* Nav */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <span className="text-2xl">⛰</span>
          <span className="font-bold text-lg font-[family-name:var(--font-sora-family)] text-text-primary">
            Trek <span className="text-trail-orange">Captain</span>
          </span>
        </Link>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-trail-orange/10 border border-trail-orange/20 mb-4">
              <Mountain className="w-7 h-7 text-trail-orange" />
            </div>
            <h1 className="text-3xl font-extrabold font-[family-name:var(--font-sora-family)] text-text-primary">
              Welcome back
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Sign in to manage your treks
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-dim focus:border-trail-orange focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-trail-orange to-amber-500 text-white text-sm font-bold rounded-xl hover:from-trail-orange-hover hover:to-amber-400 transition-all duration-300 shadow-lg shadow-trail-orange/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-trail-orange hover:text-trail-orange-hover font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
