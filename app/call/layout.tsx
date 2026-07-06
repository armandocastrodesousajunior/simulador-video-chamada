import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link da Chamada",
  description: "Você foi convidado(a) para participar de uma Chamada do Telegram.",
  openGraph: {
    title: "Link da Chamada",
    description: "Você foi convidado(a) para participar de uma Chamada do Telegram.",
    siteName: "Telegram",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link da Chamada",
    description: "Você foi convidado(a) para participar de uma Chamada do Telegram.",
  }
};

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
