"use client";

import Link from "next/link";
import { Button } from "./button";

interface PremiumAdminHeaderProps {
  title: string;
  description?: string;
  subtitle?: string; // For backward compatibility
  backLink?: string;
  backHref?: string; // For backward compatibility
  backText?: string;
  children?: React.ReactNode;
}

export function PremiumAdminHeader({ 
  title, 
  description,
  subtitle,
  backLink,
  backHref,
  backText = "Dashboard",
  children
}: PremiumAdminHeaderProps) {
  const backUrl = backLink || backHref || "/admin";
  const displayText = description || subtitle;
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(backLink || backHref) && (
              <>
                <Link 
                  href={backUrl}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {backText}
                </Link>
                <div className="h-6 w-px bg-slate-300"></div>
              </>
            )}
            <div>
              <h1 className="text-2xl font-bold gradient-text">{title}</h1>
              {displayText && (
                <p className="text-sm text-slate-600 font-medium">{displayText}</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

