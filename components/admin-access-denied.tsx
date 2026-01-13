"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UserInfo {
  email: string;
  name: string;
  role: string;
}

export function AdminAccessDenied({ 
  requiredRole = "admin", 
  userRole 
}: { 
  requiredRole?: string;
  userRole?: string;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user) {
            setUser(data.data.user);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpgradeRole = async () => {
    setUpgrading(true);
    setUpgradeMessage("");

    try {
      const res = await fetch("/api/admin/set-admin-role", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUpgradeMessage(
          "✅ Your role has been upgraded! Please refresh the page or log out and log back in."
        );
        // Auto-refresh after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setUpgradeMessage(
          data.error || "Failed to upgrade role. An admin user may already exist."
        );
      }
    } catch (error) {
      setUpgradeMessage("Network error. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#F59E0B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Access Denied</h2>
          <p className="text-[#6B7280]">
            This feature requires <span className="font-semibold text-[#111827]">{requiredRole}</span> access.
            {userRole && (
              <span className="block mt-1">Your current role: <span className="font-semibold">{userRole}</span></span>
            )}
          </p>
        </div>

        {user && (
          <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Your Email:</span>
                <span className="text-sm font-medium text-[#111827]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Your Name:</span>
                <span className="text-sm font-medium text-[#111827]">{user.name || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Current Role:</span>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    user.role === "admin"
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : user.role === "editor"
                      ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                      : user.role === "author"
                      ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                      : "bg-[#6B7280]/10 text-[#6B7280]"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#111827] mb-2">How to Get Admin Access:</h3>
            <ol className="text-xs text-[#6B7280] space-y-1 list-decimal list-inside">
              <li>Contact an existing administrator to update your role</li>
              <li>Or, if you're the first user, try the upgrade button below</li>
              <li>Or, manually update your role in Supabase Dashboard</li>
            </ol>
          </div>

          {upgradeMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                upgradeMessage.includes("✅")
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  : "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/20"
              }`}
            >
              {upgradeMessage}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleUpgradeRole}
              disabled={upgrading}
              className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            >
              {upgrading ? "Upgrading..." : "Try Auto-Upgrade (First Admin Only)"}
            </Button>
            <Link href="/admin" className="flex-1">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-xs text-[#9CA3AF] text-center pt-4 border-t border-[#E5E7EB]">
            <p className="mb-2">Need help? Contact your system administrator.</p>
            <p>
              To manually update in Supabase: Authentication → Users → Edit user_metadata → Add{" "}
              <code className="bg-[#F3F4F6] px-1 py-0.5 rounded">{"role: 'admin'"}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

