import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  const cookieAuth = request.cookies.get('admin_token')?.value;

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (cookieAuth !== adminToken || !adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /api/admin routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (cookieAuth !== adminToken || !adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
