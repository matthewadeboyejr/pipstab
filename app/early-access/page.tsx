"use client";

import { motion } from "framer-motion";
import { Zap, CheckCircle2, Shield, Rocket, ArrowRight, Loader2 } from "lucide-react";
import PublicNav from "@/components/navigation/PublicNav";
import { useState } from "react";
import { submitEarlyAccess } from "@/app/actions/early-access";
import { useToast } from "@/context/ToastContext";

export default function EarlyAccessPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get('full_name') as string,
            email: formData.get('email') as string,
            market: formData.get('market') as string,
        };

        try {
            const result = await submitEarlyAccess(data);
            if (result.success) {
                setSubmitted(true);
                addToast("Welcome to the inner circle!", "success");
            } else {
                addToast(result.error || "Failed to join waitlist", "error");
            }
        } catch (error) {
            addToast("An unexpected error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-accent/30 selection:text-accent">
            <PublicNav />

            <main className="relative pt-32 pb-20 px-6">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(var(--accent),0.05),transparent_70%)] -z-10" />
                
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        {/* Left Side: Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-black uppercase tracking-widest mb-6">
                                <Rocket className="w-3 h-3" />
                                Pre-Launch Beta
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8 font-['Montserrat']">
                                JOIN THE <br />
                                <span className="text-accent">INNER CIRCLE.</span>
                            </h1>
                            <p className="text-white/50 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                                Stop leaking alpha and start trading with cognitive edge. Be the first to experience PIPSTAB v1.0.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Priority Beta Access", desc: "Get hands-on with new features before anyone else.", icon: Shield },
                                    { title: "Lifetime Founding Member Badge", desc: "Exclusive status and benefits for our early supporters.", icon: CheckCircle2 },
                                    { title: "Direct Influence", desc: "Your feedback shapes the future of the PIPSTAB roadmap.", icon: Zap }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white tracking-tight">{item.title}</h3>
                                            <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right Side: Form Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-accent/20 blur-3xl -z-10 opacity-30" />
                            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
                                {submitted ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-10"
                                    >
                                        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(var(--accent),0.4)]">
                                            <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
                                        </div>
                                        <h2 className="text-3xl font-black mb-3 font-['Montserrat'] tracking-tight">YOU'RE ON THE LIST!</h2>
                                        <p className="text-white/60 leading-relaxed mb-6 max-w-sm mx-auto text-sm">
                                            Check your inbox soon. In the meantime, join the official PipTab Telegram group to share early feedback, drop reviews, and talk with the team!
                                        </p>
                                        
                                        <a
                                            href="https://t.me/pipstab"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#229ED9]/25 hover:scale-[1.02] active:scale-[0.98] mb-6 font-['Montserrat']"
                                        >
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                            </svg>
                                            <span>Join Telegram (@pipstab)</span>
                                        </a>

                                        <div>
                                            <button 
                                                onClick={() => setSubmitted(false)}
                                                className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Submit another email
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                            <input 
                                                required
                                                name="full_name"
                                                type="text" 
                                                placeholder="John Doe"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-hidden focus:border-accent/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                            <input 
                                                required
                                                name="email"
                                                type="email" 
                                                placeholder="john@example.com"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-hidden focus:border-accent/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Main Market</label>
                                            <select 
                                                name="market"
                                                required
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white/50 focus:outline-hidden focus:border-accent/50 transition-all font-medium appearance-none"
                                            >
                                                <option value="">Select your primary market</option>
                                                <option value="Forex">Forex</option>
                                                <option value="Synthetics">Synthetics (Deriv)</option>
                                                <option value="Crypto">Crypto</option>
                                                <option value="Stocks">Stocks & Options</option>
                                            </select>
                                        </div>
                                        
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(var(--accent),0.2)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    Request Beta Access
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-white/20 text-center uppercase tracking-wider font-bold">
                                            Secure & Private. No Spam Ever.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Footer Branding */}
            <footer className="py-12 border-t border-white/5 bg-black/40">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-60">
                        <Zap className="w-5 h-5 text-accent" />
                        <span className="font-black tracking-tighter text-xl">PIPSTAB<span className="text-accent">.</span></span>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-semibold text-white/50">
                        <a
                            href="https://t.me/pipstab"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-accent transition-colors"
                        >
                            <span>Telegram: @pipstab</span>
                        </a>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                            © 2026 PIPSTAB
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
