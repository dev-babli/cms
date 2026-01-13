"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";
import { AdminAccessDenied } from "@/components/admin-access-denied";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function SetupAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteUserId, setPromoteUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.user) {
          setAuthenticated(true);
          setCurrentUser(data.data.user);
          checkForAdmins();
          fetchUsers();
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const checkForAdmins = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const admins = data.data.filter((u: User) => u.role === 'admin');
          setHasAdmin(admins.length > 0);
        }
      }
    } catch (error) {
      console.error("Failed to check for admins:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handlePromoteCurrentUser = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/promote-to-admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty body promotes current user
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "You have been promoted to admin! Please refresh the page and log in again.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(data.error || "Failed to promote user to admin");
      }
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to promote user");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteByEmail = async () => {
    if (!promoteEmail) {
      setError("Please enter an email address");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/promote-to-admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: promoteEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "User has been promoted to admin!");
        setPromoteEmail("");
        fetchUsers();
        checkForAdmins();
      } else {
        setError(data.error || "Failed to promote user to admin");
      }
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to promote user");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteByUserId = async (userId: string) => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/promote-to-admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "User has been promoted to admin!");
        fetchUsers();
        checkForAdmins();
      } else {
        setError(data.error || "Failed to promote user to admin");
      }
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to promote user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || loading) {
    return null;
  }

  // Only allow access if:
  // 1. No admin exists yet (first-time setup), OR
  // 2. Current user is already an admin
  if (hasAdmin && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <AdminAccessDenied userRole={currentUser?.role || 'viewer'} />
      </div>
    );
  }

  const canPromote = !hasAdmin || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PremiumAdminHeader
        title="Setup Admin User"
        description="Promote a user to admin role"
        backLink="/admin"
        backText="Dashboard"
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {message && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!canPromote && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">
              Admin users already exist. Only existing admins can promote users. 
              Please contact an admin to update your role, or use the Users page if you're already an admin.
            </p>
          </div>
        )}

        {/* Promote Current User */}
        {canPromote && currentUser && currentUser.role !== 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Promote Yourself to Admin</h3>
            <p className="text-sm text-slate-600 mb-4">
              You are currently logged in as: <strong>{currentUser.email}</strong> ({currentUser.role})
            </p>
            <Button
              onClick={handlePromoteCurrentUser}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Promoting..." : "Promote Me to Admin"}
            </Button>
          </div>
        )}

        {/* Promote by Email */}
        {canPromote && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Promote User by Email</h3>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="user@example.com"
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handlePromoteByEmail}
                disabled={loading || !promoteEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Promote
              </Button>
            </div>
          </div>
        )}

        {/* List All Users */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Users</h3>
          {users.length === 0 ? (
            <p className="text-slate-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : user.role === 'editor'
                              ? 'bg-blue-100 text-blue-700'
                              : user.role === 'author'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canPromote && user.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromoteByUserId(user.id)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Promote to Admin
                          </Button>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-xs text-slate-500">Already Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

