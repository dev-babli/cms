"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Eye, Download, MousePointerClick } from "lucide-react";
import { VisionUIStatCard } from "../dashboard/stat-card";

export function VisionUIAnalyticsPage() {
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    downloads: 0,
    bounceRate: 0,
    avgDuration: 0,
    topPages: [] as Array<{ url: string; views: number }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [engagementRes, performanceRes] = await Promise.all([
          fetch("/api/analytics/engagement", { credentials: "include" }),
          fetch("/api/analytics/web-performance", { credentials: "include" }),
        ]);

        if (engagementRes.ok) {
          const engagementData = await engagementRes.json();
          if (engagementData.success && engagementData.data) {
            setMetrics((prev) => ({
              ...prev,
              totalViews: engagementData.data.totalViews || 0,
              downloads: engagementData.data.downloads || 0,
            }));
          }
        }

        if (performanceRes.ok) {
          const performanceData = await performanceRes.json();
          if (performanceData.success && performanceData.data) {
            setMetrics((prev) => ({
              ...prev,
              pageViews: performanceData.data.pageViews || 0,
              uniqueVisitors: performanceData.data.uniqueVisitors || 0,
              bounceRate: performanceData.data.bounceRate || 0,
              avgDuration: performanceData.data.avgDuration || 0,
              topPages: performanceData.data.topPages || [],
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-[#94A3B8]">Real-time metrics from intellectt.com</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <VisionUIStatCard
          title="Total Views"
          value={metrics.totalViews.toLocaleString()}
          change={{ value: 12, isPositive: true }}
          icon={<Eye className="w-6 h-6 text-white" />}
          iconBg="bg-[#3B82F6]"
        />
        <VisionUIStatCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors.toLocaleString()}
          change={{ value: 8, isPositive: true }}
          icon={<Users className="w-6 h-6 text-white" />}
          iconBg="bg-[#10B981]"
        />
        <VisionUIStatCard
          title="Page Views (30d)"
          value={metrics.pageViews.toLocaleString()}
          change={{ value: 15, isPositive: true }}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          iconBg="bg-[#A855F7]"
        />
        <VisionUIStatCard
          title="Downloads"
          value={metrics.downloads.toLocaleString()}
          change={{ value: 10, isPositive: true }}
          icon={<Download className="w-6 h-6 text-white" />}
          iconBg="bg-[#F59E0B]"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#CBD5E1]">Bounce Rate</span>
              <span className="text-white font-semibold">{metrics.bounceRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#CBD5E1]">Avg. Session Duration</span>
              <span className="text-white font-semibold">{Math.round(metrics.avgDuration / 60)}m {metrics.avgDuration % 60}s</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
          <div className="space-y-2">
            {(metrics.topPages || []).slice(0, 5).map((page, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[#CBD5E1] text-sm truncate flex-1">{page.url}</span>
                <span className="text-white font-semibold ml-2">{page.views.toLocaleString()}</span>
              </div>
            ))}
            {metrics.topPages.length === 0 && (
              <p className="text-[#94A3B8] text-sm">No page view data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

