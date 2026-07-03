import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, displayName, avatar, webhookUrl, mediaId, enforceUniqueExternalId, allowRetryIfNotCompleted } = body;

    const center = await prisma.callCenter.update({
      where: { id },
      data: {
        name,
        displayName,
        avatar: avatar || null,
        webhookUrl: webhookUrl || null,
        mediaId,
        enforceUniqueExternalId: enforceUniqueExternalId || false,
        allowRetryIfNotCompleted: allowRetryIfNotCompleted || false
      }
    });

    return NextResponse.json(center);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.callCenter.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
