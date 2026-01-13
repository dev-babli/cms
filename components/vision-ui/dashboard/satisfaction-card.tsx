"use client";

import * as React from "react";

interface SatisfactionCardProps {
  rate: number; // 0-100
}

export function VisionUISatisfactionCard({ rate = 95 }: SatisfactionCardProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <h3 className="text-lg font-semibold text-white mb-6">
        Satisfaction Rate
      </h3>
      <p className="text-sm text-[#94A3B8] mb-4">From all projects</p>
      
      <div className="relative w-32 h-32 mx-auto mb-4">
        {/* Circular progress */}
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#334155"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#3B82F6"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{rate}%</span>
          <span className="text-xs text-[#94A3B8]">Based on likes</span>
        </div>
      </div>
    </div>
  );
}

