"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost } from "@/lib/cms/types";

export function RecentContent() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRecentPosts = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        
        const res = await fetch("/api/cms/blog?limit=5", { 
          credentials: 'include', 
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        if (res.ok) {
          try {
            const data = await res.json();
            if (data.success) {
              // Sort by most recent (by publish_date or created_at)
              const sorted = (data.data || []).sort((a: any, b: any) => {
                const dateA = new Date(a.publish_date || a.created_at || 0).getTime();
                const dateB = new Date(b.publish_date || b.created_at || 0).getTime();
                return dateB - dateA;
              });
              if (isMounted) {
                setRecentPosts(sorted);
              }
            }
          } catch (jsonError) {
            console.warn("Failed to parse recent posts response:", jsonError);
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
          : String(error);
        console.error("Failed to fetch recent posts:", errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecentPosts();
    
    // Refresh every 60 seconds for real-time updates
    const interval = setInterval(fetchRecentPosts, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
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
          <CardTitle className="text-lg font-semibold">Recent Content</CardTitle>
          <Link
            href="/admin/blog"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            See all →
          </Link>
        </div>
        <CardDescription>Latest blog posts and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No content yet</p>
              <Link
                href="/admin/blog/new"
                className="text-sm text-primary hover:text-primary/80 font-medium inline-block"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/blog/edit/${post.id}`}
                className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors mb-1.5 line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {post.excerpt || "No excerpt available"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                        post.published
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-warning/10 text-warning border border-warning/20"
                      }`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.publish_date 
                          ? new Date(post.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : "No date"}
                      </span>
                    </div>
                  </div>
                  {post.featured_image && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border group-hover:border-primary/30 transition-colors">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

