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
        {/* Script inline para aplicar dark mode antes del primer render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('dark-mode-storage');
                  if (savedTheme) {
                    const parsed = JSON.parse(savedTheme);
                    const shouldBeDark = parsed.state?.isDarkMode || false;
                    if (shouldBeDark) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }
                } catch (e) {
                  console.error('Error applying dark mode:', e);
                }
              })();
            `,
          }}
        />
        <DarkModeInitializer />
        <StateSyncer />
        {children}
      </body>
    </html>
  );
}
