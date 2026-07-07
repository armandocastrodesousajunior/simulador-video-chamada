import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const centers = await prisma.callCenter.findMany({
      include: { media: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(centers);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, displayName, avatar, webhookUrl, mediaId, enforceUniqueExternalId, allowRetryIfNotCompleted, pixelId, pixelEvents } = body;

    if (!name || !displayName || !mediaId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const center = await prisma.callCenter.create({
      data: {
        name,
        displayName,
        avatar: avatar || null,
        webhookUrl: webhookUrl || null,
        mediaId,
        enforceUniqueExternalId: enforceUniqueExternalId || false,
        allowRetryIfNotCompleted: allowRetryIfNotCompleted || false,
        pixelId: pixelId || null,
        pixelEvents: pixelEvents || null
      }
    });
    return NextResponse.json(center, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
