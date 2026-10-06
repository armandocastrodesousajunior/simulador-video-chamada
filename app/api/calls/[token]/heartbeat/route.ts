import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordHeartbeat } from "@/lib/callPresence";

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

    const { watchTime, mediaDuration } = body;

    const call = await prisma.call.findUnique({
      where: { token },
      include: {
        callCenter: {
          include: { media: true }
        }
      }
    });

    if (!call) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Se a chamada já foi finalizada (COMPLETED, ABANDONED, REJECTED), não processa como ativa
    if (call.status !== "STARTED") {
      return NextResponse.json({ success: true, status: call.status });
    }

    const currentWatchTime = typeof watchTime === "number" ? Math.max(0, Math.floor(watchTime)) : call.watchTime;

    // Registra presença em memória
    recordHeartbeat(call.id, token, currentWatchTime);

    // Atualiza progresso assistido no banco em tempo real
    if (currentWatchTime > call.watchTime) {
      await prisma.call.update({
        where: { id: call.id },
        data: { watchTime: currentWatchTime }
      });
    }

    // Atualiza duração da mídia se necessário
    if (typeof mediaDuration === "number" && mediaDuration > 0 && mediaDuration !== call.callCenter.media.duration) {
      await prisma.media.update({
        where: { id: call.callCenter.media.id },
        data: { duration: mediaDuration }
      });
    }

    return NextResponse.json({ success: true, status: "STARTED", watchTime: currentWatchTime });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
