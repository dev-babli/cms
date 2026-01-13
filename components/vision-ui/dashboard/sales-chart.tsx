"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  data?: {
    labels: string[];
    values: number[];
  };
}

export function VisionUISalesChart({ data }: SalesChartProps) {
  const [chartData, setChartData] = useState(data || {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [200, 180, 220, 250, 280, 300, 320, 310, 330, 350, 380, 400],
  });

  useEffect(() => {
    if (!data) {
      // Fetch analytics data to populate chart
      fetch("/api/analytics/content?range=90d", { credentials: "include" })
        .then((res) => res.json())
        .then((analytics) => {
          if (analytics.success && analytics.data?.views) {
            setChartData({
              labels: analytics.data.dates || chartData.labels,
              values: analytics.data.views || chartData.values,
            });
          }
        })
        .catch(() => {
          // Keep default data on error
        });
    }
  }, [data]);

  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Sales",
        data: chartData.values,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#3B82F6",
        borderWidth: 2,
      },
      {
        label: "Previous Year",
        data: chartData.values.map((v) => v * 0.85),
        borderColor: "#94A3B8",
        backgroundColor: "rgba(148, 163, 184, 0.05)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#94A3B8",
        borderWidth: 1,
        borderDash: [5, 5],
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
          <h3 className="text-lg font-semibold text-white mb-1">Sales overview</h3>
          <p className="text-sm text-[#94A3B8]">(+5) more in 2021</p>
        </div>
      </div>
      <div className="h-64">
        <Line data={chartConfig} options={options} />
      </div>
    </div>
  );
}

