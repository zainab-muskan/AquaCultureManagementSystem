"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    X, ChevronRight, ChevronLeft, Sparkles,
    HomeIcon, Calendar, Package, Fish, Utensils,
    FlaskConical, Droplet, DollarSign, BookOpen,
    Waves, Plus, BarChart3, Rocket
} from "lucide-react";

// ─── Tour Step Definitions ───────────────────────────────────────
const TOUR_STEPS = [
    {
        id: "welcome",
        type: "modal", // center modal, no target
        title: "Welcome to Your Dashboard! 🐟",
        description: "Now that your farm is set up, let's take a quick look at the features available to you.",
        icon: <Sparkles size={28} className="text-blue-500" />,
    },
    {
        id: "stats-overview",
        type: "highlight",
        targetSelector: "[data-tour='stats-cards']",
        title: "Farm Overview",
        description: "Your key metrics at a glance — total ponds, fish stock, expenses, and water quality status are always visible here.",
        position: "bottom",
        icon: <BarChart3 size={20} className="text-orange-500" />,
    },
    {
        id: "sidebar-farm-planner",
        type: "highlight",
        targetSelector: "a[href='/planner']",
        title: "Farm Planner",
        description: "Plan your harvest cycles, calculate expected yields, and stay ahead of your production schedule.",
        position: "right",
        icon: <Calendar size={20} className="text-blue-500" />,
    },
    {
        id: "sidebar-stock",
        type: "highlight",
        targetSelector: "a[href='/stock']",
        title: "Stock Management",
        description: "Track your feed, fertilizer, and treatment inventory. Get low-stock alerts before you run out.",
        position: "right",
        icon: <Package size={20} className="text-indigo-500" />,
    },
    {
        id: "sidebar-species",
        type: "highlight",
        targetSelector: "a[href='/species']",
        title: "Fish Species",
        description: "Browse all approved fish species, check compatibility for polyculture, and add custom species to the system.",
        position: "right",
        icon: <Fish size={20} className="text-teal-500" />,
    },
    {
        id: "sidebar-feeding",
        type: "highlight",
        targetSelector: "a[href='/feeding']",
        title: "Feeding Guide",
        description: "Science-based feeding schedules tailored to your species and pond conditions. Never overfeed or underfeed again.",
        position: "right",
        icon: <Utensils size={20} className="text-amber-500" />,
    },
    {
        id: "sidebar-fertilization",
        type: "highlight",
        targetSelector: "a[href='/fertilization']",
        title: "Fertilization",
        description: "Get recommendations for organic and inorganic fertilizers based on your pond size and cultivation type.",
        position: "right",
        icon: <FlaskConical size={20} className="text-green-500" />,
    },
    {
        id: "sidebar-water",
        type: "highlight",
        targetSelector: "a[href='/water']",
        title: "Water Quality",
        description: "Monitor pH, dissolved oxygen, temperature, and ammonia levels. Receive critical alerts when parameters go out of range.",
        position: "right",
        icon: <Droplet size={20} className="text-blue-500" />,
    },
    {
        id: "sidebar-budget",
        type: "highlight",
        targetSelector: "a[href='/budget']",
        title: "Budget & Expenses",
        description: "Track every expense by category — feed, labor, medicine, electricity. See where your money goes with visual breakdowns.",
        position: "right",
        icon: <DollarSign size={20} className="text-purple-500" />,
    },
    {
        id: "sidebar-info",
        type: "highlight",
        targetSelector: "a[href='/info']",
        title: "Information Center",
        description: "Access aquaculture knowledge guides, best practices, and disease management resources curated for your region.",
        position: "right",
        icon: <BookOpen size={20} className="text-rose-500" />,
    },
    {
        id: "add-pond",
        type: "highlight",
        targetSelector: "[data-tour='add-pond-btn']",
        title: "Add New Pond",
        description: "Create your first pond here. The system will auto-calculate dimensions, water volume, and stocking capacity based on your inputs.",
        position: "bottom-end",
        icon: <Plus size={20} className="text-blue-500" />,
    },
    {
        id: "my-ponds",
        type: "highlight",
        targetSelector: "[data-tour='my-ponds']",
        title: "My Ponds",
        description: "All your ponds appear here with quick action buttons — Add Fish, Feed, Fertilize, Record Expenses, Log Mortality, and Harvest.",
        position: "top",
        icon: <Waves size={20} className="text-cyan-500" />,
    },
    {
        id: "activity-feed",
        type: "highlight",
        targetSelector: "[data-tour='activity-feed']",
        title: "Live Activity Feed",
        description: "Every action you take across the app is recorded here for your audit logs. Filter by category to find specific activities.",
        position: "top",
        icon: <BarChart3 size={20} className="text-indigo-500" />,
    },
    {
        id: "complete",
        type: "modal",
        title: "You're All Set! 🚀",
        description: "Your farm dashboard is ready. Start by adding fish to your ponds and tracking their growth. You can always replay this tour from the dashboard.",
        icon: <Rocket size={28} className="text-emerald-500" />,
    },
];



// ─── Tooltip Position Calculator ──────────────────────────────────
function getTooltipStyle(rect, position, tooltipW = 360, tooltipH = 200) {
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const GAP = 16;
    const scrollY = window.scrollY || 0;
    const scrollX = window.scrollX || 0;

    let top, left;

    switch (position) {
        case "right":
            top = rect.top + scrollY + rect.height / 2 - tooltipH / 2;
            left = rect.right + scrollX + GAP;
            // Keep within viewport
            if (left + tooltipW > window.innerWidth) {
                left = rect.left + scrollX - tooltipW - GAP; // flip left
            }
            break;
        case "left":
            top = rect.top + scrollY + rect.height / 2 - tooltipH / 2;
            left = rect.left + scrollX - tooltipW - GAP;
            break;
        case "top":
            top = rect.top + scrollY - tooltipH - GAP;
            left = rect.left + scrollX + rect.width / 2 - tooltipW / 2;
            break;
        case "bottom":
            top = rect.bottom + scrollY + GAP;
            left = rect.left + scrollX + rect.width / 2 - tooltipW / 2;
            break;
        case "bottom-end":
            top = rect.bottom + scrollY + GAP;
            left = rect.right + scrollX - tooltipW;
            break;
        default:
            top = rect.bottom + scrollY + GAP;
            left = rect.left + scrollX;
    }

    // Clamp to viewport
    top = Math.max(10, Math.min(top, window.innerHeight + scrollY - tooltipH - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipW - 10));

    return { top: `${top}px`, left: `${left}px` };
}

// ─── Main Tour Component ──────────────────────────────────────────
export default function DashboardTour({ onComplete, userEmail, isNewUser = true }) {
    const [active, setActive] = useState(false);
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const tooltipRef = useRef(null);

    const getStorageKey = useCallback(() => {
        return userEmail ? `ffg_tour_completed_${userEmail}` : "ffg_tour_completed";
    }, [userEmail]);

    // Check if tour should auto-start (first time)
    useEffect(() => {
        if (typeof window === "undefined") return;
        
        const legacyCompleted = localStorage.getItem("ffg_tour_completed");
        const userCompleted = localStorage.getItem(getStorageKey());
        
        if (legacyCompleted && !userCompleted && userEmail) {
            localStorage.setItem(getStorageKey(), "true");
        }
        
        const isCompleted = userCompleted || legacyCompleted;

        if (!isCompleted && isNewUser) {
            // Small delay to let dashboard render
            const timer = setTimeout(() => setActive(true), 1200);
            return () => clearTimeout(timer);
        }
    }, [getStorageKey, isNewUser, userEmail]);

    // Update target rect when step changes
    const updateTargetRect = useCallback(() => {
        const currentStep = TOUR_STEPS[step];
        if (!currentStep || currentStep.type === "modal") {
            setTargetRect(null);
            return;
        }
        const el = document.querySelector(currentStep.targetSelector);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Wait for scroll to finish
            setTimeout(() => {
                setTargetRect(el.getBoundingClientRect());
            }, 350);
        } else {
            setTargetRect(null);
        }
    }, [step]);

    useEffect(() => {
        if (!active) return;
        updateTargetRect();
        // Update on resize/scroll
        const handle = () => updateTargetRect();
        window.addEventListener("resize", handle);
        window.addEventListener("scroll", handle, true);
        return () => {
            window.removeEventListener("resize", handle);
            window.removeEventListener("scroll", handle, true);
        };
    }, [active, step, updateTargetRect]);

    const handleNext = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = () => {
        setActive(false);
        setStep(0);
        localStorage.setItem(getStorageKey(), "true");
        onComplete?.();
    };

    // Public method to restart tour
    useEffect(() => {
        const handler = () => {
            localStorage.removeItem(getStorageKey());
            setStep(0);
            setActive(true);
        };
        window.addEventListener("restart-tour", handler);
        return () => window.removeEventListener("restart-tour", handler);
    }, [getStorageKey]);

    if (!active) return null;

    const currentStep = TOUR_STEPS[step];
    const isModal = currentStep.type === "modal";
    const isLastStep = step === TOUR_STEPS.length - 1;
    const isFirstStep = step === 0;
    const progress = ((step + 1) / TOUR_STEPS.length) * 100;

    // Spotlight cutout for highlighted elements
    const spotlightPadding = 8;

    return (
        <>
            {/* ── Overlay ── */}
            <div className="fixed inset-0 z-[9998]" style={{ pointerEvents: "auto" }}>
                {isModal ? (
                    // Simple dark overlay for modals
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                ) : targetRect ? (
                    // SVG overlay with spotlight cutout
                    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                        <defs>
                            <mask id="tour-spotlight-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <rect
                                    x={targetRect.left - spotlightPadding}
                                    y={targetRect.top - spotlightPadding}
                                    width={targetRect.width + spotlightPadding * 2}
                                    height={targetRect.height + spotlightPadding * 2}
                                    rx="12"
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect
                            x="0" y="0"
                            width="100%" height="100%"
                            fill="rgba(0,0,0,0.55)"
                            mask="url(#tour-spotlight-mask)"
                            style={{ pointerEvents: "auto" }}
                        />
                    </svg>
                ) : (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                )}

                {/* Spotlight ring glow */}
                {!isModal && targetRect && (
                    <div
                        className="absolute rounded-xl border-2 border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.2)] pointer-events-none"
                        style={{
                            top: targetRect.top - spotlightPadding,
                            left: targetRect.left - spotlightPadding,
                            width: targetRect.width + spotlightPadding * 2,
                            height: targetRect.height + spotlightPadding * 2,
                            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    >
                        <div className="absolute inset-0 rounded-xl animate-pulse border border-blue-300/50" />
                    </div>
                )}

                {/* ── Tooltip / Modal Card ── */}
                <div
                    ref={tooltipRef}
                    className="absolute z-[9999]"
                    style={
                        isModal
                            ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
                            : getTooltipStyle(targetRect, currentStep.position)
                    }
                >
                    <div
                        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ${isModal ? "w-[440px] max-w-[90vw]" : "w-[360px] max-w-[85vw]"
                            }`}
                        style={{
                            animation: "tourSlideIn 0.35s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    >
                        {/* Progress bar */}
                        <div className="h-1 bg-gray-100">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="p-5 sm:p-6">
                            {/* Icon + Title */}
                            <div className="flex items-start gap-3 mb-3">
                                {isModal ? (
                                    <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
                                        {currentStep.icon}
                                    </div>
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded-lg shrink-0 mt-0.5">
                                        {currentStep.icon}
                                    </div>
                                )}
                                <div>
                                    <h3 className={`font-bold text-gray-900 ${isModal ? "text-lg" : "text-base"}`}>
                                        {currentStep.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 leading-relaxed mb-5">
                                {currentStep.description}
                            </p>

                            {/* Footer: Step counter + Buttons */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-400">
                                    Step {step + 1} of {TOUR_STEPS.length}
                                </span>

                                <div className="flex items-center gap-2">
                                    {!isLastStep && (
                                        <button
                                            onClick={handleSkip}
                                            className="text-sm font-medium text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Skip
                                        </button>
                                    )}

                                    {!isFirstStep && (
                                        <button
                                            onClick={handlePrev}
                                            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <ChevronLeft size={16} />
                                            Back
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-sm shadow-blue-200 transition-all active:scale-95"
                                    >
                                        {isLastStep ? "Get Started" : "Next"}
                                        {!isLastStep && <ChevronRight size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation keyframe */}
            <style jsx global>{`
                @keyframes tourSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </>
    );
}
