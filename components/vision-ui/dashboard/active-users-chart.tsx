"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Users, MousePointerClick, ShoppingCart, FileText } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ActiveUsersChartProps {
  data?: {
    labels: string[];
    values: number[];
  };
  stats?: {
    users: number;
    clicks: string;
    sales: string;
    items: number;
  };
}

export function VisionUIActiveUsersChart({ data, stats }: ActiveUsersChartProps) {
  const [chartDataState, setChartDataState] = useState(data || {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [300, 350, 280, 400, 450, 380, 420],
  });

  const [statsState, setStatsState] = useState(stats || {
    users: 32984,
    clicks: "2.42m",
    sales: "2,400$",
    items: 320,
  });

  useEffect(() => {
    if (!data || !stats) {
      // Fetch dashboard stats
      Promise.all([
        fetch("/api/admin/dashboard/stats", { credentials: "include" }),
        fetch("/api/analytics/content?range=7d", { credentials: "include" }),
      ])
        .then(async ([statsRes, analyticsRes]) => {
          const statsData = await statsRes.json();
          const analyticsData = await analyticsRes.json();

          if (statsData.success) {
            setStatsState({
              users: statsData.data.users || 0,
              clicks: analyticsData.data?.totalViews?.toLocaleString() || "0",
              sales: `$${statsData.data.blogPosts * 100 || 0}`,
              items: statsData.data.blogPosts || 0,
            });
          }

          if (analyticsData.success && analyticsData.data?.views) {
            setChartDataState({
              labels: analyticsData.data.dates || chartDataState.labels,
              values: analyticsData.data.views || chartDataState.values,
            });
          }
        })
        .catch(() => {
          // Keep default data on error
        });
    }
  }, [data, stats]);

  const chartData = data || chartDataState;
  const defaultStats = stats || statsState;

  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Active Users",
        data: chartData.values,
        backgroundColor: "#3B82F6",
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#CBD5E1",
        bodyColor: "#CBD5E1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#334155",
        },
        ticks: {
          color: "#94A3B8",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Active Users</h3>
          <p className="text-sm text-[#94A3B8]">(+23) than last week</p>
        </div>
      </div>
      <div className="h-48 mb-6">
        <Bar data={chartConfig} options={options} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm text-[#94A3B8]">Users</p>
            <p className="text-lg font-semibold text-white">{defaultStats.users.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
            <MousePointerClick className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm text-[#94A3B8]">Clicks</p>
            <p className="text-lg font-semibold text-white">{defaultStats.clicks}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm text-[#94A3B8]">Sales</p>
            <p className="text-lg font-semibold text-white">{defaultStats.sales}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm text-[#94A3B8]">Items</p>
            <p className="text-lg font-semibold text-white">{defaultStats.items}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

