"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  iconBg?: string;
}

export function VisionUIStatCard({
  title,
  value,
  change,
  icon,
  iconBg = "bg-[#3B82F6]",
}: StatCardProps) {
  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-[#94A3B8] mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {change.isPositive ? (
          <TrendingUp className="w-4 h-4 text-[#10B981]" />
        ) : (
          <TrendingDown className="w-4 h-4 text-[#EF4444]" />
        )}
        <span
          className={cn(
            "text-sm font-semibold",
            change.isPositive ? "text-[#10B981]" : "text-[#EF4444]"
          )}
        >
          {change.isPositive ? "+" : ""}
          {change.value}%
        </span>
        <span className="text-sm text-[#94A3B8]">than last week</span>
      </div>
    </div>
  );
}

