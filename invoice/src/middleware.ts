import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      if (!token) return false;

      if (pathname.startsWith('/dashboard/admin') && token.role !== 'ADMIN') {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard/admin/:path*',
    '/clients/:path*',
    '/products/:path*',
    '/invoices/:path*',
    '/profile/:path*',
  ],
};
