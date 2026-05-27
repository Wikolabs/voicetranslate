import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "VoiceTranslate -- Traduction vocale temps reel 40+ langues",
  description: "ASR + traduction neurale + TTS -- traduction vocale en direct avec moins de 500ms de latence, qualite broadcast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={${spaceGrotesk.variable} ${inter.variable}}>
      <body style={{ fontFamily: "var(--font-body)", background: "#f5f3ff" }}>{children}</body>
    </html>
  );
}