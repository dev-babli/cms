"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { JobPosting } from "@/lib/cms/types";

export default function JobsListPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="px-[5%] py-12">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin">
                <Button variant="outline" className="mb-4">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-4xl font-semibold tracking-tight mb-2">
                Job Postings
              </h1>
              <p className="text-muted-foreground">
                Manage openings visible on the Intellectt careers page
              </p>
            </div>
            <Link href="/admin/jobs/new">
              <Button size="lg">+ New Job</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No job postings yet
              </p>
              <Link href="/admin/jobs/new">
                <Button>Create your first job</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="premium-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.location || "Remote"} ·{" "}
                        {job.employment_type || "Full time"}
                      </p>
                      {job.categories && (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {job.categories}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {job.published ? "Published" : "Draft"}
                        </span>
                        {job.remote && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 ml-4">
                      <Link href={`/admin/jobs/edit/${job.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(job.id!)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

