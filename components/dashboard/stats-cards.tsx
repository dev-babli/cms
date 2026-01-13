"use client";

import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend.isPositive ? "M13 7l5 5m0 0l-5 5m5-5H6" : "M13 17l5-5m0 0l-5-5m5 5H6"} />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#111827] mb-1">{value}</p>
        <p className="text-sm text-[#6B7280]">{title}</p>
        {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    publishedPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch dashboard stats from API
        const statsRes = await fetch("/api/admin/dashboard/stats", { credentials: 'include' });
        let totalPosts = 0;
        let publishedPosts = 0;
        let totalUsers = 0;
        let totalViews = 0;
        
        if (statsRes.ok) {
          try {
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
              totalPosts = statsData.data.blogPosts || 0;
              totalUsers = statsData.data.users || 0;
              
              // Fetch published posts count separately
              const postsRes = await fetch("/api/cms/blog?published=true", { credentials: 'include' });
              if (postsRes.ok) {
                const postsData = await postsRes.json();
                publishedPosts = postsData.success ? postsData.data?.length || 0 : 0;
              }
              
              // Fetch views from analytics
              const analyticsRes = await fetch("/api/analytics/content?range=30d", { credentials: 'include' });
              if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                totalViews = analyticsData.success ? analyticsData.data?.totalViews || 0 : 0;
              }
            }
          } catch (jsonError) {
            console.warn("Failed to parse stats response:", jsonError);
          }
        }

        setStats({
          totalPosts,
          totalUsers,
          totalViews,
          publishedPosts,
        });
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : error instanceof Event 
          ? "Network error occurred"
          : String(error);
        console.error("Failed to fetch stats:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
        trend={{ value: 12, isPositive: true }}
        subtitle={`${stats.publishedPosts} published`}
      />
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Total Views"
        value={stats.totalViews.toLocaleString()}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
        trend={{ value: 24, isPositive: true }}
        subtitle="Last 30 days"
      />
      <StatCard
        title="Performance"
        value="98%"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        trend={{ value: 2, isPositive: true }}
        subtitle="Core Web Vitals"
      />
    </div>
  );
}

