"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Brain } from "lucide-react";

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

      <motion.div
        variants={fadeUp}
        className="flex justify-center items-center w-full flex-col md:flex-row gap-4 mb-10"
      >
        <Link
          className="bg-accent py-[12px] px-[24px] border-b-4 border-foreground hero-trial-btn rounded-full w-full max-w-[246px] h-[56px] text-accent-foreground flex items-center justify-center font-['Montserrat'] font-semibold"
          href="/auth/sign-up"
        >
          Start Trading Smarter
        </Link>

        <Link
          className="bg-background py-[12px] px-[24px] border border-border hero-trial-btn rounded-full w-full max-w-[184px] h-[56px] text-foreground text-center how-it-works-btn font-['Montserrat']"
          href="#how-it-works"
        >
          How it works
        </Link>
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
