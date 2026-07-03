import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { prisma } from "@/lib/prisma";

export const mcpServer = new Server({
  name: "luna-video-calls",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  // Fetch settings dynamically to see which tools are enabled
  const settings = await prisma.mcpSettings.findUnique({ where: { id: "singleton" } });
  
  const tools = [];
  
  if (!settings || settings.toolCreateCall) {
    tools.push({
      name: "create_call",
      description: "Cria uma nova videochamada (link simulado) para um lead em uma central específica.",
      inputSchema: {
        type: "object",
        properties: {
          callCenterId: { type: "string", description: "ID da central de chamadas" },
          externalId: { type: "string", description: "ID do lead no CRM (opcional, para evitar duplicatas)" }
        },
        required: ["callCenterId"]
      }
    });
  }
  
  if (!settings || settings.toolGetCall) {
    tools.push({
      name: "get_call",
      description: "Consulta as informações e o status atual de uma videochamada específica pelo seu token.",
      inputSchema: {
        type: "object",
        properties: {
          token: { type: "string", description: "O token único gerado para a videochamada" }
        },
        required: ["token"]
      }
    });
  }

  if (!settings || settings.toolListExternal) {
    tools.push({
      name: "list_external_calls",
      description: "Lista todo o histórico de videochamadas geradas para um ID externo (lead) específico.",
      inputSchema: {
        type: "object",
        properties: {
          externalId: { type: "string", description: "ID do lead no CRM" }
        },
        required: ["externalId"]
      }
    });
  }

  return { tools };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const settings = await prisma.mcpSettings.findUnique({ where: { id: "singleton" } });

  if (request.params.name === "create_call" && (!settings || settings.toolCreateCall)) {
    const { callCenterId, externalId } = request.params.arguments as any;
    
    // Validate call center
    const callCenter = await prisma.callCenter.findUnique({ where: { id: callCenterId } });
    if (!callCenter) throw new Error("Central não encontrada");

    // Logic repeated from API
    if (callCenter.enforceUniqueExternalId && externalId) {
      const existingCall = await prisma.call.findFirst({
        where: { callCenterId, externalId },
        orderBy: { createdAt: 'desc' }
      });

      if (existingCall) {
        if (callCenter.allowRetryIfNotCompleted) {
          if (existingCall.status !== 'REJECTED' && existingCall.status !== 'EXPIRED') {
            throw new Error(`Não foi possível criar uma videochamada, pois já foi criado uma videochamada com esse ID onde ela está com o status ${existingCall.status}`);
          }
        } else {
          throw new Error(`Não foi possível criar uma videochamada, pois já foi criado uma videochamada com esse ID onde ela está com o status ${existingCall.status}`);
        }
      }
    }

    const call = await prisma.call.create({
      data: {
        callCenterId,
        externalId: externalId || null,
        status: "CREATED"
      }
    });
    
    // Simulate webhook dispatch by importing dynamically to avoid circular deps if any
    const { dispatchWebhook } = await import("@/lib/webhook");
    dispatchWebhook(call.id, "call.created");

    return { content: [{ type: "text", text: JSON.stringify(call, null, 2) }] };
  }

  if (request.params.name === "get_call" && (!settings || settings.toolGetCall)) {
    const { token } = request.params.arguments as any;
    const call = await prisma.call.findUnique({
      where: { token },
      include: {
        callCenter: { include: { media: true } }
      }
    });
    
    if (!call) throw new Error("Chamada não encontrada");
    
    let watchPercentage = 0;
    const duration = call.callCenter.media.duration;
    if (typeof call.watchTime === 'number' && duration && duration > 0) {
      watchPercentage = Math.min(100, Math.round((call.watchTime / duration) * 100));
    }
    
    return { content: [{ type: "text", text: JSON.stringify({ ...call, watchPercentage }, null, 2) }] };
  }

  if (request.params.name === "list_external_calls" && (!settings || settings.toolListExternal)) {
    const { externalId } = request.params.arguments as any;
    const calls = await prisma.call.findMany({
      where: { externalId },
      include: {
        callCenter: { include: { media: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const enriched = calls.map(call => {
      let watchPercentage = 0;
      const duration = call.callCenter?.media?.duration;
      if (typeof call.watchTime === 'number' && duration && duration > 0) {
        watchPercentage = Math.min(100, Math.round((call.watchTime / duration) * 100));
      }
      return { ...call, watchPercentage };
    });

    return { content: [{ type: "text", text: JSON.stringify(enriched, null, 2) }] };
  }

  throw new Error("Tool not found or disabled in settings.");
});
