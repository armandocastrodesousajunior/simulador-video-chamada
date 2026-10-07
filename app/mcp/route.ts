import { NextRequest, NextResponse } from "next/server";
import { mcpServer } from "@/lib/mcp/server";
import { createTransport, getTransport } from "@/lib/mcp/transport";
import { prisma } from "@/lib/prisma";
import { validateApiAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Check settings
  let settings = await prisma.mcpSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.mcpSettings.create({ data: { id: "singleton" } });
  }

  if (!settings.enabled) {
    return NextResponse.json({ error: "MCP Server is currently disabled." }, { status: 403 });
  }

  // Auth check if enabled
  if (settings.requireAuth) {
    if (!validateApiAuth(req)) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        message: "API Key inválida ou ausente. Forneça o header 'x-api-key' ou 'Authorization: Bearer [ACCESS_TOKEN]'." 
      }, { status: 401 });
    }
  }

  const sessionId = crypto.randomUUID();
  const transport = createTransport(sessionId);
  
  await mcpServer.connect(transport);
  await transport.start(); // Sends the 'endpoint' SSE event

  return new NextResponse(transport.stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  // Since POST happens after GET, we must lookup the session
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
  }

  const transport = getTransport(sessionId);
  if (!transport) {
    return NextResponse.json({ error: "Session not found or expired" }, { status: 404 });
  }

  try {
    const message = await req.json();
    await transport.handleMessage(message);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process message" }, { status: 500 });
  }
}
