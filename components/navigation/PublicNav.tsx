"use client";

import Link from "next/link";
import Hamburger from "hamburger-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const PublicNav = () => {
  const [isOpen, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const tools = [
    { href: "/tools/news-calendar", label: "News & Calendar" },
    { href: "/tools/journal", label: "Journal & Analysis" },
    { href: "/tools/Ai Fundamentals", label: "Ai Fundamentals" },
    { href: "/tools/calculator", label: "Forex Calculator" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl mx-auto"
      >
        <div className="flex items-center justify-between h-14 px-5 md:px-6 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-none md:rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground text-xs font-black font-['Montserrat']">P</span>
            </div>
            <span className="text-lg font-bold text-foreground font-['Montserrat'] group-hover:text-accent transition-colors">
              pipTAB
            </span>
          </Link>

          {/* Center — Quick Tools */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-white/[0.03] rounded-xl px-1 py-1 border border-white/[0.04]">
              {tools.map((tool) => (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all font-['Montserrat'] whitespace-nowrap"
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — Auth + Theme */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </button>
            <Link
              href="/auth/sign-in"
              className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-['Montserrat']"
            >
              Log In
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-5 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-xl hover:brightness-110 transition-all font-['Montserrat'] shadow-[0_0_20px_rgba(228,230,195,0.15)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/auth/sign-up"
              className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg font-['Montserrat']"
            >
              Get Started
            </Link>
            <Hamburger toggled={isOpen} toggle={setOpen} color="currentColor" size={20} />
          </div>
        </div>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full overflow-hidden md:hidden"
          >
            <div className="bg-background/95 backdrop-blur-xl border-t border-white/[0.04] py-3 px-5 space-y-1">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.label}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={tool.href}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm text-foreground hover:bg-secondary hover:text-accent transition-all font-['Montserrat']"
                  >
                    {tool.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-2 border-t border-border/30">
                <Link
                  href="/auth/sign-in"
                  className="block py-2.5 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors font-['Montserrat']"
                >
                  Log In
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicNav;
