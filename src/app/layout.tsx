import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import "./globals.css";

/**
 * Fonts oficiais Piantare:
 *
 * - DM Sans (300/400/500) — corpo, labels, botões, inputs. Peso 300
 *   por padrão para sensação calma.
 * - Cormorant Garamond (300/400/500) — headlines e números editoriais.
 *   Usada nos h1/h2/h3 via globals.css.
 */
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Piantare",
  description: "Criar pontes para a longevidade.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved by next-intl from src/i18n/request.ts (cookie + Accept-Language).
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
