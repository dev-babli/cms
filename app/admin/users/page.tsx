"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface User {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'editor' | 'author' | 'viewer';
    status: 'active' | 'inactive' | 'suspended';
    email_verified: boolean;
    last_login?: string;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
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
        fetchUsers();
    }, []);

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

    const handleDeleteUser = async (userId: number) => {
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

    const handleUpdateUserStatus = async (userId: number, status: string) => {
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

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'editor': return 'bg-blue-100 text-blue-800';
            case 'author': return 'bg-green-100 text-green-800';
            case 'viewer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-yellow-100 text-yellow-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </Link>
                            <h1 className="text-2xl font-semibold">User Management</h1>
                        </div>
                        <Button onClick={() => setShowCreateForm(true)}>
                            Add User
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Users Table */}
                    <div className="bg-white rounded-lg border shadow-sm">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-medium">All Users ({users.length})</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Login
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={user.status}
                                                    onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(user.status)}`}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-900"
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
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6">
                                <h3 className="text-lg font-semibold mb-4">Create New User</h3>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={createFormData.name}
                                            onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={createFormData.email}
                                            onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={createFormData.password}
                                            onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                            placeholder="Enter password"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="role">Role</Label>
                                        <select
                                            id="role"
                                            value={createFormData.role}
                                            onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="flex-1"
                                        >
                                            {createLoading ? "Creating..." : "Create User"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowCreateForm(false)}
                                            className="flex-1"
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
        </div>
    );
}



