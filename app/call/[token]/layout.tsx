import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  try {
    const call = await prisma.call.findUnique({
      where: { token },
      include: { callCenter: true },
    });

    const template = (call?.callCenter as any)?.template || "DEFAULT";
    const displayName = call?.callCenter?.displayName || "Conexão Segura";

    if (template === "WHATSAPP") {
      return {
        title: "Chamada de vídeo do WhatsApp",
        description: `Chamada de vídeo de ${displayName} no WhatsApp.`,
        openGraph: {
          title: "Chamada de vídeo do WhatsApp",
          description: `Chamada de vídeo de ${displayName} no WhatsApp.`,
          siteName: "WhatsApp",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: "Chamada de vídeo do WhatsApp",
          description: `Chamada de vídeo de ${displayName} no WhatsApp.`,
        },
      };
    }

    if (template === "TELEGRAM") {
      return {
        title: "Chamada de vídeo",
        description: `Você foi convidado(a) para participar de uma chamada no Telegram.`,
        openGraph: {
          title: "Chamada de vídeo",
          description: `Você foi convidado(a) para participar de uma chamada no Telegram.`,
          siteName: "Telegram",
          type: "website",
        },
        twitter: {
          card: "summary",
          title: "Chamada de vídeo",
          description: `Você foi convidado(a) para participar de uma chamada no Telegram.`,
        },
      };
    }

    // DEFAULT (App Independente)
    return {
      title: "Chamada de Vídeo Conectada",
      description: `${displayName} está iniciando uma videochamada ao vivo com você.`,
      openGraph: {
        title: "Chamada de Vídeo Conectada",
        description: `${displayName} está iniciando uma videochamada ao vivo com você.`,
        siteName: "Live Call",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Chamada de Vídeo Conectada",
        description: `${displayName} está iniciando uma videochamada ao vivo com você.`,
      },
    };
  } catch (error) {
    return {
      title: "Chamada de Vídeo",
      description: "Acesse sua sala de videochamada.",
    };
  }
}

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
