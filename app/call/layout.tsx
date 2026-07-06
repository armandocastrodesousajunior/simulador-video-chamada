import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chamada de vídeo",
  description: "Você foi convidado(a) para participar de uma Chamada do Telegram.",
  openGraph: {
    title: "Chamada de vídeo",
    description: "Você foi convidado(a) para participar de uma Chamada do Telegram.",
    siteName: "Telegram",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chamada de vídeo",
    description: "Você foi convidado(a) para participar de uma Chamada do Telegram.",
  }
};

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
