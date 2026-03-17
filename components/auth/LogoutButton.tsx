"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call logout API
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies
      });

      // Clear any local storage or state if needed
      if (typeof window !== "undefined") {
        // Clear any cached data
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to login page
      // Use window.location for a hard redirect (clears any cached state)
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, redirect to login
      window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Logout"
      className={cn(
        "text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed",
        collapsed ? "p-2" : "px-4 py-2 text-sm font-medium"
      )}
    >
      {collapsed ? (
        <LogOut className="w-5 h-5" />
      ) : (
        loading ? "Logging out..." : "Logout"
      )}
    </button>
  );
}

