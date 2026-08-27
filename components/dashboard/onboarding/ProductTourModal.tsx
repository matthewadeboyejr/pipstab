"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

// Helper to reliably wait for DOM elements when transitioning across pages
const waitForElement = (selector: string, timeout = 2500): Promise<Element | null> => {
    return new Promise((resolve) => {
        if (typeof document === "undefined") return resolve(null);
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const startTime = Date.now();
        const interval = setInterval(() => {
            const found = document.querySelector(selector);
            if (found) {
                clearInterval(interval);
                resolve(found);
            } else if (Date.now() - startTime >= timeout) {
                clearInterval(interval);
                resolve(null);
            }
        }, 40);
    });
};

// Clean SVG Icons for Institutional Popovers
const ICONS = {
    sparkles: `<svg class="w-4 h-4 text-[#e4e6c3] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    barChart: `<svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
    creditCard: `<svg class="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    calendar: `<svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    bookOpen: `<svg class="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    layers: `<svg class="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"/></svg>`,
    activity: `<svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    globe: `<svg class="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    brain: `<svg class="w-4 h-4 text-[#e4e6c3] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M12 18v4"/></svg>`,
    shieldAlert: `<svg class="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    target: `<svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
};

export default function ProductTourModal() {
    const router = useRouter();
    const pathname = usePathname();
    const driverInstance = useRef<any>(null);

    const startTour = async () => {
        // If not on performance page, route there first
        if (pathname !== "/performance") {
            router.push("/performance");
            await waitForElement("#tour-ai-diagnostic");
        }

        const steps: (DriveStep & { route?: string })[] = [
            // STEP 1: Performance - AI Diagnostic
            {
                element: "#tour-ai-diagnostic",
                route: "/performance",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.sparkles}<span>1. AI Edge Diagnostic</span></div>`,
                    description:
                        "<strong>When you click this button:</strong><br/>PipTab's AI audits your entire trade history, calculates your Institutional Letter Grade (A+ to F), detects your biggest profit leaks, and generates customized playbook rules.",
                    side: "bottom",
                    align: "end",
                },
            },
            // STEP 2: Performance - View Tabs
            {
                element: "#tour-view-tabs",
                route: "/performance",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.barChart}<span>2. Quant & Edge Lab Tabs</span></div>`,
                    description:
                        "<strong>When you click 'Quant & Edge Lab' or 'Violations':</strong><br/>Toggles the dashboard to 8 institutional metrics including Sharpe Ratio, Mathematical Expectancy ($/trade), Max Streaks, and exact dollars lost to rule violations.",
                    side: "bottom",
                    align: "start",
                },
            },
            // STEP 3: Performance - Account Selector
            {
                element: "#tour-account-selector",
                route: "/performance",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.creditCard}<span>3. Multi-Account Switcher</span></div>`,
                    description:
                        "<strong>When you click this dropdown:</strong><br/>Filter analytics for a single broker account (e.g. Deriv, MT5) or view aggregated multi-broker portfolio performance combined.",
                    side: "bottom",
                    align: "start",
                },
            },
            // STEP 4: Performance - Daily Calendar
            {
                element: "#tour-session-calendar",
                route: "/performance",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.calendar}<span>4. Session Calendar & Leakage</span></div>`,
                    description:
                        "<strong>When you hover or tap any calendar day:</strong><br/>Instantly inspect that day's net dollar return, trade frequency, and exact capital lost to rule breaches.",
                    side: "top",
                    align: "center",
                },
            },
            // STEP 5: Journal - View Tabs & Logger
            {
                element: "#tour-journal-view-tabs",
                route: "/journal",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.bookOpen}<span>5. Execution Journal & AI Auditor</span></div>`,
                    description:
                        "<strong>When you switch to 'AI Auditor':</strong><br/>PipTab runs an objective AI audit flagging lot-sizing discipline leaks, revenge-trading behavior, and your mathematical Risk of Ruin.",
                    side: "bottom",
                    align: "start",
                },
            },
            // STEP 6: Journal - Trade List
            {
                element: "#tour-trade-list-container",
                route: "/journal",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.layers}<span>6. Interactive Trade Cards</span></div>`,
                    description:
                        "<strong>When you tap or click any trade row:</strong><br/>Expands to reveal trade notes, checklist execution tags, Before/After chart screenshots, and lets you generate a 1-click PnL Share Card.",
                    side: "top",
                    align: "center",
                },
            },
            // STEP 7: Macro - G8 Strength
            {
                element: "#tour-g8-strength",
                route: "/macro",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.activity}<span>7. G8 Relative Currency Strength</span></div>`,
                    description:
                        "<strong>Real-time 0–100 Power Rankings:</strong><br/>Measures multi-factor strength across USD, EUR, GBP, JPY, CAD, AUD, NZD, and CHF to instantly identify the strongest vs weakest currency pairs to trade.",
                    side: "bottom",
                    align: "center",
                },
            },
            // STEP 8: Macro - Session Radar
            {
                element: "#tour-session-radar",
                route: "/macro",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.globe}<span>8. 24h Global Session & Overlap Radar</span></div>`,
                    description:
                        "<strong>Orderflow Intelligence:</strong><br/>Displays active market sessions (London, New York, Asia) and alerts you in real-time during the high-liquidity London/NY overlap window.",
                    side: "top",
                    align: "center",
                },
            },
            // STEP 9: Psychology - Readiness Audit
            {
                element: "#tour-readiness-card",
                route: "/psychology",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.brain}<span>9. Pre-Session Readiness Audit</span></div>`,
                    description:
                        "<strong>Before risking live capital:</strong><br/>Submit your sleep hours, mood, and stress levels to calculate your daily 0–100% Cognitive Readiness Score.",
                    side: "bottom",
                    align: "center",
                },
            },
            // STEP 10: Psychology - Tilt Reset
            {
                element: "#tour-tilt-reset",
                route: "/psychology",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.shieldAlert}<span>10. Emergency Tilt Reset</span></div>`,
                    description:
                        "<strong>During high-stress or revenge-trading moments:</strong><br/>Initiates a 3-minute guided Box-Breathing session with 3 mandatory sanity check filters to lower heart rate and break emotional loops.",
                    side: "bottom",
                    align: "end",
                },
            },
            // STEP 11: Psychology - Emotion Matrix
            {
                element: "#tour-emotion-matrix-card",
                route: "/psychology",
                popover: {
                    title: `<div class="flex items-center gap-2">${ICONS.target}<span>11. Emotion-to-PnL Matrix</span></div>`,
                    description:
                        "<strong>Quantify your mental edge:</strong><br/>Measures the exact dollar return generated under each emotion (Calm, Confident, Anxious, FOMO) so you know which mindsets make you money.",
                    side: "top",
                    align: "center",
                },
            },
        ];

        let activeStepIndex = 0;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            overlayColor: "rgba(5, 8, 15, 0.88)",
            stagePadding: 8,
            stageRadius: 18,
            popoverClass: "piptab-driver-popover",
            nextBtnText: "Next Step →",
            prevBtnText: "← Back",
            doneBtnText: "Finish Tour",
            steps: steps,
            onPopoverRender: (popover, { state }) => {
                const currentStep = steps[state.activeIndex || 0];
                if (currentStep) {
                    activeStepIndex = state.activeIndex || 0;
                }
            },
            onNextClick: async () => {
                const nextIndex = activeStepIndex + 1;
                if (nextIndex < steps.length) {
                    const nextStep = steps[nextIndex];
                    if (nextStep.route && window.location.pathname !== nextStep.route) {
                        router.push(nextStep.route);
                        if (typeof nextStep.element === "string") {
                            await waitForElement(nextStep.element);
                        }
                    }
                    driverObj.drive(nextIndex);
                } else {
                    driverObj.destroy();
                }
            },
            onPrevClick: async () => {
                const prevIndex = activeStepIndex - 1;
                if (prevIndex >= 0) {
                    const prevStep = steps[prevIndex];
                    if (prevStep.route && window.location.pathname !== prevStep.route) {
                        router.push(prevStep.route);
                        if (typeof prevStep.element === "string") {
                            await waitForElement(prevStep.element);
                        }
                    }
                    driverObj.drive(prevIndex);
                }
            },
            onDestroyed: () => {
                localStorage.setItem("piptab_driver_tour_completed", "true");
            },
        });

        driverInstance.current = driverObj;
        driverObj.drive(0);
    };

    // Auto-launch for new users
    useEffect(() => {
        const seen = localStorage.getItem("piptab_driver_tour_completed");
        if (!seen) {
            const timer = setTimeout(() => {
                startTour();
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    // Listen for custom trigger from TopBar
    useEffect(() => {
        const handleOpenTour = () => {
            startTour();
        };
        window.addEventListener("open-product-tour", handleOpenTour);
        return () => window.removeEventListener("open-product-tour", handleOpenTour);
    }, [pathname]);

    return null;
}
