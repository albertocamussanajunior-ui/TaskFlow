import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { ThemeProvider } from "@/lib/theme";
import { AppProvider } from "@/lib/store";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"], 
  variable: "--font-outfit"
});

export const metadata: Metadata = {
  title: "Cybercore - Sistema de Gestão de Projectos",
  description: "Desenvolvido por Mozcyber Community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={outfit.variable}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className={`min-h-screen font-sans ${outfit.className}`} suppressHydrationWarning>
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
