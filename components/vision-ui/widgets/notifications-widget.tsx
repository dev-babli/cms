"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

export function VisionUINotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Comment",
      message: "John Doe commented on your blog post",
      type: "info",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      title: "Post Published",
      message: "Your blog post has been successfully published",
      type: "success",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      title: "System Update",
      message: "Scheduled maintenance will occur tonight at 2 AM",
      type: "warning",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "4",
      title: "Error Detected",
      message: "Failed to upload image. Please try again.",
      type: "error",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-[#3B82F6]/20 text-[#3B82F6]";
      case "success":
        return "bg-[#10B981]/20 text-[#10B981]";
      case "warning":
        return "bg-[#F59E0B]/20 text-[#F59E0B]";
      case "error":
        return "bg-[#EF4444]/20 text-[#EF4444]";
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#3B82F6]" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-[#EF4444] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-[#3B82F6] hover:text-[#2563EB]"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-[#94A3B8]">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                notification.read
                  ? "bg-[#0F172A] border-[#334155]"
                  : "bg-[#3B82F6]/10 border-[#3B82F6]/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-[#94A3B8] mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-[#94A3B8] hover:text-[#10B981] transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

