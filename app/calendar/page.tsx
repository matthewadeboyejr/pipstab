import { Metadata } from "next";
import PublicNav from "@/components/navigation/PublicNav";
import EconomicCalendar from "@/components/dashboard/fundamentals/EconomicCalendar";
import { Zap, Sparkles, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Live Institutional Economic Calendar & Macro Releases | PipTab",
    description:
        "Real-time institutional economic calendar with algorithmic deviation playbooks, multi-timezone support, consensus forecasts, and historical actual prints for Forex, Gold, and Indices traders.",
    alternates: {
        canonical: "/calendar",
    },
    openGraph: {
        title: "Live Economic Calendar & Macro Releases | PipTab",
        description:
            "Track high-impact global macroeconomic releases, CPI, NFP, interest rate decisions, and algorithmic deviation rules in real-time.",
        url: "https://pipstab.com/calendar",
        siteName: "PipTab Analytics",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Live Institutional Economic Calendar | PipTab",
        description: "Real-time economic releases, deviation reaction matrices, and consensus forecasts.",
    },
};

export default function CalendarPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PipTab Live Institutional Economic Calendar",
        "url": "https://pipstab.com/calendar",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "description": "Real-time global macroeconomic calendar with consensus forecasts, algorithmic deviation reaction playbooks, and multi-timezone session filters.",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Navigation */}
            <div className="pt-0 md:pt-5 max-w-7xl mx-auto px-4">
                <PublicNav />
            </div>

            <main className="relative pt-12 pb-24 px-4 sm:px-6">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(circle_at_center,rgba(var(--accent),0.08),transparent_70%)] pointer-events-none -z-10" />

                <div className="max-w-6xl mx-auto space-y-10">
                    {/* Header Section */}
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono font-bold uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Live Macro Intelligence</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-['Montserrat']">
                            Institutional Economic <br className="hidden sm:inline" />
                            <span className="text-accent">Calendar & Releases.</span>
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Track high-impact macroeconomic events, consensus forecasts, and algorithmic deviation
                            playbooks with multi-session timezone conversion.
                        </p>
                    </div>

                    {/* Interactive Economic Calendar Component */}
                    <div className="rounded-3xl bg-card/60 border border-border/50 p-4 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                        <EconomicCalendar />
                    </div>

                    {/* Conversion Banner: Log news trades into PipTab */}
                    <div className="rounded-3xl bg-gradient-to-r from-accent/15 via-card to-purple-500/10 border border-accent/30 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="space-y-2 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Journal Your Macro Execution</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground font-['Montserrat']">
                                Stop Trading the News Blindly.
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                                Tag news events, track slippage, and review deviation playbooks directly inside your
                                PipTab trading journal.
                            </p>
                        </div>

                        <Link
                            href="/early-access"
                            className="flex items-center gap-2 px-6 py-3.5 bg-accent text-accent-foreground font-bold text-sm rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all font-['Montserrat'] shadow-lg shadow-accent/20 shrink-0"
                        >
                            <span>Get Early Access Free</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer Branding */}
            <footer className="py-12 border-t border-border/40 bg-card/40">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-accent-foreground" />
                        </div>
                        <span className="font-bold tracking-tight text-base font-['Montserrat']">
                            PIPSTAB<span className="text-accent">.</span>
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                        © 2026 PIPSTAB PERFORMANCE TRADING OS
                    </div>
                </div>
            </footer>
        </div>
    );
}
