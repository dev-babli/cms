"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumAdminHeader } from "@/components/ui/premium-admin-header";
import { AdminAccessDenied } from "@/components/admin-access-denied";

interface IPRecord {
  ip: string;
  type: 'whitelist' | 'blacklist' | 'monitor';
  reason?: string;
  created_at: number;
  expires_at?: number;
  violation_count: number;
  last_violation?: number;
  loginAttempts?: LoginAttempt[];
  loginStats?: {
    total: number;
    successful: number;
    failed: number;
    uniqueEmails: number;
    uniqueIPs: number;
    recentFailures: number;
  };
}

interface LoginAttempt {
  id?: number;
  ip: string;
  email: string;
  success: boolean;
  user_id?: string | null;
  user_name?: string | null;
  user_role?: string | null;
  error_message?: string | null;
  user_agent?: string | null;
  created_at: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
}

export default function IPManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<User['role'] | null>(null);
  const [ipRecords, setIpRecords] = useState<IPRecord[]>([] as IPRecord[]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([] as LoginAttempt[]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ips' | 'attempts'>('ips');
  const [filterType, setFilterType] = useState<'all' | 'whitelist' | 'blacklist' | 'monitor'>('all');
  const [searchIP, setSearchIP] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [showAddIPModal, setShowAddIPModal] = useState(false);
  const [newIP, setNewIP] = useState<{ ip: string; type: 'whitelist' | 'blacklist'; reason: string; expiresIn: string }>({ ip: "", type: "blacklist", reason: "", expiresIn: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
          setCurrentUserRole(data.data.user.role);
          if (data.data.user.role === 'admin') {
            fetchData();
          }
        } else {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/login");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (searchIP) {
        params.append('ip', searchIP);
      }
      if (searchEmail) {
        params.append('email', searchEmail);
      }

      const res = await fetch(`/api/admin/ip-management?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIpRecords((data.data.ipRecords || []) as IPRecord[]);
        setLoginAttempts((data.data.loginAttempts || []) as LoginAttempt[]);
        setStats(data.data.stats || null);
      } else {
        setError(data.error || "Failed to fetch IP management data");
        console.error("Failed to fetch IP management data:", data);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("Failed to fetch IP management data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && currentUserRole === 'admin') {
      fetchData();
    }
  }, [filterType, searchIP, searchEmail, authenticated, currentUserRole]);

  const handleAddIP = async () => {
    if (!newIP.ip) {
      setError("IP address is required");
      return;
    }

    setError("");
    try {
      const expiresIn = newIP.expiresIn ? parseInt(newIP.expiresIn) * 60 * 60 * 1000 : undefined; // Convert hours to milliseconds

      const res = await fetch("/api/admin/ip-management", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: newIP.ip,
          type: newIP.type,
          reason: newIP.reason || undefined,
          expiresIn,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowAddIPModal(false);
        setNewIP({ ip: "", type: "blacklist", reason: "", expiresIn: "" });
        fetchData();
      } else {
        setError(data.error || "Failed to add IP");
      }
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to add IP");
    }
  };

  const handleRemoveIP = async (ip: string) => {
    if (!confirm(`Are you sure you want to remove ${ip} from management?`)) return;

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ip-management", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || `IP ${ip} removed successfully`);
        fetchData();
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorMsg = data.error || `Failed to remove IP (${res.status})`;
        setError(errorMsg);
        console.error("Failed to remove IP:", errorMsg, data);
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Network error. Please try again.";
      setError(errorMessage);
      console.error("Failed to remove IP:", errorMessage, error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading IP management...</p>
        </div>
      </div>
    );
  }

  if (currentUserRole !== 'admin') {
    return <AdminAccessDenied userRole={currentUserRole || 'viewer'} />;
  }

  const filteredIPs: IPRecord[] = ipRecords.filter((record) => {
    if (filterType !== 'all' && record.type !== filterType) return false;
    if (searchIP && !record.ip.includes(searchIP)) return false;
    return true;
  });

  const filteredAttempts: LoginAttempt[] = loginAttempts.filter((attempt) => {
    if (searchEmail && !attempt.email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PremiumAdminHeader
        title="IP Management"
        description="Manage IP whitelisting, blacklisting, and monitor login attempts"
        backLink="/admin"
        backText="Dashboard"
      >
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
          onClick={() => setShowAddIPModal(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add IP
        </Button>
      </PremiumAdminHeader>

      <div className="max-w-7xl mx-auto px-6 py-12">
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

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-500 mb-2">Total Login Attempts</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-500 mb-2">Successful</div>
              <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-500 mb-2">Failed</div>
              <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-500 mb-2">Recent Failures (24h)</div>
              <div className="text-3xl font-bold text-orange-600">{stats.recentFailures}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('ips')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'ips'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IP Management ({filteredIPs.length})
            </button>
            <button
              onClick={() => setActiveTab('attempts')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'attempts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Attempts ({filteredAttempts.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'ips' ? (
              <>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Type</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <option value="all">All Types</option>
                      <option value="whitelist">Whitelist</option>
                      <option value="blacklist">Blacklist</option>
                      <option value="monitor">Monitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Search IP</label>
                    <Input
                      placeholder="Search IP address..."
                      value={searchIP}
                      onChange={(e) => setSearchIP(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilterType('all');
                        setSearchIP("");
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                {/* IP Records Table */}
                {filteredIPs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No IP records found</h3>
                    <p className="text-slate-600">IPs will appear here when they are added to whitelist, blacklist, or monitored</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">IP Address</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Violations</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Expires</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredIPs.map((record) => (
                          <tr key={record.ip} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-mono text-slate-900">{record.ip}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  record.type === 'whitelist'
                                    ? 'bg-green-100 text-green-700'
                                    : record.type === 'blacklist'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {record.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{record.reason || '-'}</td>
                            <td className="px-4 py-3 text-sm text-slate-900">{record.violation_count || 0}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {new Date(record.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {record.expires_at
                                ? new Date(record.expires_at).toLocaleString()
                                : 'Never'}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveIP(record.ip)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? "Removing..." : "Remove"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Filters */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Search by Email</label>
                  <Input
                    placeholder="Search email address..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {/* Login Attempts Table */}
                {filteredAttempts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No login attempts found</h3>
                    <p className="text-slate-600">Login attempts will appear here as users attempt to authenticate</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">IP Address</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredAttempts.map((attempt) => (
                          <tr key={attempt.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {new Date(attempt.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-slate-900">{attempt.ip}</td>
                            <td className="px-4 py-3 text-sm text-slate-900">{attempt.email}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {attempt.success && attempt.user_name ? (
                                <div>
                                  <div className="font-medium">{attempt.user_name}</div>
                                  <div className="text-xs text-slate-500">{attempt.user_role}</div>
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  attempt.success
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {attempt.success ? 'Success' : 'Failed'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {attempt.error_message || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add IP Modal */}
      {showAddIPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add IP to Management</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">IP Address</label>
                <Input
                  placeholder="192.168.1.1"
                  value={newIP.ip}
                  onChange={(e) => setNewIP({ ...newIP, ip: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={newIP.type}
                  onChange={(e) => setNewIP({ ...newIP, type: e.target.value as 'whitelist' | 'blacklist' })}
                >
                  <option value="whitelist">Whitelist</option>
                  <option value="blacklist">Blacklist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason (Optional)</label>
                <Input
                  placeholder="Reason for adding this IP"
                  value={newIP.reason}
                  onChange={(e) => setNewIP({ ...newIP, reason: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expires In (Hours, Optional)</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={newIP.expiresIn}
                  onChange={(e) => setNewIP({ ...newIP, expiresIn: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddIP}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add IP
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddIPModal(false);
                  setNewIP({ ip: "", type: "blacklist", reason: "", expiresIn: "" });
                  setError("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

