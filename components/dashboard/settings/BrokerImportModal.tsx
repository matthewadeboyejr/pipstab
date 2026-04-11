"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import BrokerImport from "./BrokerImport";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function BrokerImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-border/30">
                                <h2 className="text-base font-semibold text-foreground font-['Montserrat']">Import Trades</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <BrokerImport onImportSuccess={onClose} />
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

