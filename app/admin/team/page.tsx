"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/lib/cms/types";

export default function TeamList() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="px-[5%] py-12">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/admin">
                                <Button variant="outline" className="mb-4">
                                    ← Back to Dashboard
                                </Button>
                            </Link>
                            <h1 className="text-4xl font-semibold tracking-tight mb-2">
                                Team Members
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your team profiles
                            </p>
                        </div>
                        <Link href="/admin/team/new">
                            <Button size="lg">+ New Team Member</Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : members.length === 0 ? (
                        <div className="premium-card p-12 text-center">
                            <p className="text-muted-foreground mb-4">No team members yet</p>
                            <Link href="/admin/team/new">
                                <Button>Add your first team member</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members.map((member) => (
                                <div key={member.id} className="premium-card p-6">
                                    <div className="flex flex-col items-center text-center">
                                        {member.image && (
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-24 h-24 rounded-full object-cover mb-4"
                                            />
                                        )}
                                        <h3 className="text-xl font-semibold mb-1">
                                            {member.name}
                                        </h3>
                                        {member.position && (
                                            <p className="text-primary font-medium mb-2">
                                                {member.position}
                                            </p>
                                        )}
                                        {member.bio && (
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                                {member.bio}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mb-4">
                                            {member.email && (
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className="text-muted-foreground hover:text-primary"
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
                                                    className="text-muted-foreground hover:text-primary"
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
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm w-full">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium flex-1 text-center ${
                                                    member.published
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {member.published ? "Published" : "Draft"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 w-full">
                                            <Link href={`/admin/team/edit/${member.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(member.id!)}
                                                className="flex-1"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

