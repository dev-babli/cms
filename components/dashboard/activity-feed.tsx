"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Activity {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  content?: string;
  contentType?: string;
  timeAgo: string;
  link?: string;
  embeddedCard?: {
    title: string;
    subtitle: string;
  };
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockActivities: Activity[] = [
      {
        id: 1,
        user: { name: "Mufidul", avatar: "/api/placeholder/32/32" },
        action: "Hello i wil pin this so don't forget",
        contentType: "Post",
        timeAgo: "1 Min ago",
        embeddedCard: {
          title: "1/9 Meeting Notes",
          subtitle: "Last edited just now",
        },
      },
      {
        id: 2,
        user: { name: "Mufidul", avatar: "/api/placeholder/32/32" },
        action: "New pin added by Mufidul",
        timeAgo: "1 Min ago",
        link: "/dashboard",
      },
    ];
    setActivities(mockActivities);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
      <h2 className="text-lg font-semibold text-[#111827] mb-4">Activity Feed</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border-b border-[#E5E7EB] pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {activity.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#111827]">{activity.user.name}</span>
                  <span className="text-xs text-[#6B7280]">{activity.timeAgo}</span>
                </div>
                <p className="text-sm text-[#111827] mb-2">{activity.action}</p>
                {activity.contentType && (
                  <select className="text-xs text-[#6B7280] border border-[#E5E7EB] rounded px-2 py-1 bg-white">
                    <option>{activity.contentType}</option>
                  </select>
                )}
                {activity.embeddedCard && (
                  <div className="mt-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3">
                    <div className="text-sm font-medium text-[#111827] mb-1">
                      {activity.embeddedCard.title}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {activity.embeddedCard.subtitle}
                    </div>
                  </div>
                )}
                {activity.link && (
                  <Link
                    href={activity.link}
                    className="text-xs text-[#3B82F6] hover:underline mt-2 inline-block"
                  >
                    View it in the Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





