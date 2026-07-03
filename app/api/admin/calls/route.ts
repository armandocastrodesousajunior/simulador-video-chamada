import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchWebhook } from "@/lib/webhook";

export async function GET() {
  try {
    const calls = await prisma.call.findMany({
      include: {
        callCenter: {
          select: { 
            name: true,
            media: {
              select: { duration: true }
            }
          }
        },
        Events: true
      },
      orderBy: { createdAt: 'desc' }
    });
    const enrichedCalls = calls.map(c => {
      let watchPercentage = 0;
      const mediaDuration = c.callCenter?.media?.duration;
      if (typeof c.watchTime === "number" && mediaDuration && mediaDuration > 0) {
        watchPercentage = Math.min(100, Math.round((c.watchTime / mediaDuration) * 100));
      }
      return { ...c, watchPercentage };
    });
    return NextResponse.json(enrichedCalls);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    dispatchWebhook(call.id, "call.created");

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
