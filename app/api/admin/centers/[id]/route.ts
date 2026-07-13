import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, displayName, avatar, webhookUrl, mediaId, enforceUniqueExternalId, allowRetryIfNotCompleted, pixelId, pixelEvents, requireEndCallConfirmation, tikTokPixelId, tikTokEvents, googlePixelId, googleEvents } = body;

    const center = await prisma.callCenter.update({
      where: { id },
      data: {
        name,
        displayName,
        avatar: avatar || null,
        webhookUrl: webhookUrl || null,
        mediaId,
        enforceUniqueExternalId: enforceUniqueExternalId || false,
        allowRetryIfNotCompleted: allowRetryIfNotCompleted || false,
        requireEndCallConfirmation: requireEndCallConfirmation !== undefined ? requireEndCallConfirmation : true,
        pixelId: pixelId || null,
        pixelEvents: pixelEvents || null,
        tikTokPixelId: tikTokPixelId || null,
        tikTokEvents: tikTokEvents || null,
        googlePixelId: googlePixelId || null,
        googleEvents: googleEvents || null
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
    
    // Deleta os eventos das chamadas associadas a essa central
    const calls = await prisma.call.findMany({ where: { callCenterId: id } });
    const callIds = calls.map(c => c.id);
    
    if (callIds.length > 0) {
      await prisma.callEvent.deleteMany({ where: { callId: { in: callIds } } });
      await prisma.call.deleteMany({ where: { callCenterId: id } });
    }
    
    // Finalmente, deleta a central
    await prisma.callCenter.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar central:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
