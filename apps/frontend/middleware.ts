'use client';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authService } from './services/auth.service';

export function middleware(request: NextRequest) {
  // For API routes, skip middleware
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');

  authService.isAuthenticated().then((isAuthenticated) => {
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (!isAuthenticated && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  });

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
