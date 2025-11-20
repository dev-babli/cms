"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            // Check if response is ok
            if (!res.ok) {
                let errorMessage = "Login failed";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorData.message || `Server error (${res.status})`;
                } catch {
                    errorMessage = `Server error (${res.status}). Please check your connection and try again.`;
                }
                setError(errorMessage);
                setLoading(false);
                return;
            }

            const data = await res.json();

            if (data.success) {
                showToast("Login successful! Redirecting...", "success", 2000);
                
                // Small delay for toast visibility
                setTimeout(() => {
                    // Redirect based on user role
                    const userRole = data.data.user.role;
                    if (userRole === 'admin') {
                        router.push("/admin");
                    } else {
                        router.push("/admin/blog");
                    }
                }, 500);
            } else {
                setError(data.error || "Login failed");
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Network error. Please check your connection and try again.";
            setError(errorMessage);
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    const lockIcon = (
        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );

    const emailIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
    );

    const passwordIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your CMS account"
            icon={lockIcon}
            footerText="Don't have an account?"
            footerLink="/auth/register"
            footerLinkText="Sign up"
            gradientFrom="from-blue-50"
            gradientTo="to-indigo-100"
            iconBg="bg-blue-600"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <ErrorMessage message={error} />

                <FormField
                    id="email"
                    type="email"
                    label="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@emscale.com"
                    required
                    disabled={loading}
                    icon={emailIcon}
                    hint="Enter your registered email address"
                />

                <FormField
                    id="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    icon={passwordIcon}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <a
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            showToast("Password reset feature coming soon", "info");
                        }}
                    >
                        Forgot password?
                    </a>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                        </span>
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </form>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">Default admin credentials:</p>
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 rounded p-2">
                            Email: admin@emscale.com<br />
                            Password: admin123
                        </p>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
