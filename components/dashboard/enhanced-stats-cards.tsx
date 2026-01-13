"use client";

import { useEffect, useState, useMemo } from "react";
import { StatCard } from "@/components/ui/stat-card";
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  Briefcase,
  BookOpen,
  FolderKanban,
  UserPlus,
  Mail,
  Zap,
} from "lucide-react";

interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  publishedPosts: number;
  totalJobs: number;
  totalEbooks: number;
  totalCaseStudies: number;
  totalLeads: number;
  totalTeamMembers: number;
  totalCategories: number;
  draftPosts: number;
}

export function EnhancedStatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    publishedPosts: 0,
    totalJobs: 0,
    totalEbooks: 0,
    totalCaseStudies: 0,
    totalLeads: 0,
    totalTeamMembers: 0,
    totalCategories: 0,
    draftPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats", { credentials: "include", cache: 'no-store' }),
          fetch("/api/cms/blog", { credentials: "include", cache: 'no-store' }),
          fetch("/api/analytics/content?range=30d", { credentials: "include", cache: 'no-store' }),
        ]);

        let totalPosts = 0;
        let publishedPosts = 0;
        let draftPosts = 0;
        let totalUsers = 0;
        let totalViews = 0;
        let totalJobs = 0;
        let totalEbooks = 0;
        let totalCaseStudies = 0;
        let totalLeads = 0;
        let totalTeamMembers = 0;
        let totalCategories = 0;

        if (statsRes.ok) {
          try {
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
              totalPosts = statsData.data.blogPosts || 0;
              publishedPosts = statsData.data.publishedPosts || 0;
              draftPosts = totalPosts - publishedPosts;
              totalUsers = statsData.data.users || 0;
              totalJobs = statsData.data.jobs || 0;
              totalEbooks = statsData.data.ebooks || 0;
              totalCaseStudies = statsData.data.caseStudies || 0;
              totalLeads = statsData.data.leads || 0;
              totalTeamMembers = statsData.data.teamMembers || 0;
              totalCategories = statsData.data.categories || 0;
            }
          } catch (jsonError) {
            console.warn("Failed to parse stats response:", jsonError);
          }
        }

        if (analyticsRes.ok) {
          try {
            const analyticsData = await analyticsRes.json();
            totalViews = analyticsData.success
              ? analyticsData.data?.totalViews || 0
              : 0;
          } catch (jsonError) {
            console.warn("Failed to parse analytics response:", jsonError);
          }
        }

        if (!isMounted) return;
        
        const newStats = {
          totalPosts,
          totalUsers,
          totalViews,
          publishedPosts,
          totalJobs,
          totalEbooks,
          totalCaseStudies,
          totalLeads,
          totalTeamMembers,
          totalCategories,
          draftPosts,
        };

        setPreviousStats(stats);
        setStats(newStats);
        setLoading(false);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        console.error("Failed to fetch stats:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchStats();
    
    // Real-time updates every 60 seconds (reduced frequency for performance)
    const interval = setInterval(fetchStats, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Calculate trends based on previous stats (memoized)
  const calculateTrend = useMemo(() => {
    return (current: number, previous: number | null): { value: number; isPositive: boolean } => {
      if (!previous || previous === 0) {
        return { value: 0, isPositive: true };
      }
      const change = ((current - previous) / previous) * 100;
      return {
        value: Math.abs(Math.round(change)),
        isPositive: change >= 0,
      };
    };
  }, []);

  // Memoize trend calculations
  const postsTrend = useMemo(() => calculateTrend(stats.totalPosts, previousStats?.totalPosts ?? null), [stats.totalPosts, previousStats?.totalPosts, calculateTrend]);
  const viewsTrend = useMemo(() => calculateTrend(stats.totalViews, previousStats?.totalViews ?? null), [stats.totalViews, previousStats?.totalViews, calculateTrend]);
  const leadsTrend = useMemo(() => calculateTrend(stats.totalLeads, previousStats?.totalLeads ?? null), [stats.totalLeads, previousStats?.totalLeads, calculateTrend]);
  const usersTrend = useMemo(() => calculateTrend(stats.totalUsers, previousStats?.totalUsers ?? null), [stats.totalUsers, previousStats?.totalUsers, calculateTrend]);

  if (loading) {
    return (
      <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-36 rounded-xl border bg-card p-6 animate-pulse"
          >
            <div className="h-4 w-24 bg-muted rounded mb-4"></div>
            <div className="h-8 w-16 bg-muted rounded mb-2"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4">
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        icon={<FileText className="h-5 w-5" />}
        trend={{ value: postsTrend.value, isPositive: postsTrend.isPositive, label: "vs last update" }}
        subtitle={`${stats.publishedPosts} published, ${stats.draftPosts} drafts`}
        footer="Content management"
        variant="default"
      />
      <StatCard
        title="Total Views"
        value={stats.totalViews.toLocaleString()}
        icon={<Eye className="h-5 w-5" />}
        trend={{ value: viewsTrend.value, isPositive: viewsTrend.isPositive, label: "vs last update" }}
        subtitle="Last 30 days"
        footer="Page views tracked"
        variant="gradient"
      />
      <StatCard
        title="New Leads"
        value={stats.totalLeads}
        icon={<Mail className="h-5 w-5" />}
        trend={{ value: leadsTrend.value, isPositive: leadsTrend.isPositive, label: "vs last update" }}
        subtitle="Captured leads"
        footer="Lead generation"
        variant="default"
      />
      <StatCard
        title="Active Users"
        value={stats.totalUsers}
        icon={<Users className="h-5 w-5" />}
        trend={{ value: usersTrend.value, isPositive: usersTrend.isPositive, label: "vs last update" }}
        subtitle="System users"
        footer="User management"
        variant="gradient"
      />
      <StatCard
        title="Job Postings"
        value={stats.totalJobs}
        icon={<Briefcase className="h-5 w-5" />}
        subtitle="Career opportunities"
        footer="Recruitment"
        variant="default"
      />
      <StatCard
        title="Content Library"
        value={stats.totalEbooks + stats.totalCaseStudies}
        icon={<BookOpen className="h-5 w-5" />}
        subtitle={`${stats.totalEbooks} eBooks, ${stats.totalCaseStudies} case studies`}
        footer="Resources"
        variant="gradient"
      />
    </div>
  );
}

