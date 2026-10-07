import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateApiAuth, getAccessToken } from '@/lib/auth'

export default function proxy(request: NextRequest) {
  const adminToken = getAccessToken();
  const isAuthorized = validateApiAuth(request);

  // Protege rotas do painel /admin (Interface web)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthorized || !adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protege rotas de API /api/admin (Endpoints autenticados por API Key)
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!isAuthorized || !adminToken) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        message: "API Key inválida ou ausente. Forneça o header 'x-api-key' ou 'Authorization: Bearer [ACCESS_TOKEN]'." 
      }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
