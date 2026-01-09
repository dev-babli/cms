"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import type { JobPosting } from "@/lib/cms/types";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const textareaClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "block text-sm font-medium text-muted-foreground mb-1";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/cms/jobs/${jobId}`);
        const data = await res.json();
        if (data.success) {
          setJob(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch job:", error);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!job) return;
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev!, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!job) return;
    const { name, checked } = e.target;
    setJob((prev) => ({ ...prev!, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      if (res.ok) {
        router.push("/admin/jobs");
      }
    } catch (error) {
      console.error("Failed to update job:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Job not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="px-[5%] py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Edit Job Posting</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update job details and availability
              </p>
            </div>
            <Link href="/admin/jobs">
              <Button variant="outline">Back</Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  className={inputClass}
                  name="title"
                  value={job.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  className={inputClass}
                  name="slug"
                  value={job.slug}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  className={inputClass}
                  name="location"
                  value={job.location ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <input
                  className={inputClass}
                  name="employment_type"
                  value={job.employment_type ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Categories</label>
                <input
                  className={inputClass}
                  name="categories"
                  value={job.categories ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}>Apply URL</label>
                <input
                  className={inputClass}
                  name="apply_url"
                  value={job.apply_url ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <RichTextEditor
                content={job.description ?? ""}
                onChange={(content) => setJob((prev) => ({ ...prev!, description: content }))}
                placeholder="Enter job description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Requirements</label>
                <RichTextEditor
                  content={job.requirements ?? ""}
                  onChange={(content) => setJob((prev) => ({ ...prev!, requirements: content }))}
                  placeholder="Enter job requirements..."
                />
              </div>
              <div>
                <label className={labelClass}>Skills</label>
                <textarea
                  className={textareaClass}
                  name="skills"
                  value={job.skills ?? ""}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Salary Range</label>
                <input
                  className={inputClass}
                  name="salary_range"
                  value={job.salary_range ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center gap-6 mt-6">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={job.remote ?? false}
                    onChange={handleCheckbox}
                  />
                  Remote role
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="published"
                    checked={job.published ?? false}
                    onChange={handleCheckbox}
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/jobs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

