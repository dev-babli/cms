"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Ebook } from "@/lib/cms/types";
import { ContentList } from "@/components/admin/content-list";

export default function EbooksList() {
    const router = useRouter();
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
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
                fetchEbooks();
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

    const fetchEbooks = async () => {
        try {
            const res = await fetch("/api/cms/ebooks");
            const data = await res.json();
            if (data.success) {
                setEbooks(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch eBooks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this eBook?")) return;

        try {
            const res = await fetch(`/api/cms/ebooks/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchEbooks();
            }
        } catch (error) {
            console.error("Failed to delete eBook:", error);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve and publish this eBook?")) return;

        try {
            const res = await fetch(`/api/cms/ebooks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: true }),
            });

            if (res.ok) {
                fetchEbooks();
            }
        } catch (error) {
            console.error("Failed to approve eBook:", error);
        }
    };

    if (!authenticated) {
        return null;
    }

    return (
        <ContentList
            items={ebooks}
            loading={loading}
            emptyTitle="No eBooks yet"
            emptyDescription="Create your first eBook to start capturing leads"
            emptyActionHref="/admin/ebooks/new"
            emptyActionText="Create eBook"
            newItemHref="/admin/ebooks/new"
            editHref={(id) => `/admin/ebooks/edit/${id}`}
            viewHref={(slug) => `/ebooks/${slug}`}
            onDelete={handleDelete}
            onApprove={handleApprove}
            userRole={userRole}
        />
    );
}

