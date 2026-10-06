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
        icons: {
          icon: [
            { url: "/favicons/whatsapp.svg", type: "image/svg+xml" },
          ],
          shortcut: "/favicons/whatsapp.svg",
          apple: "/favicons/whatsapp.svg",
        },
        openGraph: {
          title: "Chamada de vídeo do WhatsApp",
          description: `Chamada de vídeo de ${displayName} no WhatsApp.`,
          siteName: "WhatsApp",
          type: "website",
          images: [{ url: "/favicons/whatsapp.svg", width: 512, height: 512, alt: "WhatsApp" }],
        },
        twitter: {
          card: "summary",
          title: "Chamada de vídeo do WhatsApp",
          description: `Chamada de vídeo de ${displayName} no WhatsApp.`,
          images: ["/favicons/whatsapp.svg"],
        },
      };
    }

    if (template === "TELEGRAM") {
      return {
        title: "Chamada de vídeo",
        description: `Você foi convidado(a) para participar de uma chamada no Telegram.`,
        icons: {
          icon: [
            { url: "/favicons/telegram.svg", type: "image/svg+xml" },
          ],
          shortcut: "/favicons/telegram.svg",
          apple: "/favicons/telegram.svg",
        },
        openGraph: {
          title: "Chamada de vídeo",
          description: `Você foi convidado(a) para participar de uma chamada no Telegram.`,
          siteName: "Telegram",
          type: "website",
          images: [{ url: "/favicons/telegram.svg", width: 512, height: 512, alt: "Telegram" }],
        },
        twitter: {
          card: "summary",
          title: "Chamada de vídeo",
          description: `Você foi convidado(a) para participar de uma chamada no Telegram.`,
          images: ["/favicons/telegram.svg"],
        },
      };
    }

    // DEFAULT (App Independente)
    return {
      title: "Chamada de Vídeo Conectada",
      description: `${displayName} está iniciando uma videochamada ao vivo com você.`,
      icons: {
        icon: [
          { url: "/favicons/default.svg", type: "image/svg+xml" },
        ],
        shortcut: "/favicons/default.svg",
        apple: "/favicons/default.svg",
      },
      openGraph: {
        title: "Chamada de Vídeo Conectada",
        description: `${displayName} está iniciando uma videochamada ao vivo com você.`,
        siteName: "Live Call",
        type: "website",
        images: [{ url: "/favicons/default.svg", width: 512, height: 512, alt: "Live Call" }],
      },
      twitter: {
        card: "summary",
        title: "Chamada de Vídeo Conectada",
        description: `${displayName} está iniciando uma videochamada ao vivo com você.`,
        images: ["/favicons/default.svg"],
      },
    };
  } catch (error) {
    return {
      title: "Chamada de Vídeo",
      description: "Acesse sua sala de videochamada.",
      icons: {
        icon: "/favicons/default.svg",
        apple: "/favicons/default.svg",
      },
    };
  }
}

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
