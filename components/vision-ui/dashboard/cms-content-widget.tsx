"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { FileText, BookOpen, Briefcase, FolderOpen, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ContentItem {
  id: string;
  type: "blog" | "ebook" | "case_study" | "job";
  title: string;
  status: "published" | "draft";
  views?: number;
  createdAt: Date;
  href: string;
}

export function VisionUICMSContentWidget() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlog: 0,
    totalEbooks: 0,
    totalCaseStudies: 0,
    totalJobs: 0,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [blogRes, ebooksRes, caseStudiesRes, jobsRes, engagementRes] = await Promise.allSettled([
          fetch("/api/cms/blog?limit=5", { credentials: "include" }),
          fetch("/api/cms/ebooks?limit=3", { credentials: "include" }),
          fetch("/api/cms/case-studies?limit=3", { credentials: "include" }),
          fetch("/api/cms/jobs?limit=3", { credentials: "include" }),
          fetch("/api/analytics/engagement", { credentials: "include" }),
        ]);

        const blogResValue = blogRes.status === "fulfilled" ? blogRes.value : null;
        const ebooksResValue = ebooksRes.status === "fulfilled" ? ebooksRes.value : null;
        const caseStudiesResValue = caseStudiesRes.status === "fulfilled" ? caseStudiesRes.value : null;
        const jobsResValue = jobsRes.status === "fulfilled" ? jobsRes.value : null;
        const engagementResValue = engagementRes.status === "fulfilled" ? engagementRes.value : null;

        const contentItems: ContentItem[] = [];

        // Fetch blog posts
        if (blogResValue?.ok) {
          const blogData = await blogResValue.json();
          if (blogData.success && blogData.data && Array.isArray(blogData.data)) {
            setStats((prev) => ({ ...prev, totalBlog: blogData.data.length }));
            blogData.data.slice(0, 3).forEach((post: any) => {
              contentItems.push({
                id: `blog-${post.id}`,
                type: "blog",
                title: post.title || "Untitled",
                status: post.published ? "published" : "draft",
                createdAt: new Date(post.created_at || Date.now()),
                href: `/admin/blog/edit/${post.id}`,
              });
            });
          }
        }

        // Fetch ebooks
        if (ebooksResValue?.ok) {
          const ebooksData = await ebooksResValue.json();
          if (ebooksData.success && ebooksData.data && Array.isArray(ebooksData.data)) {
            setStats((prev) => ({ ...prev, totalEbooks: ebooksData.data.length }));
            ebooksData.data.slice(0, 2).forEach((ebook: any) => {
              contentItems.push({
                id: `ebook-${ebook.id}`,
                type: "ebook",
                title: ebook.title || "Untitled",
                status: ebook.published ? "published" : "draft",
                createdAt: new Date(ebook.created_at || Date.now()),
                href: `/admin/ebooks/edit/${ebook.id}`,
              });
            });
          }
        }

        // Fetch case studies
        if (caseStudiesResValue?.ok) {
          const caseStudiesData = await caseStudiesResValue.json();
          if (caseStudiesData.success && caseStudiesData.data && Array.isArray(caseStudiesData.data)) {
            setStats((prev) => ({ ...prev, totalCaseStudies: caseStudiesData.data.length }));
            caseStudiesData.data.slice(0, 2).forEach((cs: any) => {
              contentItems.push({
                id: `cs-${cs.id}`,
                type: "case_study",
                title: cs.title || "Untitled",
                status: cs.published ? "published" : "draft",
                createdAt: new Date(cs.created_at || Date.now()),
                href: `/admin/case-studies/edit/${cs.id}`,
              });
            });
          }
        }

        // Fetch jobs
        if (jobsResValue?.ok) {
          const jobsData = await jobsResValue.json();
          if (jobsData.success && jobsData.data && Array.isArray(jobsData.data)) {
            setStats((prev) => ({ ...prev, totalJobs: jobsData.data.length }));
            jobsData.data.slice(0, 2).forEach((job: any) => {
              contentItems.push({
                id: `job-${job.id}`,
                type: "job",
                title: job.title || "Untitled",
                status: job.published ? "published" : "draft",
                createdAt: new Date(job.created_at || Date.now()),
                href: `/admin/jobs/edit/${job.id}`,
              });
            });
          }
        }

        // Get view counts from engagement API
        if (engagementResValue?.ok) {
          const engagementData = await engagementResValue.json();
          if (engagementData.success && engagementData.data?.contentViews) {
            const viewMap = new Map<string, number>();
            engagementData.data.contentViews.forEach((v: any) => {
              viewMap.set(`${v.contentType}-${v.contentId}`, v.views);
            });

            contentItems.forEach((item) => {
              const key = `${item.type === "blog" ? "blog" : item.type === "ebook" ? "ebook" : item.type === "case_study" ? "case_study" : "job"}-${item.id.split("-")[1]}`;
              item.views = viewMap.get(key) || 0;
            });
          }
        }

        // Sort by creation date (newest first)
        if (contentItems.length > 0) {
          contentItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setContent(contentItems.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch CMS content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    const interval = setInterval(fetchContent, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTypeIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "blog":
        return <FileText className="w-4 h-4" />;
      case "ebook":
        return <BookOpen className="w-4 h-4" />;
      case "case_study":
        return <FolderOpen className="w-4 h-4" />;
      case "job":
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: ContentItem["type"]) => {
    switch (type) {
      case "blog":
        return "text-[#3B82F6] bg-[#3B82F6]/20";
      case "ebook":
        return "text-[#10B981] bg-[#10B981]/20";
      case "case_study":
        return "text-[#F59E0B] bg-[#F59E0B]/20";
      case "job":
        return "text-[#A855F7] bg-[#A855F7]/20";
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
        <div className="text-white">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">CMS Content</h3>
          <p className="text-sm text-[#94A3B8]">Recent content from your CMS</p>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-xs text-[#94A3B8]">Blog Posts</span>
          </div>
          <p className="text-lg font-bold text-white">{stats.totalBlog}</p>
        </div>
        <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs text-[#94A3B8]">eBooks</span>
          </div>
          <p className="text-lg font-bold text-white">{stats.totalEbooks}</p>
        </div>
        <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs text-[#94A3B8]">Case Studies</span>
          </div>
          <p className="text-lg font-bold text-white">{stats.totalCaseStudies}</p>
        </div>
        <div className="bg-[#0F172A] rounded-lg p-3 border border-[#334155]">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-[#A855F7]" />
            <span className="text-xs text-[#94A3B8]">Jobs</span>
          </div>
          <p className="text-lg font-bold text-white">{stats.totalJobs}</p>
        </div>
      </div>

      {/* Recent Content List */}
      <div className="space-y-3">
        {content.length > 0 ? (
          content.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#334155]/50 transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white group-hover:text-[#3B82F6] transition-colors truncate">
                    {item.title}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.status === "published"
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : "bg-[#94A3B8]/20 text-[#94A3B8]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                  {item.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-[#94A3B8]">
            <p>No content found. Create your first blog post!</p>
            <Link
              href="/admin/blog/new"
              className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium mt-2 inline-block"
            >
              Create Blog Post
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-[#334155]">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/admin/blog/new"
            className="text-center text-sm text-[#3B82F6] hover:text-[#2563EB] py-2 px-4 rounded-lg hover:bg-[#3B82F6]/10 transition-colors"
          >
            New Blog Post
          </Link>
          <Link
            href="/admin/ebooks/new"
            className="text-center text-sm text-[#10B981] hover:text-[#059669] py-2 px-4 rounded-lg hover:bg-[#10B981]/10 transition-colors"
          >
            New eBook
          </Link>
        </div>
      </div>
    </div>
  );
}

