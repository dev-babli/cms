"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import ErrorMessage from "@/components/auth/ErrorMessage";
import PasswordStrength from "@/components/auth/PasswordStrength";
import PasswordMatch from "@/components/auth/PasswordMatch";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        const errors: Record<string, string> = { ...fieldErrors };
        
        switch (name) {
            case "name":
                if (value.length < 2) {
                    errors.name = "Name must be at least 2 characters";
                } else {
                    delete errors.name;
                }
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.email = "Please enter a valid email address";
                } else {
                    delete errors.email;
                }
                break;
            case "password":
                if (value.length < 6) {
                    errors.password = "Password must be at least 6 characters";
                } else {
                    delete errors.password;
                }
                break;
            case "confirmPassword":
                if (value !== formData.password) {
                    errors.confirmPassword = "Passwords do not match";
                } else {
                    delete errors.confirmPassword;
                }
                break;
        }
        
        setFieldErrors(errors);
    };

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
        if (name === "password" && formData.confirmPassword) {
            validateField("confirmPassword", formData.confirmPassword);
        }
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate all fields
        validateField("name", formData.name);
        validateField("email", formData.email);
        validateField("password", formData.password);
        validateField("confirmPassword", formData.confirmPassword);

        // Check for any validation errors
        if (Object.keys(fieldErrors).length > 0) {
            setError("Please fix the errors in the form");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: "author", // Default role for new users
                }),
            });

            // Check if response is ok
            if (!res.ok) {
                let errorMessage = "Registration failed";
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
                // Show success message about pending approval
                if (data.data?.requiresApproval) {
                    showToast(
                        "Registration successful! Your account is pending admin approval. You will be able to log in once an administrator approves your account.",
                        "success",
                        6000
                    );
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        router.push("/auth/login");
                    }, 2000);
                } else {
                    // Old flow (shouldn't happen with new approval system)
                    showToast("Registration successful!", "success");
                    router.push("/admin/blog");
                }
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Network error. Please check your connection and try again.";
            setError(errorMessage);
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

    const userIcon = (
        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );

    const nameIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
            title="Create account"
            subtitle="Join the CMS platform"
            icon={userIcon}
            footerText="Already have an account?"
            footerLink="/auth/login"
            footerLinkText="Sign in"
            gradientFrom="from-green-50"
            gradientTo="to-emerald-100"
            iconBg="bg-green-600"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <ErrorMessage message={error} />

                <FormField
                    id="name"
                    type="text"
                    label="Full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                    error={fieldErrors.name}
                    icon={nameIcon}
                    hint="Enter your full name"
                />

                <FormField
                    id="email"
                    type="email"
                    label="Email address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                    error={fieldErrors.email}
                    icon={emailIcon}
                    hint="We'll never share your email"
                />

                <div>
                    <FormField
                        id="password"
                        type="password"
                        label="Password"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        error={fieldErrors.password}
                        icon={passwordIcon}
                        minLength={6}
                    />
                    <PasswordStrength password={formData.password} />
                </div>

                <div>
                    <FormField
                        id="confirmPassword"
                        type="password"
                        label="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Confirm your password"
                        required
                        disabled={loading}
                        error={fieldErrors.confirmPassword}
                        icon={passwordIcon}
                        minLength={6}
                    />
                    <PasswordMatch 
                        password={formData.password} 
                        confirmPassword={formData.confirmPassword} 
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] bg-green-600 hover:bg-green-700"
                    disabled={loading || Object.keys(fieldErrors).length > 0}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
