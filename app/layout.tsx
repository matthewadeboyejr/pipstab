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
  alternates: {
    canonical: "/",
  },
  title: {
    default: "PipTab — Cognitive Trading OS & Institutional Journal",
    template: "%s | PipTab"
  },
  description: "The institutional operating system for disciplined traders. Track multi-timeframe setups, run Gemini AI performance audits, monitor central bank macro policies, and eliminate trading tilt.",
  keywords: [
    "trading journal",
    "forex trading journal",
    "crypto trading journal",
    "prop firm journal",
    "forex position size calculator",
    "forex lot size calculator",
    "pip value calculator",
    "forex margin calculator",
    "live economic calendar",
    "institutional economic calendar",
    "forex calendar today",
    "trading psychology",
    "AI trading auditor",
    "top-down market outlook",
    "institutional strategy dossier",
    "macro economic calendar",
    "central bank policy matrix",
    "Deriv trading journal",
    "FTMO trade analytics",
    "risk reward calculator",
    "alpha leakage detection"
  ],
  authors: [{ name: "PipTab Team", url: "https://pipstab.com" }],
  creator: "PipTab Analytics",
  publisher: "PipTab",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pipstab.com",
    siteName: "PipTab Analytics",
    title: "PipTab — Cognitive Trading OS & Institutional Journal",
    description: "The institutional operating system for disciplined traders. Track multi-timeframe setups, run Gemini AI performance audits, and master your trading edge.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PipTab — Cognitive Trading OS & Institutional Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PipTab — Cognitive Trading OS & Institutional Journal",
    description: "The institutional operating system for disciplined traders. Track performance, analyze setups, and master your trading edge.",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('piptab-theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "PipTab",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web, iOS, Android",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Cognitive operating system and institutional trading journal for forex, crypto, and futures traders.",
              "url": "https://pipstab.com",
              "publisher": {
                "@type": "Organization",
                "name": "PipTab Analytics",
                "url": "https://pipstab.com"
              }
            }),
          }}
        />
      </head>
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

