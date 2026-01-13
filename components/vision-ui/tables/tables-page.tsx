"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { MoreVertical, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  function: string;
  status: "online" | "offline";
  employed: string;
}

interface Project {
  id: string;
  name: string;
  company: string;
  companyIcon?: React.ReactNode;
  budget: string;
  status: "working" | "done" | "canceled";
  completion: number;
}

export function VisionUITablesPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team members as authors
        const teamRes = await fetch("/api/cms/team", { credentials: "include" });

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          const members = teamData.success ? (teamData.data || []) : [];
          const authorsData: Author[] = members.slice(0, 6).map((member: any, idx: number) => ({
            id: member.id?.toString() || idx.toString(),
            name: member.name || "Unknown",
            email: member.email || `user${idx}@example.com`,
            avatar: member.image || member.avatar_url,
            function: `${member.role || "Member"} ${member.department || ""}`.trim(),
            status: idx % 3 === 0 ? "online" : "offline",
            employed: member.created_at
              ? new Date(member.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
              : "14/06/21",
          }));
          setAuthors(authorsData);
        }
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: "online" | "offline") => {
    return status === "online"
      ? "bg-[#10B981] text-white"
      : "bg-white text-[#64748B] border border-[#E5E7EB]";
  };

  const getProjectStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "done":
        return "bg-[#10B981] text-white";
      case "working":
        return "bg-[#3B82F6] text-white";
      case "canceled":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-[#94A3B8] text-white";
    }
  };

  // Default projects data
  const defaultProjects: Project[] = [
    {
      id: "1",
      name: "Xd Chakra Soft UI Version",
      company: "Xd",
      budget: "$14,000",
      status: "working",
      completion: 60,
    },
    {
      id: "2",
      name: "Add Progress Track",
      company: "Progress",
      budget: "$3,000",
      status: "canceled",
      completion: 10,
    },
    {
      id: "3",
      name: "Fix Platform Errors",
      company: "Fix",
      budget: "Not set",
      status: "done",
      completion: 100,
    },
    {
      id: "4",
      name: "Launch our Mobile App",
      company: "Launch",
      budget: "$32,000",
      status: "done",
      completion: 100,
    },
    {
      id: "5",
      name: "Add the New Pricing Page",
      company: "Pricing",
      budget: "$400",
      status: "working",
      completion: 25,
    },
    {
      id: "6",
      name: "Redesign New Online Shop",
      company: "Shop",
      budget: "$7,600",
      status: "working",
      completion: 40,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authors Table */}
      <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
        <h3 className="text-lg font-semibold text-white mb-6">Authors Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">AUTHOR</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">FUNCTION</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">STATUS</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">EMPLOYED</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#94A3B8]"></th>
              </tr>
            </thead>
            <tbody>
              {authors.length > 0 ? (
                authors.map((author) => (
                  <tr key={author.id} className="border-b border-[#334155] hover:bg-[#334155]/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-semibold">
                          {author.avatar ? (
                            <img src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            author.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{author.name}</p>
                          <p className="text-xs text-[#94A3B8]">{author.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-[#CBD5E1]">{author.function}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                          getStatusColor(author.status)
                        )}
                      >
                        {(author.status || "").charAt(0).toUpperCase() + (author.status || "").slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-[#CBD5E1]">{author.employed}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                    No authors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Projects</h3>
            <p className="text-sm text-[#94A3B8]">30 done this month</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">COMPANIES</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">BUDGET</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">STATUS</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94A3B8]">COMPLETION</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#94A3B8]"></th>
              </tr>
            </thead>
            <tbody>
              {defaultProjects.map((project) => (
                <tr key={project.id} className="border-b border-[#334155] hover:bg-[#334155]/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-semibold text-xs">
                        {project.company.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[#CBD5E1]">{project.budget}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        getProjectStatusColor(project.status)
                      )}
                    >
                      {(project.status || "").charAt(0).toUpperCase() + (project.status || "").slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#334155] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3B82F6] transition-all duration-300"
                          style={{ width: `${project.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#CBD5E1] font-medium min-w-[3rem] text-right">
                        {project.completion}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

