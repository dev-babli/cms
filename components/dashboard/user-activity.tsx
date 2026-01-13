"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UserActivity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timeAgo: string;
  type: "create" | "update" | "delete" | "publish";
}

export function UserActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch recent blog posts as activity
        const res = await fetch("/api/cms/blog?limit=5", { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            // Transform blog posts into activity items
            const recentPosts = (data.data || []).slice(0, 4);
            const activityItems: UserActivity[] = recentPosts.map((post: any, index: number) => {
              const publishDate = post.publish_date ? new Date(post.publish_date) : null;
              const createdDate = post.created_at ? new Date(post.created_at) : new Date();
              const date = publishDate || createdDate;
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffHours / 24);
              
              let timeAgo = "";
              if (diffHours < 1) {
                timeAgo = "Just now";
              } else if (diffHours < 24) {
                timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
              } else {
                timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
              }

              return {
                id: post.id?.toString() || index.toString(),
                user: { name: post.author || "Unknown" },
                action: post.published ? "published" : post.publish_date ? "scheduled" : "created",
                target: post.title || "Untitled",
                timeAgo,
                type: post.published ? "publish" : "create" as const,
              };
            });
            setActivities(activityItems);
          } else {
            setActivities([]);
          }
        } else {
          setActivities([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : error instanceof Event 
          ? "Network error occurred"
          : "Failed to fetch activities";
        console.error("Failed to fetch activities:", errorMessage, error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    
    // Refresh every 60 seconds for real-time updates
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case "update":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "publish":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-success";
      case "update":
        return "bg-primary";
      case "publish":
        return "bg-secondary";
      default:
        return "bg-destructive";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View all
          </button>
        </div>
        <CardDescription>Latest content updates and actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.user.name}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timeAgo}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

