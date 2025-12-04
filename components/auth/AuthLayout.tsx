"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  gradientFrom?: string;
  gradientTo?: string;
  iconBg?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  icon,
  footerText,
  footerLink,
  footerLinkText,
  gradientFrom = "from-blue-50",
  gradientTo = "to-indigo-100",
  iconBg = "bg-blue-600",
}: AuthLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <div className="text-center mb-8">
            <div className={`mx-auto h-14 w-14 ${iconBg} rounded-xl flex items-center justify-center mb-4 shadow-lg transform transition-transform hover:scale-105`}>
              {icon}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {footerText}{" "}
              <Link 
                href={footerLink} 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


