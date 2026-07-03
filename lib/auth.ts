import { NextRequest } from "next/server";

export function getAdminToken() {
  return process.env.ADMIN_TOKEN;
}

export function validateApiAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;
  
  const token = authHeader.replace("Bearer ", "").trim();
  const validToken = getAdminToken();
  
  return token === validToken && validToken !== undefined && validToken !== "";
}
