import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.mcpSettings.findUnique({ where: { id: "singleton" } });
    
    if (!settings) {
      settings = await prisma.mcpSettings.create({ data: { id: "singleton" } });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Whitelist only the settings fields
    const data: any = {};
    if (typeof body.enabled === "boolean") data.enabled = body.enabled;
    if (typeof body.requireAuth === "boolean") data.requireAuth = body.requireAuth;
    if (typeof body.toolCreateCall === "boolean") data.toolCreateCall = body.toolCreateCall;
    if (typeof body.toolGetCall === "boolean") data.toolGetCall = body.toolGetCall;
    if (typeof body.toolListExternal === "boolean") data.toolListExternal = body.toolListExternal;

    const settings = await prisma.mcpSettings.update({
      where: { id: "singleton" },
      data
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
