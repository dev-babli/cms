import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { WebVitalsProvider } from "@/components/analytics/WebVitalsProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Intellectt CMS - Content Management System",
    description: "Manage content for Intellectt website - Blog posts, Services, Team members, and more.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <WebVitalsProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </WebVitalsProvider>
            </body>
        </html>
    );
}

