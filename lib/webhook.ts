import { prisma } from "./prisma";

export async function dispatchWebhook(callId: string, event: string, payload?: any) {
  try {
    // 1. Record event in DB
    await prisma.callEvent.create({
      data: {
        callId,
        event,
        payload: payload ? JSON.stringify(payload) : null,
      }
    });

    // 2. Fetch call & callCenter to get webhook URL
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { callCenter: true }
    });

    if (!call || !call.callCenter.webhookUrl) return;

    // 3. Dispatch to external webhook URL without blocking
    fetch(call.callCenter.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callId: call.id,
        externalId: call.externalId,
        event,
        payload,
        timestamp: new Date().toISOString()
      })
    }).catch(e => console.error("Webhook fetch failed silently:", e.message));
  } catch (error) {
    console.error(`Failed to dispatch webhook or record event:`, error);
  }
}
