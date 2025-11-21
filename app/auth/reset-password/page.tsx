"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import ErrorMessage from "@/components/auth/ErrorMessage";
import PasswordStrength from "@/components/auth/PasswordStrength";
import PasswordMatch from "@/components/auth/PasswordMatch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const tokenParam = searchParams.get("token") || searchParams.get("token_hash");
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setErrors({ token: "Reset token is missing. Please use the link from your email." });
        }
    }, [searchParams]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast("Please correct the errors in the form.", "error");
            return;
        }

        if (!token) {
            showToast("Reset token is missing. Please use the link from your email.", "error");
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showToast(data.message, "success");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                setErrors({ api: data.error || "Failed to reset password. Please try again." });
                showToast(data.error || "An unexpected error occurred.", "error");
            }
        } catch (error: any) {
            setErrors({ api: error.message || "Network error. Please check your connection and try again." });
            showToast("Could not connect to the server. Please try again.", "error");
            console.error("Reset password error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your new password"
            icon={
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            }
            footerText="Remember your password?"
            footerLink="/auth/login"
            footerLinkText="Sign in"
            iconBg="bg-indigo-600"
            gradientFrom="from-indigo-50"
            gradientTo="to-purple-100"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors.token && <ErrorMessage message={errors.token} />}
                {errors.api && <ErrorMessage message={errors.api} />}

                <FormField
                    id="password"
                    label="New password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your new password"
                    error={errors.password}
                    required
                    minLength={6}
                />
                <PasswordStrength password={formData.password} />

                <FormField
                    id="confirmPassword"
                    label="Confirm password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    error={errors.confirmPassword}
                    required
                    minLength={6}
                />
                <PasswordMatch password={formData.password} confirmPassword={formData.confirmPassword} />

                <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={loading || !token}
                >
                    {loading ? "Resetting password..." : "Reset password"}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthLayout
                title="Reset password"
                subtitle="Loading..."
                icon={
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                }
                footerText=""
                footerLink="/auth/login"
                footerLinkText=""
                iconBg="bg-indigo-600"
            >
                <div className="text-center">Loading...</div>
            </AuthLayout>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
