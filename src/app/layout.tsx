import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/app-context";
import { ToastContainer } from "@/components/utility-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eliya Tours And Travels — Discover Kashmir",
  description:
    "Eliya Tours And Travels crafts bespoke Kashmir & Ladakh journeys — from Dal Lake houseboats to Gulmarg ski expeditions, alpine meadows, Mughal gardens, Leh, Kargil and Pangong. Curated by locals since 2009.",
  keywords: [
    "Kashmir tours",
    "Srinagar houseboats",
    "Gulmarg skiing",
    "Pahalgam trekking",
    "Sonmarg",
    "Leh Ladakh",
    "Pangong Lake",
    "Kargil",
    "Zanskar",
    "Eliya Tours",
    "Kashmir travel agency",
  ],
  authors: [{ name: "Eliya Tours And Travels" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Eliya Tours",
  },
  openGraph: {
    title: "Eliya Tours And Travels — Discover Kashmir",
    description:
      "Bespoke Kashmir & Ladakh journeys curated by locals. Houseboats, alpine meadows, Mughal gardens, ski expeditions and more.",
    siteName: "Eliya Tours And Travels",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eliya Tours And Travels — Discover Kashmir",
    description: "Bespoke Kashmir & Ladakh journeys curated by locals.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppProvider>
          {children}
          <Toaster />
          <ToastContainer />
        </AppProvider>
        {/* Service worker registration for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {})
                })
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
