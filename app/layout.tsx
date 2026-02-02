import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  weight: ['500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "JARVIS // OPENCLAW DASHBOARD",
  description: "Advanced Neural Interface & Task Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.variable} ${jetbrainsMono.variable} font-sans bg-[#050505] text-[#e5e5e5] antialiased selection:bg-cyan-900 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
