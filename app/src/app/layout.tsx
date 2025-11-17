import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StateSyncer from '@/components/StateSyncer';
import DarkModeInitializer from '@/components/DarkModeInitializer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recepcionista AI",
  description: "Sistema inteligente de recepcionista AI para agendar turnos con voz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
        suppressHydrationWarning={true}
      >
        <DarkModeInitializer />
        <StateSyncer />
        {children}
      </body>
    </html>
  );
}
