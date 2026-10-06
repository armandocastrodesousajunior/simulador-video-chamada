import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchWebhook } from "@/lib/webhook";
import { recordHeartbeat, removeHeartbeat } from "@/lib/callPresence";

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
        template: (call.callCenter as any).template || "DEFAULT",
        enableAudioEcho: (call.callCenter as any).enableAudioEcho ?? false,
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

async function handleStatusUpdate(token: string, body: any) {
  const { status, payload, watchTime, mediaDuration } = body;

  const currentCall = await prisma.call.findUnique({ 
    where: { token },
    include: { callCenter: { include: { media: true } } }
  });
  if (!currentCall) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Se a chamada já foi finalizada como COMPLETED, não sobrescreve com ABANDONED ou STARTED
  if (currentCall.status === "COMPLETED" && (status === "ABANDONED" || status === "STARTED")) {
    return NextResponse.json({ success: true, message: "Call already completed" });
  }

  // Se já está ABANDONED e recebe outro ABANDONED, apenas ajusta watchTime se for maior
  if (currentCall.status === "ABANDONED" && status === "ABANDONED") {
    if (typeof watchTime === "number" && watchTime > currentCall.watchTime) {
      await prisma.call.update({
        where: { token },
        data: { watchTime: Math.round(watchTime) }
      });
    }
    return NextResponse.json({ success: true });
  }

  const updateData: any = { status };
  if (status === "STARTED" && !currentCall.startedAt) updateData.startedAt = new Date();
  if (status === "COMPLETED" || status === "ABANDONED" || status === "REJECTED") {
    if (!currentCall.endedAt) updateData.endedAt = new Date();
    removeHeartbeat(currentCall.id);
  }
  if (status === "STARTED") {
    recordHeartbeat(currentCall.id, token, typeof watchTime === "number" ? watchTime : 0);
  }

  if (typeof watchTime === "number") {
    updateData.watchTime = Math.max(currentCall.watchTime, Math.round(watchTime));
  }

  const updatedCall = await prisma.call.update({
    where: { token },
    data: updateData
  });

  // Determina nome do evento para webhook
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
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    return await handleStatusUpdate(token, body);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Suporte para POST (usado por navigator.sendBeacon e keepalive no descarregamento da página)
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      try {
        const text = await req.text();
        if (text) body = JSON.parse(text);
      } catch (err) {}
    }
    return await handleStatusUpdate(token, body);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
