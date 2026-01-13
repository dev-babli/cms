"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  views: number[];
  dates: string[];
  topPosts: Array<{
    title: string;
    views: number;
  }>;
}

export function ContentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    let isMounted = true;
    
    const fetchAnalytics = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const res = await fetch(`/api/analytics/content?range=${timeRange}`, { 
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && isMounted) {
            setAnalytics({
              views: data.data.views || [],
              dates: data.data.dates || [],
              topPosts: data.data.topPosts || [],
            });
          } else {
            // Fallback to empty data if API fails
            const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
            const emptyData: AnalyticsData = {
              views: Array(days).fill(0),
              dates: Array.from({ length: days }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - i));
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }),
              topPosts: [],
            };
            if (isMounted) {
              setAnalytics(emptyData);
            }
          }
        } else {
          // Fallback to empty data if API fails
          const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
          const emptyData: AnalyticsData = {
            views: Array(days).fill(0),
            dates: Array.from({ length: days }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (days - 1 - i));
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }),
            topPosts: [],
          };
          if (isMounted) {
            setAnalytics(emptyData);
          }
        }
        clearTimeout(timeoutId);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return;
        }
        const errorMessage = error instanceof Error 
          ? error.message 
          : error instanceof Event 
          ? "Network error occurred"
          : "Failed to fetch analytics";
        console.error("Failed to fetch analytics:", errorMessage, error);
        // Fallback to empty data
        const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
        const emptyData: AnalyticsData = {
          views: Array(days).fill(0),
          dates: Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }),
          topPosts: [],
        };
        if (isMounted) {
          setAnalytics(emptyData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
    
    // Refresh every 60 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [timeRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const maxViews = Math.max(...analytics.views);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Content Analytics</CardTitle>
          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <CardDescription>Track your content performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enhanced Bar Chart */}
        <div className="mb-6">
          <div className="flex items-end justify-between gap-1.5 h-40">
            {analytics.views.map((views, index) => {
              const height = maxViews > 0 ? Math.max((views / maxViews) * 100, 5) : 5;
              const isToday = index === analytics.views.length - 1;
              return (
                <div
                  key={index}
                  className="flex-1 group relative"
                  style={{ height: `${height}%` }}
                >
                  <div
                    className={`w-full rounded-t-lg transition-all cursor-pointer ${
                      isToday
                        ? "bg-gradient-to-t from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        : "bg-gradient-to-t from-primary/70 to-primary/50 hover:from-primary/80 hover:to-primary/60"
                    }`}
                    style={{ height: "100%" }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg font-medium">
                        {views.toLocaleString()} views
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="border-4 border-transparent border-t-foreground"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>{analytics.dates[0] || "Start"}</span>
            <span className="font-medium text-foreground">Total: {analytics.views.reduce((a, b) => a + b, 0).toLocaleString()}</span>
            <span>{analytics.dates[analytics.dates.length - 1] || "End"}</span>
          </div>
        </div>

        {/* Top Posts */}
        {analytics.topPosts.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Top Performing Content</h4>
            <div className="space-y-2">
              {analytics.topPosts.map((post, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${
                      index === 0 ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" :
                      index === 1 ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground" :
                      index === 2 ? "bg-gradient-to-br from-success to-success/80 text-success-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate">{post.title}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                    {post.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

