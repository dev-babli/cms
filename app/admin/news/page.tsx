"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { News } from "@/lib/cms/types";
import { ContentList } from "@/components/admin/content-list";

export default function NewsList() {
    const router = useRouter();
    const [newsItems, setNewsItems] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string>('viewer');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchUserRole();
                fetchNews();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchUserRole = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.success && data.data?.user) {
                setUserRole(data.data.user.role || 'viewer');
            }
        } catch (error) {
            console.error("Failed to fetch user role:", error);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch("/api/cms/news");
            const data = await res.json();
            if (data.success) {
                setNewsItems(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this news item?")) return;

        try {
            const res = await fetch(`/api/cms/news/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchNews();
            }
        } catch (error) {
            console.error("Failed to delete news item:", error);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve and publish this news item?")) return;

        try {
            const res = await fetch(`/api/cms/news/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: true }),
            });

            if (res.ok) {
                fetchNews();
            }
        } catch (error) {
            console.error("Failed to approve news item:", error);
        }
    };

    if (!authenticated) {
        return null;
    }

    return (
        <ContentList
            items={newsItems.filter((news: any) => news.id !== undefined).map((news: any) => ({ ...news, id: news.id || 0 }))}
            loading={loading}
            emptyTitle="No news items yet"
            emptyDescription="Create your first news item or announcement"
            emptyActionHref="/admin/news/new"
            emptyActionText="Create News Item"
            newItemHref="/admin/news/new"
            editHref={(id) => `/admin/news/edit/${id}`}
            viewHref={(slug) => `/news/${slug}`}
            onDelete={handleDelete}
            onApprove={handleApprove}
            userRole={userRole}
        />
    );
}
