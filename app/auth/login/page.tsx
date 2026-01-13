"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function VisionUILoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/80 to-[#A855F7]/80" />
        </div>
        <div className="relative z-10 flex items-end p-12 text-white">
          <div>
            <p className="text-sm font-medium mb-2 opacity-90">INSPIRED BY THE FUTURE:</p>
            <h1 className="text-4xl font-bold">THE VISION UI DASHBOARD</h1>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#0F172A] p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-2">Nice to see you!</h2>
          <p className="text-[#94A3B8] mb-8">Enter your email and password to sign in</p>

          {error && (
            <div className="mb-6 p-4 bg-[#EF4444]/20 border border-[#EF4444] rounded-lg text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#CBD5E1] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#CBD5E1] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#334155] bg-[#1E293B] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <span className="text-sm text-[#CBD5E1]">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#3B82F6] hover:text-[#2563EB]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>

            <p className="text-center text-sm text-[#94A3B8]">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-[#3B82F6] hover:text-[#2563EB] font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
