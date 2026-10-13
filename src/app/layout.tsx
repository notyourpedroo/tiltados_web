import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const titillium = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Tiltados F1",
    template: "%s · Tiltados F1",
  },
  description:
    "Resultados, classificações e estatísticas da liga Tiltados de F1 virtual.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // O script de tema altera data-theme no <html> antes da hidratação.
    <html
      lang="pt-BR"
      className={`${titillium.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica o tema salvo antes da primeira pintura. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
