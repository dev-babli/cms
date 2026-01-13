import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { WebVitalsProvider } from "@/components/analytics/WebVitalsProvider";
import { ErrorHandler } from "@/components/error-handler";
import { ReactQueryProvider } from "@/lib/performance/react-query-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Intellectt CMS - Content Management System",
    description: "Manage content for Intellectt website - Blog posts, Services, Team members, and more.",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <ErrorHandler />
                <ReactQueryProvider>
                    <WebVitalsProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </WebVitalsProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}

