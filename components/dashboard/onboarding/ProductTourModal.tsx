"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export default function ProductTourModal() {
    const router = useRouter();
    const pathname = usePathname();
    const driverInstance = useRef<any>(null);

    const startTour = async () => {
        // If not on performance page, route there first
        if (pathname !== "/performance") {
            router.push("/performance");
            await new Promise((resolve) => setTimeout(resolve, 350));
        }

        const steps: (DriveStep & { route?: string })[] = [
            // STEP 1: Performance - AI Diagnostic
            {
                element: "#tour-ai-diagnostic",
                route: "/performance",
                popover: {
                    title: "✨ 1. AI Edge Diagnostic",
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
                    title: "📊 2. Quant & Edge Lab Tabs",
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
                    title: "💳 3. Multi-Account Switcher",
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
                    title: "📅 4. Session Calendar & Leakage",
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
                    title: "📝 5. Execution Journal & AI Auditor",
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
                    title: "🗂️ 6. Interactive Trade Cards",
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
                    title: "⚡ 7. G8 Relative Currency Strength",
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
                    title: "🌍 8. 24h Global Session & Overlap Radar",
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
                    title: "🧠 9. Pre-Session Readiness Audit",
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
                    title: "🛡️ 10. Emergency Tilt Reset (Circuit Breaker)",
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
                    title: "💡 11. Emotion-to-PnL Matrix",
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
            doneBtnText: "⚡ Start Trading",
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
                        await new Promise((resolve) => setTimeout(resolve, 350));
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
                        await new Promise((resolve) => setTimeout(resolve, 350));
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
