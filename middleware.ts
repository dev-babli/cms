import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow auth pages and API routes to pass through
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check authentication for admin routes
  if (pathname.startsWith('/admin/')) {
    // Check for Supabase access token (new auth system)
    const supabaseToken = request.cookies.get('sb-access-token')?.value;
    
    // Also check for legacy auth-token for backward compatibility
    const legacyToken = request.cookies.get('auth-token')?.value;
    
    // Simple check: if no token exists, redirect to login
    // Actual token validation happens in API routes (Node.js runtime)
    if (!supabaseToken && !legacyToken) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token exists, let the request through
    // API routes and server components will validate the actual session
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


