"use client";

import * as React from "react";
import { Mic } from "lucide-react";

interface WelcomeCardProps {
  userName: string;
}

export function VisionUIWelcomeCard({ userName }: WelcomeCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-6 border border-[#334155]">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3B82F6]/20 to-[#A855F7]/20 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-[#A855F7]/20 to-[#3B82F6]/20 rounded-full blur-3xl -ml-24 -mb-24" />
      
      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome back, {userName}!
        </h2>
        <p className="text-[#CBD5E1] mb-6">
          Glad to see you again! Ask me anything.
        </p>
        <button className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg font-medium transition-colors">
          <Mic className="w-5 h-5" />
          Tap to record →
        </button>
      </div>
      
      {/* Decorative image placeholder (jellyfish/abstract shape) */}
      <div className="absolute right-8 top-8 w-32 h-32 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] rounded-full blur-2xl" />
      </div>
    </div>
  );
}

