"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
    id: number | string;
    email: string;
    name: string;
    role: 'admin' | 'editor' | 'author' | 'viewer';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    email_verified: boolean;
    last_login?: string;
    created_at: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState("");
    const [createFormData, setCreateFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "author" as const,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/auth/check");
            if (res.ok) {
                setAuthenticated(true);
                fetchUsers();
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createFormData),
            });

            const data = await res.json();

            if (data.success) {
                setUsers([data.data, ...users]);
                setCreateFormData({ name: "", email: "", password: "", role: "author" });
                setShowCreateForm(false);
            } else {
                setError(data.error || "Failed to create user");
            }
        } catch (error) {
            setError("Network error. Please try again.");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number | string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUsers(users.filter(user => user.id !== userId));
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const handleUpdateUserStatus = async (userId: number | string, status: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, status: status as any } : user
                ));
            }
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleUpdateUserRole = async (userId: number | string, role: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUsers(users.map(user =>
                        user.id === userId ? { ...user, role: role as any } : user
                    ));
                } else {
                    alert(data.error || "Failed to update user role");
                }
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to update user role");
            }
        } catch (error) {
            console.error("Failed to update user role:", error);
            alert("Failed to update user role. Please try again.");
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'author': return 'bg-green-100 text-green-800 border-green-200';
            case 'viewer': return 'bg-slate-100 text-slate-800 border-slate-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'inactive': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const handleApproveUser = async (userId: number | string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: 'active' }),
            });

            if (res.ok) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, status: 'active' as any } : user
                ));
            }
        } catch (error) {
            console.error("Failed to approve user:", error);
        }
    };

    const handleRejectUser = async (userId: number | string) => {
        if (!confirm("Are you sure you want to reject this user? They will be deleted.")) return;
        
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUsers(users.filter(user => user.id !== userId));
            }
        } catch (error) {
            console.error("Failed to reject user:", error);
        }
    };

    const pendingUsers = users.filter(user => user.status === 'pending');
    const activeUsers = users.filter(user => user.status !== 'pending');

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-indigo-50/20">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/admin"
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Dashboard
                            </Link>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">User Management</h1>
                                <p className="text-sm text-slate-600 font-medium">{users.length} {users.length === 1 ? 'user' : 'users'} total • Admin Only</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setShowCreateForm(true)}
                            size="lg"
                            className="btn-premium flex items-center gap-2 group"
                        >
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add User
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Pending Users Section */}
                {pendingUsers.length > 0 && (
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl shadow-sm mb-8 overflow-hidden">
                        <div className="px-6 py-5 border-b border-yellow-200 bg-yellow-100/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-yellow-900">
                                        Pending Approval ({pendingUsers.length})
                                    </h2>
                                    <p className="text-sm text-yellow-700">
                                        These users are waiting for admin approval
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-yellow-100/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-900 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-900 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-900 uppercase tracking-wider">
                                            Registered
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-900 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-yellow-200">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-yellow-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm">
                                                            <span className="text-lg font-bold text-white">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-slate-600">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getRoleColor(user.role)}`}
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="author">Author</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => handleApproveUser(user.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectUser(user.id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* All Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">All Users ({users.length})</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                                                        <span className="text-lg font-bold text-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getRoleColor(user.role)}`}
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="author">Author</option>
                                                <option value="editor">Editor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.status}
                                                onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(user.status)}`}
                                            >
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create User Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Create New User</h3>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleCreateUser} className="space-y-5">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-2 block">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={createFormData.name}
                                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 mb-2 block">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={createFormData.email}
                                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        required
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 mb-2 block">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createFormData.password}
                                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                        placeholder="Enter password"
                                        required
                                        minLength={6}
                                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="role" className="text-sm font-semibold text-slate-700 mb-2 block">Role</Label>
                                    <select
                                        id="role"
                                        value={createFormData.role}
                                        onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as any })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="author">Author</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {createLoading ? "Creating..." : "Create User"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 border-slate-300"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
