"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { IndustryPage } from "@/lib/cms/types";

export default function EditIndustryPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const [item, setItem] = useState<IndustryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cms/industry-pages/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const hero = data.data as IndustryPage & { hero_features?: any };
        setItem({
          ...hero,
          hero_features: Array.isArray(hero.hero_features)
            ? hero.hero_features
            : typeof hero.hero_features === "string"
            ? (() => {
                try {
                  const parsed = JSON.parse(hero.hero_features as any);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })()
            : [],
        });
      } else {
        setItem(null);
      }
    } catch (error) {
      console.error("Failed to fetch industry page:", error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, value: any) => {
    setItem((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      setSaving(true);
      const payload: any = {
        ...item,
        hero_features:
          typeof item.hero_features === "string"
            ? (item.hero_features as string)
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : item.hero_features || [],
      };
      const res = await fetch(`/api/cms/industry-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/industry-pages");
      } else {
        alert(data.error || "Failed to update industry hero");
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#6B7280]">Loading industry hero...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#6B7280]">Industry hero not found.</p>
      </div>
    );
  }

  const featuresString =
    Array.isArray(item.hero_features) && item.hero_features.length
      ? item.hero_features.join(", ")
      : "";

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-[18px] font-medium text-[#111827] mb-1">
        Edit Industry Hero
      </h1>
      <p className="text-sm text-[#6B7280] mb-6">
        Update the hero section configuration for this Industry page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Industry Slug
          </label>
          <input
            name="slug"
            value={item.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Hero Title
          </label>
          <input
            name="hero_title"
            value={item.hero_title}
            onChange={(e) => updateField("hero_title", e.target.value)}
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
            value={item.hero_subtitle || ""}
            onChange={(e) => updateField("hero_subtitle", e.target.value)}
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Hero Description
          </label>
          <textarea
            name="hero_description"
            value={item.hero_description || ""}
            onChange={(e) => updateField("hero_description", e.target.value)}
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
              value={item.hero_button_text || ""}
              onChange={(e) => updateField("hero_button_text", e.target.value)}
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Button Link
            </label>
            <input
              name="hero_button_link"
              value={item.hero_button_link || ""}
              onChange={(e) =>
                updateField("hero_button_link", e.target.value)
              }
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Background Image URL
          </label>
          <input
            name="hero_background_image"
            value={item.hero_background_image || ""}
            onChange={(e) =>
              updateField("hero_background_image", e.target.value)
            }
            className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Text Color
            </label>
            <select
              name="hero_text_color"
              value={item.hero_text_color || "auto"}
              onChange={(e) => updateField("hero_text_color", e.target.value)}
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
              value={featuresString}
              onChange={(e) =>
                updateField(
                  "hero_features",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              className="w-full border border-[#D1D5DB] rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={item.published}
            onChange={(e) => updateField("published", e.target.checked)}
            className="w-4 h-4 text-[#3B82F6] border-[#D1D5DB] rounded focus:ring-[#3B82F6]"
          />
          <label htmlFor="published" className="text-sm text-[#374151]">
            Published
          </label>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
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

