"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, Construction, Clock, Sparkles } from "lucide-react";
import PublicNav from "@/components/navigation/PublicNav";

export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-accent/30 selection:text-accent">
            <PublicNav />

            <main className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[80vh] text-center overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-3xl flex items-center justify-center mb-8 mx-auto relative group">
                        <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Construction className="w-10 h-10 text-accent relative z-10" />
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 font-['Montserrat']">
                            WORK IN <span className="text-accent">PROGRESS</span>
                        </h1>
                        <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-medium mb-10">
                            We're currently building something special to elevate your trading performance. This feature will be available soon.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all font-bold group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                        <Link
                            href="/early-access"
                            className="flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-2xl font-black hover:brightness-110 transition-all shadow-[0_0_30px_rgba(var(--accent),0.2)]"
                        >
                            <Zap className="w-5 h-5" />
                            Get Early Access
                        </Link>
                    </motion.div>

                    {/* Feature Preview Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto"
                    >
                        {[
                            { icon: Clock, title: "Precision", desc: "Real-time market insights and lightning fast analysis." },
                            { icon: Sparkles, title: "AI Powered", desc: "Next-gen fundamentals powered by advanced AI models." },
                            { icon: Zap, title: "Performance", desc: "Track every pip and evolve your edge with data." }
                        ].map((feature, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-left group hover:bg-white/[0.04] transition-all">
                                <feature.icon className="w-8 h-8 text-accent/50 mb-4 group-hover:text-accent transition-colors" />
                                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer Branding */}
            <footer className="py-10 text-center border-t border-white/5">
                <div className="flex items-center justify-center gap-2 opacity-30">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="font-black tracking-tighter uppercase text-sm">PIPSTAB<span className="text-accent">.</span></span>
                </div>
            </footer>
        </div>
    );
}
