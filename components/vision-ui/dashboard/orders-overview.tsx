"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Bell, FileText, ShoppingCart, CreditCard, Key, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  title: string;
  amount?: string;
  icon: React.ReactNode;
  timestamp: Date;
  type: "design" | "order" | "payment" | "card" | "unlock" | "other";
}

interface OrdersOverviewProps {
  orders?: Order[];
}

export function VisionUIOrdersOverview({ orders }: OrdersOverviewProps) {
  const [cmsOrders, setCmsOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch recent blog posts and leads as orders
        const [blogRes, leadsRes] = await Promise.all([
          fetch("/api/cms/blog?limit=3", { credentials: "include" }),
          fetch("/api/cms/leads?limit=3", { credentials: "include" }),
        ]);

        const ordersData: Order[] = [];

        if (blogRes.ok) {
          const blogData = await blogRes.json();
          if (blogData.success && blogData.data) {
            blogData.data.forEach((post: any) => {
              ordersData.push({
                id: `blog-${post.id}`,
                title: post.published ? "Post Published" : "Post Created",
                amount: post.published ? undefined : undefined,
                icon: <FileText className="w-4 h-4" />,
                timestamp: new Date(post.created_at || Date.now()),
                type: post.published ? "order" : "design",
              });
            });
          }
        }

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          if (leadsData.success && leadsData.data) {
            leadsData.data.forEach((lead: any) => {
              ordersData.push({
                id: `lead-${lead.id}`,
                title: "New Lead",
                amount: undefined,
                icon: <ShoppingCart className="w-4 h-4" />,
                timestamp: new Date(lead.created_at || Date.now()),
                type: "payment",
              });
            });
          }
        }

        // Sort by timestamp (newest first)
        if (ordersData.length > 0) {
          ordersData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setCmsOrders(ordersData.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const defaultOrders: Order[] = orders || (cmsOrders.length > 0 ? cmsOrders : [
    {
      id: "1",
      title: "Design changes",
      amount: "$2400",
      icon: <Bell className="w-4 h-4" />,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: "design",
    },
    {
      id: "2",
      title: "New order #4219423",
      icon: <FileText className="w-4 h-4" />,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: "order",
    },
    {
      id: "3",
      title: "Server Payments for April",
      icon: <ShoppingCart className="w-4 h-4" />,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: "payment",
    },
    {
      id: "4",
      title: "New card added for order #3210145",
      icon: <CreditCard className="w-4 h-4" />,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      type: "card",
    },
    {
      id: "5",
      title: "Unlock packages for Development",
      icon: <Key className="w-4 h-4" />,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: "unlock",
    },
    {
      id: "6",
      title: "New order #9851258",
      icon: <X className="w-4 h-4" />,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      type: "other",
    },
  ]);

  const getIconColor = (type: Order["type"]) => {
    switch (type) {
      case "design":
        return "text-[#3B82F6] bg-[#3B82F6]/20";
      case "order":
        return "text-[#10B981] bg-[#10B981]/20";
      case "payment":
        return "text-[#F59E0B] bg-[#F59E0B]/20";
      case "card":
        return "text-[#A855F7] bg-[#A855F7]/20";
      case "unlock":
        return "text-[#EF4444] bg-[#EF4444]/20";
      default:
        return "text-[#94A3B8] bg-[#94A3B8]/20";
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Orders overview</h3>
          <p className="text-sm text-[#94A3B8]">+30% this month</p>
        </div>
      </div>
      <div className="space-y-4">
        {defaultOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#334155]/50 transition-colors"
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", getIconColor(order.type))}>
              {order.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{order.title}</p>
                {order.amount && (
                  <p className="text-sm font-semibold text-[#3B82F6]">{order.amount}</p>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                {formatDistanceToNow(order.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

