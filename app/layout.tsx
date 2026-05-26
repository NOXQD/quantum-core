import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/providers/LenisProvider";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "КВАНТОВОЕ ЯДРО — Lumina Quantum",
  description:
    "Иммерсивный взгляд внутрь квантовой машины следующего поколения. Кубиты, запутанность, суперпозиция — оживают в кинематографичном 3D.",
  keywords: [
    "квантовый компьютер",
    "квантовое ядро",
    "Lumina Quantum",
    "qubits",
    "WebGPU",
    "three.js",
  ],
  openGraph: {
    title: "КВАНТОВОЕ ЯДРО",
    description: "Войди внутрь машины, что считает реальность.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#03020a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="cinematic-grain">
        {/*
          LenisProvider drives a smooth virtual scroll and syncs RAF with
          GSAP's ticker so ScrollTrigger updates on the same frame.
        */}
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
