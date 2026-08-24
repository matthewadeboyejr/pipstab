"use client";

import Link from "next/link";
import Hamburger from "hamburger-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Zap } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const PublicNav = () => {
  const [isOpen, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const tools = [
    { href: "/calendar", label: "News & Calendar" },
    { href: "/calculator", label: "Forex Calculator" },
    { href: "/early-access", label: "Journal & Analysis" },
    { href: "/early-access", label: "AI Fundamentals" },
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
              <Zap className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-black text-foreground font-['Montserrat'] group-hover:text-accent transition-colors tracking-tighter">
              PIPSTAB<span className="text-accent text-xl">.</span>
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

          {/* Right — Auth + Theme + Telegram */}
          <div className="hidden md:flex items-center gap-2.5">
            <a
              href="https://t.me/pipstab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-[#229ED9] hover:bg-white/5 transition-all font-['Montserrat']"
              title="Join PipTab Telegram Community"
            >
              <svg className="w-4 h-4 fill-current text-[#229ED9]" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>Telegram</span>
            </a>

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
              href="/early-access"
              className="px-5 py-2 bg-accent text-accent-foreground text-sm font-black rounded-xl hover:brightness-110 transition-all font-['Montserrat'] shadow-[0_0_20px_rgba(var(--accent),0.15)]"
            >
              Early Access
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
              href="/early-access"
              className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-black rounded-lg font-['Montserrat']"
            >
              Early Access
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
              <div className="pt-2 border-t border-border/30 space-y-1">
                <a
                  href="https://t.me/pipstab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm text-[#229ED9] hover:bg-secondary transition-all font-['Montserrat'] font-bold"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span>Telegram Community (@pipstab)</span>
                </a>
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
