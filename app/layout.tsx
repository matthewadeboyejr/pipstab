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
        {/* Structured Data: WebSite, Organization & SiteNavigationElement for Google Sitelinks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "PipTab",
                "alternateName": ["PIPSTAB", "PipTab Analytics", "PipTab Trading OS"],
                "url": "https://pipstab.com",
                "description": "The cognitive operating system and institutional journal for disciplined traders."
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "PipTab Analytics",
                "url": "https://pipstab.com",
                "logo": "https://pipstab.com/og-image.png",
                "sameAs": [
                  "https://t.me/pipstab",
                  "https://twitter.com/pipstab"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": [
                  {
                    "@type": "SiteNavigationElement",
                    "position": 1,
                    "name": "Forex & Position Size Calculator",
                    "description": "Calculate exact lot sizes, pip values, margin requirements, and risk-reward targets.",
                    "url": "https://pipstab.com/calculator"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 2,
                    "name": "Live Economic Calendar",
                    "description": "Real-time macroeconomic releases, consensus forecasts, and algorithmic deviation playbooks.",
                    "url": "https://pipstab.com/calendar"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 3,
                    "name": "Early Access Beta",
                    "description": "Join the inner circle and be the first to experience the PipTab cognitive trading journal.",
                    "url": "https://pipstab.com/early-access"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 4,
                    "name": "Top-Down Market Outlooks",
                    "description": "Institutional strategy dossiers, multi-timeframe bias, and market structure analysis.",
                    "url": "https://pipstab.com/outlooks"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 5,
                    "name": "Trader Sign In",
                    "description": "Access your PipTab performance dashboard, journal entries, and AI diagnostics.",
                    "url": "https://pipstab.com/auth/sign-in"
                  }
                ]
              },
              {
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
              }
            ]),
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

