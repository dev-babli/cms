"use client";

import * as React from "react";
import { useState } from "react";
import { Camera, Save, User, Mail, Phone, MapPin, Briefcase, Calendar, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface VisionUIProfilePageProps {
  user: User;
}

export function VisionUIProfilePage({ user }: VisionUIProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "projects">("overview");
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: "",
    location: "United States",
    company: "Intellectt",
    role: user.role || "",
    website: "",
    bio: "Hi, I'm Alec Thompson, Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality).",
  });

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log("Saving profile:", formData);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="relative bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
        {/* Background Gradient */}
        <div className="h-32 bg-gradient-to-r from-[#3B82F6] to-[#A855F7]" />
        
        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-[#1E293B] border-4 border-[#1E293B] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#3B82F6] border-4 border-[#1E293B] flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 pt-20 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{formData.name}</h2>
                  <p className="text-[#94A3B8] mb-2">{(formData.role || "").charAt(0).toUpperCase() + (formData.role || "").slice(1)}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{formData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{formData.company}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1E293B] rounded-xl border border-[#334155]">
        <div className="flex border-b border-[#334155]">
          {[
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Settings" },
            { id: "projects", label: "Projects" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[#3B82F6] border-b-2 border-[#3B82F6]"
                  : "text-[#94A3B8] hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">About me</h3>
                <p className="text-[#CBD5E1] leading-relaxed">{formData.bio}</p>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Email</p>
                      <p className="text-sm font-medium text-white">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Phone</p>
                      <p className="text-sm font-medium text-white">{formData.phone || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Location</p>
                      <p className="text-sm font-medium text-white">{formData.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Website</p>
                      <p className="text-sm font-medium text-white">{formData.website || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Projects", value: "32" },
                    { label: "Posts", value: "124" },
                    { label: "Followers", value: "1,234" },
                    { label: "Following", value: "456" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-[#0F172A] rounded-lg border border-[#334155] text-center">
                      <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-sm text-[#94A3B8]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#CBD5E1] mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Projects</h3>
              <div className="text-center py-12 text-[#94A3B8]">
                <p>No projects yet. Projects will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

