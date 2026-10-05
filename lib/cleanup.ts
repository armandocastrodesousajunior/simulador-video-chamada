import { prisma } from "./prisma";

export interface CleanupResult {
  success: boolean;
  expirationDays: number;
  cutoffDate: Date;
  deletedEvents: number;
  deletedCalls: number;
  error?: string;
}

/**
 * Obtém a quantidade de dias para expiração de logs a partir do .env.
 * Fallback padrão: 7 dias se não estiver definido ou for inválido.
 */
export function getLogExpirationDays(): number {
  const envVal = process.env.LOG_EXPIRATION_DAYS || process.env.LOGS_EXPIRATION_DAYS;
  if (!envVal) return 7;
  
  const parsed = parseInt(envVal, 10);
  if (isNaN(parsed) || parsed <= 0) return 7;
  
  return parsed;
}

/**
 * Executa a eliminação de registros de eventos e chamadas antigas com base na validade.
 */
export async function cleanExpiredLogs(): Promise<CleanupResult> {
  const days = getLogExpirationDays();
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    // 1. Elimina os eventos de chamadas (CallEvent) criados antes da data de corte
    const eventResult = await prisma.callEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // 2. Localiza chamadas finalizadas/estagnadas anteriores à data de corte
    const oldCalls = await prisma.call.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: { id: true },
    });

    let deletedCalls = 0;
    if (oldCalls.length > 0) {
      const callIds = oldCalls.map(c => c.id);
      
      // Garante remoção de eventos dessas chamadas caso reste algum
      await prisma.callEvent.deleteMany({
        where: {
          callId: { in: callIds },
        },
      });

      const callResult = await prisma.call.deleteMany({
        where: {
          id: { in: callIds },
        },
      });
      deletedCalls = callResult.count;
    }

    return {
      success: true,
      expirationDays: days,
      cutoffDate,
      deletedEvents: eventResult.count,
      deletedCalls,
    };
  } catch (error: any) {
    console.error("[Cleanup] Erro ao limpar logs expirados:", error);
    return {
      success: false,
      expirationDays: days,
      cutoffDate,
      deletedEvents: 0,
      deletedCalls: 0,
      error: error?.message || "Erro desconhecido",
    };
  }
}

// Controle em memória para acelerador de execução throttled (a cada 6 horas)
let lastCleanupTimestamp = 0;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function runThrottledCleanup(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupTimestamp < SIX_HOURS_MS) {
    return;
  }

  lastCleanupTimestamp = now;
  // Dispara assincronamente em background sem travar a requisição
  cleanExpiredLogs()
    .then(res => {
      if (res.deletedEvents > 0 || res.deletedCalls > 0) {
        console.log(`[Auto-Cleanup] Logs expirados limpos: ${res.deletedEvents} eventos e ${res.deletedCalls} chamadas removidas.`);
      }
    })
    .catch(err => {
      console.error("[Auto-Cleanup] Falha na limpeza em background:", err);
    });
}
