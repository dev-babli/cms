"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IndustryPageSchema } from "@/lib/cms/types";

export default function NewIndustryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: "",
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    hero_button_text: "",
    hero_button_link: "",
    hero_background_image: "",
    hero_text_color: "auto",
    hero_features: "",
    published: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        hero_features: form.hero_features
          ? form.hero_features.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      IndustryPageSchema.parse(payload); // will throw if invalid
      const res = await fetch("/api/cms/industry-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/industry-pages");
      } else {
        alert(data.error || "Failed to create industry hero");
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Validation or network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-[18px] font-medium text-[#111827] mb-1">
        New Industry Hero
      </h1>
      <p className="text-sm text-[#6B7280] mb-6">
        Configure the hero section for a specific Industry page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Industry Slug
          </label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            placeholder="e.g. healthcare-and-life-sciences"
            required
          />
          <p className="text-xs text-[#6B7280] mt-1">
            Must match the slug in the public site URL under <code>/industries/&lt;slug&gt;</code>.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Hero Title
          </label>
          <input
            name="hero_title"
            value={form.hero_title}
            onChange={handleChange}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Hero Subtitle
          </label>
          <input
            name="hero_subtitle"
            value={form.hero_subtitle}
            onChange={handleChange}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Hero Description
          </label>
          <textarea
            name="hero_description"
            value={form.hero_description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Button Text
            </label>
            <input
              name="hero_button_text"
              value={form.hero_button_text}
              onChange={handleChange}
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
              placeholder="e.g. Talk to our experts"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Button Link
            </label>
            <input
              name="hero_button_link"
              value={form.hero_button_link}
              onChange={handleChange}
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
              placeholder="/contact"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Background Image URL
          </label>
          <input
            name="hero_background_image"
            value={form.hero_background_image}
            onChange={handleChange}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            placeholder="/herosection/Healthcare-and-Life-sciences.webp"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Text Color
            </label>
            <select
              name="hero_text_color"
              value={form.hero_text_color}
              onChange={handleChange}
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            >
              <option value="auto">Auto (white on dark)</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Features (comma-separated)
            </label>
            <input
              name="hero_features"
              value={form.hero_features}
              onChange={handleChange}
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
              placeholder="Feature one, Feature two, Feature three"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={form.published}
            onChange={handleChange}
            className="w-4 h-4 text-[#3B82F6] border-[#D1D5DB] rounded focus:ring-[#3B82F6]"
          />
          <label htmlFor="published" className="text-sm text-[#374151]">
            Published
          </label>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Industry Hero"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

