import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Emscale - Transforming Business with Intelligent AI Solutions",
    description: "Emscale delivers cutting-edge AI technologies that revolutionize how companies operate.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body className="font-sans antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}

