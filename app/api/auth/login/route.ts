import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const validToken = getAdminToken();

    if (token === validToken && validToken) {
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'admin_token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
