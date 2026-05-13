"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Brain, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { submitEarlyAccess } from "@/app/actions/early-access";
import { useToast } from "@/context/ToastContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const Hero = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const result = await submitEarlyAccess({
        full_name: "Hero Subscriber",
        email: email,
        market: "General",
      });

      if (result.success) {
        setSubmitted(true);
        addToast("You're on the list!", "success");
      } else {
        addToast(result.error || "Failed to join waitlist", "error");
      }
    } catch (error) {
      addToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="flex w-full items-center justify-center flex-col pt-20 bg-transparent px-3"
    >
      <motion.div
        variants={fadeUp}
        className="w-auto flex items-center gap-2 border border-accent bg-[#5325A514] opacity-100 rounded-[99px] backdrop-blur-lg py-2.5 pr-[18px] pl-3 font-['Montserrat'] font-normal text-sm leading-5 tracking-[-0.04em] text-foreground"
      >
        <Brain className="w-4 h-4 text-accent" />
        The Cognitive Trading OS
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="py-5 text-foreground text-[40px] md:text-[60px] lg:text-[80px] font-['Montserrat'] font-normal leading-[48px] md:leading-[72px] lg:leading-[88px] tracking-[-0.04em] text-center"
      >
        Your Edge is Leaking.
        <br className="hidden md:flex" />
        We Find Where.
      </motion.p>

      <motion.p
        variants={fadeUp}
        className="text-sm md:text-[18px] mb-6 font-['Montserrat'] font-normal leading-7 tracking-normal text-center text-muted-foreground max-w-2xl"
      >
        PipTab bridges the gap between your trading plan and your execution.
        <br className="hidden md:flex" />
        Macro intelligence, alpha leakage detection, and psychology profiling —
        <br className="hidden md:flex" />
        all in one cognitive layer.
      </motion.p>

      {/* Early Access Input - Modern Waitlist */}
      <motion.div
        variants={fadeUp}
        className="w-full max-w-md mx-auto mb-16 relative group"
      >
        <div className="absolute -inset-1 bg-linear-to-r from-accent/40 via-accent/20 to-accent/40 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

        <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[22px] shadow-2xl">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubscribe}
                className="flex p-1.5"
              >
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-transparent px-6 py-3.5 text-[15px] focus:outline-hidden font-['Montserrat'] text-foreground placeholder:text-white/20"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3.5 bg-accent text-accent-foreground font-black rounded-[18px] text-[13px] hover:scale-[0.98] active:scale-[0.95] transition-all whitespace-nowrap shadow-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Early Access"}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 py-5 px-6 text-accent"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-black text-sm uppercase tracking-widest">You're on the list!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 opacity-40">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Limited Beta Spots</span>
          </div>
          <div className="w-[1px] h-3 bg-white/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">V1.0 Launching Soon</span>
        </div>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        variants={fadeUp}
        className="relative w-full max-w-5xl mx-auto px-4 mb-16"
      >
        {/* Glow behind the image */}
        <div className="absolute inset-x-10 top-10 bottom-0 bg-accent/10 rounded-3xl blur-3xl -z-10" />

        {/* Floating browser frame */}
        <div className="relative rounded-2xl overflow-hidden border border-border/30 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.7)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-card border-b border-border/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-8">
              <div className="bg-secondary/80 rounded-lg px-3 py-1 text-[10px] text-muted-foreground text-center font-['Montserrat'] max-w-[240px] mx-auto">
                app.piptab.io/overview
              </div>
            </div>
          </div>

          {/* Dashboard screenshot — cropped to show top portion only */}
          <div className="max-h-[420px] md:max-h-[500px] overflow-hidden">
            <Image
              src="/website/dashboard-preview.png"
              alt="PipTab Dashboard — Overview showing equity curve, alpha leakage, and trading calendar"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {/* Bottom fade for seamless blend with background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

export default Hero;
