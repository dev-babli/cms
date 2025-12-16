"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import type { JobPosting } from "@/lib/cms/types";

const defaultJob: Partial<JobPosting> = {
  title: "",
  slug: "",
  location: "",
  employment_type: "Full time",
  categories: "",
  description: "",
  requirements: "",
  skills: "",
  salary_range: "",
  apply_url: "",
  remote: false,
  published: true,
};

export default function NewJobPage() {
  const router = useRouter();
  const [job, setJob] = useState<Partial<JobPosting>>(defaultJob);
  const [saving, setSaving] = useState(false);
  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const textareaClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "block text-sm font-medium text-muted-foreground mb-1";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setJob((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...job,
        categories: job.categories?.trim(),
        slug: job.slug?.trim() || job.title?.toLowerCase().replace(/\s+/g, "-"),
      };
      const res = await fetch("/api/cms/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/admin/jobs");
      }
    } catch (error) {
      console.error("Failed to create job:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="px-[5%] py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Create Job Posting</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Publish new openings for the careers page
              </p>
            </div>
            <Link href="/admin/jobs">
              <Button variant="outline">Cancel</Button>
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
                  placeholder="auto-generated if empty"
                />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  className={inputClass}
                  name="location"
                  value={job.location}
                  onChange={handleChange}
                  placeholder="Iselin, NJ or Remote"
                />
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <input
                  className={inputClass}
                  name="employment_type"
                  value={job.employment_type}
                  onChange={handleChange}
                  placeholder="Full time, Contract, etc."
                />
              </div>
              <div>
                <label className={labelClass}>Categories</label>
                <input
                  className={inputClass}
                  name="categories"
                  value={job.categories}
                  onChange={handleChange}
                  placeholder="Comma separated"
                />
              </div>
              <div>
                <label className={labelClass}>Apply URL</label>
                <input
                  className={inputClass}
                  name="apply_url"
                  value={job.apply_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <div className="border rounded-lg">
                <RichTextEditor
                  content={job.description || ""}
                  onChange={(content) => setJob((prev) => ({ ...prev, description: content }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Requirements</label>
                <div className="border rounded-lg">
                  <RichTextEditor
                    content={job.requirements || ""}
                    onChange={(content) => setJob((prev) => ({ ...prev, requirements: content }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Skills</label>
                <div className="border rounded-lg">
                  <RichTextEditor
                    content={job.skills || ""}
                    onChange={(content) => setJob((prev) => ({ ...prev, skills: content }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Salary Range</label>
                <input
                  className={inputClass}
                  name="salary_range"
                  value={job.salary_range}
                  onChange={handleChange}
                  placeholder="$120k - $150k"
                />
              </div>
              <div className="flex items-center gap-6 mt-6">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={job.remote}
                    onChange={handleCheckbox}
                  />
                  Remote role
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="published"
                    checked={job.published}
                    onChange={handleCheckbox}
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/admin/jobs">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Create preview with form data
                  const previewData = encodeURIComponent(JSON.stringify({
                    title: job.title,
                    slug: job.slug || 'preview',
                    location: job.location,
                    employment_type: job.employment_type,
                    remote: job.remote,
                    salary_range: job.salary_range,
                    categories: job.categories,
                    description: job.description,
                    requirements: job.requirements,
                    skills: job.skills,
                    apply_url: job.apply_url,
                  }));
                  const previewUrl = `/admin/jobs/preview?data=${previewData}`;
                  window.open(previewUrl, '_blank');
                }}
                disabled={!job.title}
              >
                Preview
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Job"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

