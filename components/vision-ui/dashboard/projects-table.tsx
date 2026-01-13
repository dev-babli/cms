"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  company: string;
  companyIcon?: React.ReactNode;
  members: Array<{ name: string; avatar?: string }>;
  budget: string;
  status: "working" | "done" | "canceled";
  completion: number;
}

interface ProjectsTableProps {
  projects?: Project[];
}

export function VisionUIProjectsTable({ projects }: ProjectsTableProps) {
  const [cmsProjects, setCmsProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch blog posts as projects
        const res = await fetch("/api/cms/blog?limit=6", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const projectsData: Project[] = data.data.map((post: any, idx: number) => ({
              id: post.id?.toString() || idx.toString(),
              name: post.title || "Untitled",
              company: post.category || "Blog",
              members: [{ name: post.author || "Admin" }], // Ensure members array exists
              budget: post.published ? "Published" : "Draft",
              status: post.published ? "done" : "working",
              completion: post.published ? 100 : 50,
            }));
            setCmsProjects(projectsData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const defaultProjects: Project[] = projects || (cmsProjects.length > 0 ? cmsProjects : [
    {
      id: "1",
      name: "Chakra Soft UI Version",
      company: "Xd",
      members: [
        { name: "User 1", avatar: "" },
        { name: "User 2", avatar: "" },
        { name: "User 3", avatar: "" },
      ],
      budget: "$14,000",
      status: "working",
      completion: 60,
    },
    {
      id: "2",
      name: "Add Progress Track",
      company: "Progress",
      members: [{ name: "User 1", avatar: "" }],
      budget: "$3,000",
      status: "canceled",
      completion: 10,
    },
    {
      id: "3",
      name: "Fix Platform Errors",
      company: "Fix",
      members: [
        { name: "User 1", avatar: "" },
        { name: "User 2", avatar: "" },
      ],
      budget: "Not set",
      status: "done",
      completion: 100,
    },
    {
      id: "4",
      name: "Launch our Mobile App",
      company: "Launch",
      members: [
        { name: "User 1", avatar: "" },
        { name: "User 2", avatar: "" },
        { name: "User 3", avatar: "" },
        { name: "User 4", avatar: "" },
      ],
      budget: "$32,000",
      status: "done",
      completion: 100,
    },
    {
      id: "5",
      name: "Add the New Pricing Page",
      company: "Pricing",
      members: [
        { name: "User 1", avatar: "" },
        { name: "User 2", avatar: "" },
        { name: "User 3", avatar: "" },
      ],
      budget: "$400",
      status: "working",
      completion: 25,
    },
  ]);

  const getStatusColor = (status: Project["status"]) => {
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

  return (
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
                    <div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {(project.members || []).slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-xs font-semibold"
                          >
                            {(member?.name || "?").charAt(0)}
                          </div>
                        ))}
                        {(project.members || []).length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-[#334155] flex items-center justify-center text-[#94A3B8] text-xs">
                            +{(project.members || []).length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-[#CBD5E1]">{project.budget}</p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                      getStatusColor(project.status)
                    )}
                  >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
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
  );
}

