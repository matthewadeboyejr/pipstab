import { Metadata } from "next";
import PublicNav from "@/components/navigation/PublicNav";
import ForexCalculatorSuite from "@/components/calculator/ForexCalculatorSuite";
import { Calculator, Shield, Zap, Target, Scale } from "lucide-react";

export const metadata: Metadata = {
    title: "Institutional Forex Calculator & Position Lot Sizer | PipTab",
    description:
        "Free institutional Forex calculator, position size & lot sizer, pip value, margin requirements, and risk-to-reward ratio simulator for traders.",
    alternates: {
        canonical: "/calculator",
    },
    openGraph: {
        title: "Forex Calculator & Position Lot Sizer | PipTab",
        description: "Accurately calculate lot size, pip value, margin, and risk-reward targets for major, cross, and gold forex pairs.",
        url: "https://pipstab.com/calculator",
        siteName: "PipTab Analytics",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Forex Calculator & Position Lot Sizer | PipTab",
        description: "Accurately calculate lot size, pip value, margin, and risk-reward targets with institutional precision.",
    },
};

export default function CalculatorPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PipTab Forex & Risk Calculator Suite",
        "url": "https://pipstab.com/calculator",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "description": "Calculate exact position sizes, standard lots, pip values, margin requirements, and compounding growth models with institutional precision.",
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

                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header Section */}
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono font-bold uppercase tracking-wider">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Institutional Trading Tools</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-['Montserrat']">
                            Forex & Risk <br className="hidden sm:inline" />
                            <span className="text-accent">Calculator Suite.</span>
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Calculate exact position sizes, pip values, margin requirements, and compounding growth models
                            with institutional precision.
                        </p>
                    </div>

                    {/* Calculator Component */}
                    <ForexCalculatorSuite />

                    {/* Educational / FAQ Guide Section */}
                    <div className="pt-16 border-t border-border/40 space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-foreground font-['Montserrat']">
                                How to Use the Forex Position Size Calculator
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                                Master strict risk management to preserve capital and compound your edge.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground font-['Montserrat']">1. Define Capital Risk</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Professional prop traders never risk more than 0.5% to 1.5% of total account balance per trade.
                                    Input your exact balance and risk percentage.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground font-['Montserrat']">2. Set Invalidation (SL)</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Determine your technical stop-loss distance in pips based on market structure before executing.
                                    Never adjust stop losses wider during an active trade.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground font-['Montserrat']">3. Execute Exact Lots</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Copy the recommended standard lot size straight into MetaTrader, cTrader, or your broker
                                    platform to guarantee mathematical risk adherence.
                                </p>
                            </div>
                        </div>
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
