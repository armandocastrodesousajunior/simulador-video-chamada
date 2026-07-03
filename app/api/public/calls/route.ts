import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiAuth } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhook";

export async function POST(req: NextRequest) {
  if (!validateApiAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { callCenterId, externalId } = body;

    if (!callCenterId) {
      return NextResponse.json({ error: "callCenterId is required" }, { status: 400 });
    }

    const callCenter = await prisma.callCenter.findUnique({
      where: { id: callCenterId }
    });

    if (!callCenter) {
      return NextResponse.json({ error: "Call Center not found" }, { status: 404 });
    }

    const call = await prisma.call.create({
      data: {
        callCenterId,
        externalId: externalId || null,
        status: "CREATED"
      }
    });

    // Fire webhook async
    dispatchWebhook(call.id, "call.created");

    const host = req.headers.get("host") || "localhost:2376";
    const protocol = host.includes("localhost") ? "http" : "https";
    
    return NextResponse.json({
      callId: call.id,
      callToken: call.token,
      url: `${protocol}://${host}/call/${call.token}`
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating call:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
