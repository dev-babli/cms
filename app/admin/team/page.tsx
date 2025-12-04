"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/lib/cms/types";
import { useRouter } from "next/navigation";

export default function TeamList() {
    const router = useRouter();
    const [members, setMembers] = useState<TeamMember[]>([]);
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
                fetchMembers();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/cms/team");
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch team members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this team member?")) return;

        try {
            const res = await fetch(`/api/cms/team/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchMembers();
            }
        } catch (error) {
            console.error("Failed to delete team member:", error);
        }
    };

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading team members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-indigo-50/20">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/admin"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </Link>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">Team Members</h1>
                                <p className="text-sm text-slate-600 font-medium">{members.length} team {members.length === 1 ? 'member' : 'members'}</p>
                            </div>
                        </div>
                        <Link href="/admin/team/new">
                            <Button size="lg" className="btn-premium flex items-center gap-2 group">
                                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Team Member
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {members.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No team members yet</h3>
                        <p className="text-slate-600 mb-6">Get started by adding your first team member</p>
                        <Link href="/admin/team/new">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Add Your First Team Member
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member) => (
                            <div 
                                key={member.id} 
                                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        {member.image ? (
                                            <div className="relative mb-4">
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 group-hover:border-blue-200 transition-colors shadow-lg"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg">
                                                <span className="text-3xl font-bold text-white">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Name & Position */}
                                        <h3 className="text-xl font-bold mb-1 text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {member.name}
                                        </h3>
                                        {member.position && (
                                            <p className="text-blue-600 font-semibold mb-3">
                                                {member.position}
                                            </p>
                                        )}

                                        {/* Bio */}
                                        {member.bio && (
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                                {member.bio}
                                            </p>
                                        )}

                                        {/* Social Links */}
                                        <div className="flex items-center gap-3 mb-4">
                                            {member.email && (
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                    title="Email"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                    title="LinkedIn"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                    </svg>
                                                </a>
                                            )}
                                            {member.twitter && (
                                                <a
                                                    href={member.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                    title="Twitter"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                                                    </svg>
                                                </a>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="w-full mb-4">
                                            <span
                                                className={`inline-block w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-center ${
                                                    member.published
                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                                }`}
                                            >
                                                {member.published ? "Published" : "Draft"}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 w-full">
                                            <Link href={`/admin/team/edit/${member.id}`} className="flex-1">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(member.id!)}
                                                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
