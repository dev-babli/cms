"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email) {
            setError("Email address is required.");
            setLoading(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                showToast(data.message, "success");
            } else {
                setError(data.error || "Failed to send reset link. Please try again.");
                showToast(data.error || "An error occurred.", "error");
            }
        } catch (error: any) {
            setError("Network error. Please check your connection and try again.");
            showToast("Could not connect to the server. Please try again.", "error");
            console.error("Forgot password error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle="Password reset link sent"
                icon={
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                }
                footerText="Remember your password?"
                footerLink="/auth/login"
                footerLinkText="Sign in"
                iconBg="bg-blue-600"
            >
                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            If an account with that email exists, we've sent a password reset link to <strong>{email}</strong>.
                        </p>
                    </div>
                    <div className="text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Please check your email and click the reset link to create a new password.
                        </p>
                        <Link href="/auth/login">
                            <Button className="w-full h-12 text-lg">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your email to receive a reset link"
            icon={
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            }
            footerText="Remember your password?"
            footerLink="/auth/login"
            footerLinkText="Sign in"
            iconBg="bg-purple-600"
            gradientFrom="from-purple-50"
            gradientTo="to-pink-100"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <ErrorMessage message={error} />}

                <FormField
                    id="email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    error={error}
                    required
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={loading}
                >
                    {loading ? "Sending reset link..." : "Send reset link"}
                </Button>
            </form>
        </AuthLayout>
    );
}
