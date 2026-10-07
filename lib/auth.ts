import { NextRequest } from "next/server";

/**
 * Obtém o Access Token / API Key definido no .env
 * Suporta ACCESS_TOKEN (recomendado) ou ADMIN_TOKEN (compatibilidade).
 */
export function getAccessToken(): string | undefined {
  return process.env.ACCESS_TOKEN || process.env.ADMIN_TOKEN;
}

export function getAdminToken(): string | undefined {
  return getAccessToken();
}

/**
 * Valida autenticação via API Key / Access Token definido no .env
 * Formas aceitas:
 * 1. Header 'x-api-key' ou 'api-key' (Padrão de API Key)
 * 2. Header 'Authorization' (Bearer <TOKEN> ou ApiKey <TOKEN> ou <TOKEN>)
 * 3. Query param '?apiKey=<TOKEN>', '?api_key=<TOKEN>' ou '?access_token=<TOKEN>'
 * 4. Cookie de sessão 'admin_token' (usado pelo painel administrativo web)
 */
export function validateApiAuth(req: NextRequest): boolean {
  const validToken = getAccessToken();
  if (!validToken || validToken.trim() === "") return false;

  const expectedToken = validToken.trim();

  // 1. Header x-api-key ou api-key
  const xApiKey = req.headers.get("x-api-key") || req.headers.get("api-key");
  if (xApiKey && xApiKey.trim() === expectedToken) {
    return true;
  }

  // 2. Header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^(Bearer|ApiKey)\s+/i, "").trim();
    if (token === expectedToken) {
      return true;
    }
  }

  // 3. Query params
  const queryToken = req.nextUrl.searchParams.get("apiKey") ||
                     req.nextUrl.searchParams.get("api_key") ||
                     req.nextUrl.searchParams.get("access_token");
  if (queryToken && queryToken.trim() === expectedToken) {
    return true;
  }

  // 4. Cookie de sessão admin (navegação no painel)
  const cookieToken = req.cookies.get("admin_token")?.value;
  if (cookieToken && cookieToken.trim() === expectedToken) {
    return true;
  }

  return false;
}
