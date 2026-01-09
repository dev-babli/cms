"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy } from "@/lib/cms/types";
import { ContentList } from "@/components/admin/content-list";

export default function CaseStudiesList() {
    const router = useRouter();
    const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
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
                fetchCaseStudies();
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

    const fetchCaseStudies = async () => {
        try {
            const res = await fetch("/api/cms/case-studies");
            const data = await res.json();
            if (data.success) {
                setCaseStudies(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch case studies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this case study?")) return;

        try {
            const res = await fetch(`/api/cms/case-studies/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchCaseStudies();
            }
        } catch (error) {
            console.error("Failed to delete case study:", error);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve and publish this case study?")) return;

        try {
            const res = await fetch(`/api/cms/case-studies/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: true }),
            });

            if (res.ok) {
                fetchCaseStudies();
            }
        } catch (error) {
            console.error("Failed to approve case study:", error);
        }
    };

    if (!authenticated) {
        return null;
    }

    return (
        <ContentList
            items={caseStudies.filter((cs: any) => cs.id !== undefined).map((cs: any) => ({ ...cs, id: cs.id || 0 }))}
            loading={loading}
            emptyTitle="No case studies yet"
            emptyDescription="Create your first case study to showcase client success"
            emptyActionHref="/admin/case-studies/new"
            emptyActionText="Create Case Study"
            newItemHref="/admin/case-studies/new"
            editHref={(id) => `/admin/case-studies/edit/${id}`}
            viewHref={(slug) => `/case-studies/${slug}`}
            onDelete={handleDelete}
            onApprove={handleApprove}
            userRole={userRole}
            columns={[
                {
                    title: 'Title',
                    width: 'col-span-5',
                    render: (item) => (
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-[#111827] truncate hover:text-[#3B82F6] transition-colors duration-150">
                                {item.title || 'Untitled'}
                            </h3>
                            {item.client_name && (
                                <p className="text-xs text-[#6B7280] truncate mt-0.5">
                                    Client: {item.client_name}
                                </p>
                            )}
                        </div>
                    ),
                },
                {
                    title: 'Author',
                    width: 'col-span-2',
                    render: (item) => (
                        <span className="text-sm text-[#6B7280]">
                            {item.author || '—'}
                        </span>
                    ),
                },
                {
                    title: 'Date',
                    width: 'col-span-2',
                    render: (item) => {
                        const formatDate = (dateString: string | null | undefined) => {
                            if (!dateString) return '—';
                            const date = new Date(dateString);
                            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        };
                        return (
                            <span className="text-sm text-[#6B7280]">
                                {formatDate(item.publish_date || item.created_at)}
                            </span>
                        );
                    },
                },
                {
                    title: 'Status',
                    width: 'col-span-1',
                    render: (item) => (
                        <div className="flex flex-col gap-1">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    item.published
                                        ? 'bg-[#D1FAE5] text-[#065F46]'
                                        : 'bg-[#FEF3C7] text-[#92400E]'
                                }`}
                            >
                                {item.published ? 'Published' : 'Draft'}
                            </span>
                            {item.gated && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#DBEAFE] text-[#1E40AF]">
                                    Gated
                                </span>
                            )}
                        </div>
                    ),
                },
            ]}
        />
    );
}

