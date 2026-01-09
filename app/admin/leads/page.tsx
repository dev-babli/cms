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

    // Real-time polling for new leads
    useEffect(() => {
        if (!authenticated) return;
        
        // Poll every 10 seconds for new leads
        const interval = setInterval(() => {
            fetchLeads();
        }, 10000);
        
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authenticated]);

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
            const res = await fetch("/api/cms/leads", {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
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
        // Handle contact form submissions (content_type is null) vs content-based leads
        if (filters.contentType) {
            if (filters.contentType === 'contact_form') {
                // Show only contact form submissions (no content_type)
                if (lead.content_type) return false;
            } else {
                // Show only leads with specific content_type
                if (lead.content_type !== filters.contentType) return false;
            }
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                lead.first_name?.toLowerCase().includes(searchLower) ||
                lead.last_name?.toLowerCase().includes(searchLower) ||
                lead.email?.toLowerCase().includes(searchLower) ||
                lead.company?.toLowerCase().includes(searchLower) ||
                lead.notes?.toLowerCase().includes(searchLower)
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
                                <option value="contact_form">Contact Form</option>
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

                {/* Leads Grid with Source on Right */}
                {filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No leads found</h3>
                        <p className="text-slate-600">Leads will appear here when users download gated content or submit contact forms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Leads List */}
                        <div className="lg:col-span-2 space-y-4">
                            {filteredLeads.map((lead: any) => {
                                const isDownloadable = !!lead.content_type;
                                const isContactForm = !lead.content_type;
                                
                                return (
                                    <div 
                                        key={lead.id} 
                                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="flex">
                                            {/* Left Side - Main Content */}
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                                            {lead.first_name} {lead.last_name}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                {lead.email}
                                                            </span>
                                                            {lead.phone && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                    </svg>
                                                                    {lead.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={lead.status || 'new'}
                                                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 ${statusColors[lead.status] || statusColors.new} cursor-pointer`}
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="contacted">Contacted</option>
                                                        <option value="qualified">Qualified</option>
                                                        <option value="converted">Converted</option>
                                                        <option value="lost">Lost</option>
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    {lead.company && (
                                                        <div>
                                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Company</div>
                                                            <div className="text-sm text-slate-900">{lead.company}</div>
                                                            {lead.job_title && (
                                                                <div className="text-xs text-slate-600 mt-1">{lead.job_title}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Date</div>
                                                        <div className="text-sm text-slate-900">
                                                            {new Date(lead.created_at).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {lead.notes && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Message</div>
                                                        <div className="text-sm text-slate-700 line-clamp-2">{lead.notes}</div>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex items-center gap-2">
                                                    <a 
                                                        href={`mailto:${lead.email}`}
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        Send Email
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Right Side - Lead Source */}
                                            <div className={`w-64 p-6 border-l border-slate-200 ${isDownloadable ? 'bg-blue-50' : 'bg-green-50'}`}>
                                                <div className="mb-4">
                                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Lead Source</div>
                                                    {isDownloadable ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                <span className="text-sm font-semibold text-blue-900">Downloadable Content</span>
                                                            </div>
                                                            <div className="pl-4 space-y-2">
                                                                <div>
                                                                    <div className="text-xs text-slate-600 mb-1">Content Type</div>
                                                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold inline-block">
                                                                        {lead.content_type}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-slate-600 mb-1">Content</div>
                                                                    <div className="text-sm font-medium text-slate-900">
                                                                        {lead.content_title || `ID: ${lead.content_id}`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                                <span className="text-sm font-semibold text-green-900">Contact Form</span>
                                                            </div>
                                                            <div className="pl-4">
                                                                <div className="text-xs text-slate-600 mb-1">Submission Type</div>
                                                                <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold inline-block">
                                                                    General Inquiry
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {lead.lead_source && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Additional Info</div>
                                                        <div className="space-y-1 text-xs text-slate-600">
                                                            {lead.lead_source && (
                                                                <div>Source: <span className="font-medium text-slate-900">{lead.lead_source}</span></div>
                                                            )}
                                                            {lead.referrer && (
                                                                <div>Referrer: <span className="font-medium text-slate-900 truncate block">{lead.referrer}</span></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Sidebar - Stats */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">Lead Statistics</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">By Source</div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    <span className="text-sm text-slate-700">Downloadable</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {leads.filter((l: any) => l.content_type).length}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                    <span className="text-sm text-slate-700">Contact Form</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {leads.filter((l: any) => !l.content_type).length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">By Status</div>
                                        <div className="space-y-2">
                                            {Object.entries(statusColors).map(([status, colorClass]) => {
                                                const count = leads.filter((l: any) => l.status === status).length;
                                                return (
                                                    <div key={status} className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-700 capitalize">{status}</span>
                                                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200">
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Total Leads</div>
                                        <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

