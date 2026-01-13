"use client";

import { useEffect, useState } from "react";

export function WelcomeSection() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: 'include' });
        if (res.ok) {
          try {
            const data = await res.json();
            if (data.success && data.data?.user) {
              setUser(data.data.user);
            }
          } catch (jsonError) {
            console.warn("Failed to parse user response:", jsonError);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : error instanceof Event 
          ? "Network error occurred"
          : String(error);
        console.error("Failed to fetch user:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const userName = user?.name || user?.email?.split("@")[0] || "there";

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-primary-foreground/80 text-sm mb-1">{greeting}</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
          <p className="text-primary-foreground/90 text-sm">{currentDate}</p>
          <p className="text-primary-foreground/80 text-sm mt-2">Here's what's happening with your content today</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

