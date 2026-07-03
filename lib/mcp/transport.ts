import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

export class WebStreamTransport implements Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  private controller?: ReadableStreamDefaultController;
  public readonly stream: ReadableStream;
  public readonly sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      cancel: () => {
        this.onclose?.();
      }
    });
  }

  async start() {
    // The spec requires sending an endpoint event first
    if (this.controller) {
      const endpoint = `/mcp?sessionId=${this.sessionId}`;
      this.controller.enqueue(new TextEncoder().encode(`event: endpoint\ndata: ${endpoint}\n\n`));
    }
  }

  async close() {
    this.controller?.close();
    this.onclose?.();
  }

  async send(message: JSONRPCMessage) {
    if (this.controller) {
      const data = `event: message\ndata: ${JSON.stringify(message)}\n\n`;
      this.controller.enqueue(new TextEncoder().encode(data));
    }
  }

  async handleMessage(message: JSONRPCMessage) {
    if (this.onmessage) {
      this.onmessage(message);
    }
  }
}

// Global store for active transports
const globalTransports = new Map<string, WebStreamTransport>();

export function getTransport(sessionId: string) {
  return globalTransports.get(sessionId);
}

export function createTransport(sessionId: string) {
  const transport = new WebStreamTransport(sessionId);
  globalTransports.set(sessionId, transport);
  
  // Cleanup on close
  transport.onclose = () => {
    globalTransports.delete(sessionId);
  };
  
  return transport;
}
