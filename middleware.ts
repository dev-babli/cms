import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow auth pages to pass through
  if (pathname.startsWith('/auth/')) {
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
      return NextResponse.redirect(new URL('/auth/login', request.url));
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


