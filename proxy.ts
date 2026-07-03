import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  
  // 1. Extrai o token do cookie (para o front-end do Admin acessar a API sem enviar Bearer)
  const cookieAuth = request.cookies.get('admin_token')?.value;

  // 2. Extrai o token do Header Authorization (para integrações de fora, Webhooks, Postman)
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Está autenticado se o token bater com o do .env (seja via Cookie ou via Bearer)
  const isAuthorized = (cookieAuth === adminToken) || (bearerToken === adminToken);

  // Protect /admin routes (front-end panel)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthorized || !adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /api/admin routes (API Endpoints)
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!isAuthorized || !adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
