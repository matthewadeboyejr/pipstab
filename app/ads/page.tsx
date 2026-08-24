import { Metadata } from "next";
import PublicNav from "@/components/navigation/PublicNav";
import SocialAdVideoPreview from "@/components/ads/SocialAdVideoPreview";
import { Sparkles, Video, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Video Ad & Motion Studio | PipTab",
    description: "Short-form video ads, motion graphics preview, and TikTok/Reels production scripts for PipTab.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdsPreviewPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent">
            {/* Navigation */}
            <div className="pt-0 md:pt-5 max-w-7xl mx-auto px-4">
                <PublicNav />
            </div>

            <main className="relative pt-10 pb-24 px-4 sm:px-6">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(circle_at_center,rgba(var(--accent),0.08),transparent_70%)] pointer-events-none -z-10" />

                <SocialAdVideoPreview />
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
                        © 2026 PIPSTAB MARKETING & MEDIA STUDIO
                    </div>
                </div>
            </footer>
        </div>
    );
}
