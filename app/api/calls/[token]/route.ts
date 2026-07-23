import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchWebhook } from "@/lib/webhook";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const call = await prisma.call.findUnique({
      where: { token },
      include: {
        callCenter: {
          include: { media: true }
        }
      }
    });

    if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let watchPercentage = 0;
    const mediaDuration = call.callCenter?.media?.duration;
    if (typeof call.watchTime === "number" && mediaDuration && mediaDuration > 0) {
      watchPercentage = Math.min(100, Math.round((call.watchTime / mediaDuration) * 100));
    }

    return NextResponse.json({
      id: call.id,
      status: call.status,
      watchTime: call.watchTime,
      watchPercentage,
      callCenter: {
        name: call.callCenter.name,
        displayName: call.callCenter.displayName,
        avatar: call.callCenter.avatar,
        requireEndCallConfirmation: call.callCenter.requireEndCallConfirmation,
        pixelId: call.callCenter.pixelId,
        pixelEvents: call.callCenter.pixelEvents,
        tikTokPixelId: call.callCenter.tikTokPixelId,
        tikTokEvents: call.callCenter.tikTokEvents,
        googlePixelId: call.callCenter.googlePixelId,
        googleEvents: call.callCenter.googleEvents,
        kwaiPixelId: call.callCenter.kwaiPixelId,
        kwaiEvents: call.callCenter.kwaiEvents,
      },
      media: {
        url: call.callCenter.media.url,
        type: call.callCenter.media.type,
        duration: mediaDuration,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { status, payload, watchTime, mediaDuration } = body;

    const currentCall = await prisma.call.findUnique({ 
      where: { token },
      include: { callCenter: { include: { media: true } } }
    });
    if (!currentCall) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = { status };
    if (status === "STARTED" && !currentCall.startedAt) updateData.startedAt = new Date();
    if (status === "COMPLETED" || status === "ABANDONED" || status === "REJECTED") {
      if (!currentCall.endedAt) updateData.endedAt = new Date();
    }
    if (typeof watchTime === "number") {
      updateData.watchTime = watchTime;
    }

    const updatedCall = await prisma.call.update({
      where: { token },
      data: updateData
    });

    // Determine event name
    let eventName = "";
    if (status === "ACCESSED") eventName = "call.accessed";
    else if (status === "STARTED") eventName = "call.started";
    else if (status === "COMPLETED") eventName = "call.completed";
    else if (status === "ABANDONED") eventName = "call.abandoned";
    else if (status === "REJECTED") eventName = "call.rejected";

    if (eventName) {
      let watchPercentage = 0;
      let finalWatchTime = updateData.watchTime ?? currentCall.watchTime;
      
      // Se não atendeu, o watchTime deve ser vazio (nulo/0)
      if (status === "REJECTED" || !currentCall.startedAt) {
        finalWatchTime = 0;
      }

      let dbMediaDuration = currentCall.callCenter.media.duration;
      
      // Atualiza a duração no BD se o frontend enviou
      if (typeof mediaDuration === "number" && mediaDuration > 0 && mediaDuration !== dbMediaDuration) {
        dbMediaDuration = mediaDuration;
        await prisma.media.update({
          where: { id: currentCall.callCenter.media.id },
          data: { duration: mediaDuration }
        });
      }

      if (typeof finalWatchTime === "number" && dbMediaDuration && dbMediaDuration > 0) {
        watchPercentage = Math.min(100, Math.round((finalWatchTime / dbMediaDuration) * 100));
      }

      const enrichedPayload = {
        ...(payload || {}),
        watchTime: finalWatchTime,
        watchPercentage
      };

      dispatchWebhook(updatedCall.id, eventName, enrichedPayload);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
