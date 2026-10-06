import { prisma } from "./prisma";
import { dispatchWebhook } from "./webhook";

interface HeartbeatEntry {
  token: string;
  lastPing: number;
  watchTime: number;
}

// Global store to persist active heartbeats across Next.js reloads/requests
const g = globalThis as unknown as {
  __activeCallHeartbeats?: Map<string, HeartbeatEntry>;
  __callWatchdogTimer?: NodeJS.Timeout;
};

if (!g.__activeCallHeartbeats) {
  g.__activeCallHeartbeats = new Map<string, HeartbeatEntry>();
}

export const activeCalls = g.__activeCallHeartbeats;

export function recordHeartbeat(callId: string, token: string, watchTime: number) {
  activeCalls.set(callId, {
    token,
    lastPing: Date.now(),
    watchTime,
  });
}

export function removeHeartbeat(callId: string) {
  activeCalls.delete(callId);
}

/**
 * Reconcilia quaisquer chamadas presas no status 'STARTED' que pararam de enviar heartbeats.
 * Tolerância de inatividade: 15 segundos.
 */
export async function reconcileStaleCalls(): Promise<number> {
  try {
    const now = Date.now();
    const TIMEOUT_MS = 15000; // 15 segundos sem ping

    const startedCalls = await prisma.call.findMany({
      where: { status: "STARTED" },
      include: {
        callCenter: {
          include: { media: true }
        }
      }
    });

    if (startedCalls.length === 0) return 0;

    let reconciledCount = 0;

    for (const call of startedCalls) {
      const heartbeat = activeCalls.get(call.id);
      let isStale = false;
      let finalWatchTime = call.watchTime;

      if (heartbeat) {
        if (now - heartbeat.lastPing > TIMEOUT_MS) {
          isStale = true;
          finalWatchTime = Math.max(call.watchTime, heartbeat.watchTime);
        }
      } else {
        // Sem ping em memória (ex: servidor reiniciou ou fechamento imediato)
        const startTime = call.startedAt ? call.startedAt.getTime() : call.createdAt.getTime();
        const elapsedSec = (now - startTime) / 1000;

        // Se o tempo decorrido desde o início for maior que o tempo assistido + 20 segundos
        if (elapsedSec > (call.watchTime + 20)) {
          isStale = true;
        }
      }

      if (isStale) {
        activeCalls.delete(call.id);
        reconciledCount++;

        const mediaDuration = call.callCenter?.media?.duration || 0;
        let watchPercentage = 0;
        if (mediaDuration > 0 && finalWatchTime > 0) {
          watchPercentage = Math.min(100, Math.round((finalWatchTime / mediaDuration) * 100));
        }

        await prisma.call.update({
          where: { id: call.id },
          data: {
            status: "ABANDONED",
            endedAt: new Date(),
            watchTime: finalWatchTime,
          }
        });

        dispatchWebhook(call.id, "call.abandoned", {
          watchTime: finalWatchTime,
          watchPercentage,
          reason: "inactivity_timeout"
        });
      }
    }

    return reconciledCount;
  } catch (error) {
    console.error("Erro ao reconciliar chamadas estagnadas:", error);
    return 0;
  }
}

// Watchdog periódico em background (a cada 15 segundos)
if (!g.__callWatchdogTimer) {
  g.__callWatchdogTimer = setInterval(() => {
    reconcileStaleCalls().catch(() => {});
  }, 15000);
  if (g.__callWatchdogTimer.unref) {
    g.__callWatchdogTimer.unref();
  }
}
