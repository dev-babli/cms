"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { IndustryPage } from "@/lib/cms/types";
import { ContentList } from "@/components/admin/content-list";

export default function IndustryPagesList() {
  const router = useRouter();
  const [items, setItems] = useState<IndustryPage[]>([]);
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
        fetchItems();
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      router.push("/auth/login");
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/industry-pages?published=false");
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch industry pages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <ContentList
      items={items
        .filter((i: any) => i.id !== undefined)
        .map((i: any) => ({
          id: i.id || 0,
          title: i.hero_title,
          slug: i.slug,
          excerpt: i.hero_description,
          published: i.published,
          created_at: i.created_at,
          publish_date: null,
        }))}
      loading={loading}
      emptyTitle="Industry Heroes"
      emptyDescription="Configure hero sections for each Industry page, including copy and imagery."
      emptyActionHref="/admin/industry-pages/new"
      emptyActionText="Create Industry Hero"
      newItemHref="/admin/industry-pages/new"
      editHref={(id) => `/admin/industry-pages/edit/${id}`}
      viewHref={(slug) => `/industries/${slug}`}
      onDelete={async (id) => {
        if (!confirm("Delete this industry hero configuration?")) return;
        await fetch(`/api/cms/industry-pages/${id}`, { method: "DELETE" });
        fetchItems();
      }}
      onApprove={async (id) => {
        await fetch(`/api/cms/industry-pages/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: true }),
        });
        fetchItems();
      }}
      contentType="industry-pages"
      columns={[
        {
          title: "Industry",
          width: "col-span-4",
          render: (item) => (
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate">
                {item.slug}
              </p>
              {item.title && (
                <p className="text-xs text-[#6B7280] truncate mt-0.5">
                  {item.title}
                </p>
              )}
            </div>
          ),
        },
        {
          title: "Hero Title",
          width: "col-span-4",
          render: (item) => (
            <p className="text-sm text-[#111827] truncate">{item.title}</p>
          ),
        },
        {
          title: "Status",
          width: "col-span-2",
          render: (item) => (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                item.published
                  ? "bg-[#D1FAE5] text-[#065F46]"
                  : "bg-[#FEF3C7] text-[#92400E]"
              }`}
            >
              {item.published ? "Published" : "Draft"}
            </span>
          ),
        },
      ]}
    />
  );
}

