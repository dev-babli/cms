"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lead } from "@/lib/cms/types";
import { useRouter } from "next/navigation";
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";

export default function LeadsList() {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        contentType: "",
        search: "",
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchLeads();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch("/api/cms/leads");
            const data = await res.json();
            if (data.success) {
                setLeads(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.contentType) params.append('content_type', filters.contentType);

            const res = await fetch(`/api/admin/leads/export?${params.toString()}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to export leads');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        }
    };

    const updateLeadStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`/api/cms/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchLeads();
            }
        } catch (error) {
            console.error('Failed to update lead status:', error);
        }
    };

    const filteredLeads = leads.filter((lead: any) => {
        if (filters.status && lead.status !== filters.status) return false;
        if (filters.contentType && lead.content_type !== filters.contentType) return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                lead.first_name?.toLowerCase().includes(searchLower) ||
                lead.last_name?.toLowerCase().includes(searchLower) ||
                lead.email?.toLowerCase().includes(searchLower) ||
                lead.company?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading leads...</p>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        new: "bg-blue-100 text-blue-700",
        contacted: "bg-yellow-100 text-yellow-700",
        qualified: "bg-purple-100 text-purple-700",
        converted: "bg-green-100 text-green-700",
        lost: "bg-red-100 text-red-700",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <PremiumAdminHeader
                title="Leads"
                description={`${filteredLeads.length} of ${leads.length} leads`}
                backLink="/admin"
                backText="Dashboard"
            >
                <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
                    onClick={handleExport}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                </Button>
            </PremiumAdminHeader>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                            <Input
                                placeholder="Search leads..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="converted">Converted</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Content Type</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                value={filters.contentType}
                                onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="ebook">eBook</option>
                                <option value="case_study">Case Study</option>
                                <option value="whitepaper">Whitepaper</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ status: "", contentType: "", search: "" })}
                                className="w-full"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Leads Table */}
                {filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No leads found</h3>
                        <p className="text-slate-600">Leads will appear here when users download gated content</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Content</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredLeads.map((lead: any) => (
                                        <tr key={lead.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {lead.first_name} {lead.last_name}
                                                    </div>
                                                    <div className="text-sm text-slate-500">{lead.email}</div>
                                                    {lead.phone && (
                                                        <div className="text-xs text-slate-400">{lead.phone}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{lead.company || '-'}</div>
                                                {lead.job_title && (
                                                    <div className="text-xs text-slate-500">{lead.job_title}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold mr-2">
                                                        {lead.content_type}
                                                    </span>
                                                    {lead.content_title || `ID: ${lead.content_id}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={lead.status || 'new'}
                                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                    className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${statusColors[lead.status] || statusColors.new}`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="qualified">Qualified</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="lost">Lost</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <a 
                                                    href={`mailto:${lead.email}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Email
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

