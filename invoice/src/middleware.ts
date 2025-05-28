import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  const url = request.nextUrl.pathname;

  const publicPaths = ['/login', '/register', '/'];
  if (publicPaths.includes(url)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role || payload.roles;

    if (url.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Invalid token', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard/admin/:path*',
    '/clients/:path*',
    '/products/:path*',
    '/invoices/:path*',
  ],
};
