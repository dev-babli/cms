"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { JobPosting } from "@/lib/cms/types";
import { useRouter } from "next/navigation";

export default function JobsListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        setAuthenticated(true);
        fetchJobs();
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      router.push("/auth/login");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/cms/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job posting?")) return;
    try {
      const res = await fetch(`/api/cms/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-indigo-50/20">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Job Postings</h1>
                <p className="text-sm text-slate-600 font-medium">{jobs.length} {jobs.length === 1 ? 'opening' : 'openings'} available</p>
              </div>
            </div>
            <Link href="/admin/jobs/new">
              <Button size="lg" className="btn-premium flex items-center gap-2 group">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Job
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No job postings yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first job posting</p>
            <Link href="/admin/jobs/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header with Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
                      </svg>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.published
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {job.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>

                  {/* Location & Type */}
                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.employment_type && (
                      <span className="text-slate-400">•</span>
                    )}
                    {job.employment_type && (
                      <span>{job.employment_type}</span>
                    )}
                  </div>

                  {/* Categories */}
                  {job.categories && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {job.categories}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {job.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  {/* Remote Badge */}
                  {job.remote && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        🌍 Remote
                      </span>
                    </div>
                  )}

                  {/* Salary */}
                  {job.salary_range && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900">
                        💰 {job.salary_range}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Link href={`/admin/jobs/edit/${job.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(job.id!)}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
