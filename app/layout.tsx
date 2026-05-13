import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AccountProvider } from "@/context/AccountContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pipstab.com"),
  title: {
    default: "PipTab — Cognitive Trading OS",
    template: "%s | PipTab"
  },
  description: "Stop gambling, start journaling. The cognitive operating system for disciplined traders. Track performance, analyze setups, and master your trading psychology.",
  keywords: ["trading journal", "forex trading", "trading psychology", "crypto journal", "trading performance", "cognitive trading", "trading log"],
  authors: [{ name: "PipTab Team" }],
  creator: "PipTab",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pipstab.com",
    siteName: "PipTab",
    title: "PipTab — Cognitive Trading OS",
    description: "The cognitive operating system for disciplined traders. Stop gambling, start journaling.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PipTab — Cognitive Trading OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PipTab — Cognitive Trading OS",
    description: "The cognitive operating system for disciplined traders. Stop gambling, start journaling.",
    images: ["/og-image.png"],
    creator: "@pipstab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AccountProvider>
            <ToastProvider>{children}</ToastProvider>
          </AccountProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

