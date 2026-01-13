"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { User, FileText, Edit, Trash2, Plus, CheckCircle } from "lucide-react";

interface Activity {
  id: string;
  type: "create" | "update" | "delete" | "publish";
  user: string;
  action: string;
  target: string;
  timestamp: Date;
}

export function VisionUIActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      type: "create",
      user: "John Doe",
      action: "created",
      target: "New Blog Post",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "2",
      type: "update",
      user: "Jane Smith",
      action: "updated",
      target: "Team Member Profile",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: "3",
      type: "publish",
      user: "Bob Johnson",
      action: "published",
      target: "Case Study: Success Story",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "4",
      type: "delete",
      user: "Alice Williams",
      action: "deleted",
      target: "Draft Post",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
    },
  ]);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "create":
        return <Plus className="w-4 h-4 text-[#10B981]" />;
      case "update":
        return <Edit className="w-4 h-4 text-[#3B82F6]" />;
      case "delete":
        return <Trash2 className="w-4 h-4 text-[#EF4444]" />;
      case "publish":
        return <CheckCircle className="w-4 h-4 text-[#10B981]" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "create":
        return "bg-[#10B981]/20";
      case "update":
        return "bg-[#3B82F6]/20";
      case "delete":
        return "bg-[#EF4444]/20";
      case "publish":
        return "bg-[#10B981]/20";
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
        <button className="text-sm text-[#3B82F6] hover:text-[#2563EB]">View All</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                <span className="font-semibold">{activity.user}</span>{" "}
                <span className="text-[#CBD5E1]">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

