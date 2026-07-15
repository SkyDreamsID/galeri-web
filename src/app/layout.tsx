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

import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single()
  
  const siteTitle = settings?.site_title || "Galeri - Portfolio Fotografi"
  const siteDesc = settings?.hero_description || "Kumpulan momen dan cerita di balik lensa."
  const siteLogo = settings?.site_logo_url || "/icon.jpg"

  return {
    title: siteTitle,
    description: siteDesc,
    icons: {
      icon: siteLogo,
      apple: siteLogo,
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      type: "website",
      locale: "id_ID",
      siteName: siteTitle,
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
    }
  }
}

import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { GalleryRadio } from "@/components/layout/GalleryRadio";
import { Footer } from "@/components/layout/Footer";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single()

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
          <SiteSettingsProvider settings={settings}>
            {/* Global Navbar */}
            <Navbar 
              authorName={settings?.author_name} 
              siteLogo={settings?.site_logo_url} 
              socialLinks={settings?.social_links} 
            />
            {children}
            {/* Global Footer */}
            <Footer />
            {/* Global Floating Radio */}
            <GalleryRadio />
            {/* Global Toast Notifications */}

          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: 'font-sans',
              },
            }}
          />
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
