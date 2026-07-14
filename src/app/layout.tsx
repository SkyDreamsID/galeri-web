import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontHeading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Galeri - Portfolio Fotografi",
  description: "Kumpulan momen dan cerita di balik lensa.",
  openGraph: {
    title: "Galeri - Portfolio Fotografi",
    description: "Kumpulan momen dan cerita di balik lensa.",
    type: "website",
    locale: "id_ID",
    siteName: "Galeri Rifki",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galeri - Portfolio Fotografi",
    description: "Kumpulan momen dan cerita di balik lensa.",
  }
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { GalleryRadio } from "@/components/public/GalleryRadio";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-text-main transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Global Floating Radio */}
          <GalleryRadio />
        </ThemeProvider>
      </body>
    </html>
  );
}
