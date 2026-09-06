"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fish, Mail, Lock, Shield, ShoppingCart } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

// --- Role-Specific Theme Configurations ---
const ROLE_THEMES = {
    farmer: {
        role: "user",
        icon: Fish,
        title: "FISH FARMING GUIDE",
        subtitle: "Smart Fish Farming Management",
        cardTitle: "Welcome Back",
        cardSubtitle: "Log in to continue",
        bgGradient: "from-cyan-400 via-sky-400 to-blue-500",
        iconBg: "bg-blue-600 shadow-[0_8px_30px_rgba(37,99,235,0.35)]",
        titleColor: "text-white",
        subtitleColor: "text-blue-100",
        cardBg: "bg-white/80 backdrop-blur-xl border-white/40",
        cardTitleColor: "text-slate-800",
        cardSubColor: "text-blue-400",
        labelColor: "text-slate-700",
        inputBorder: "border-blue-200/60",
        inputFocus: "focus-within:ring-blue-400/30 focus-within:border-blue-400",
        buttonBg: "bg-blue-600 hover:bg-blue-700",
        buttonText: "text-white",
        linkColor: "text-blue-600",
        switchLinks: [
            { label: "Login as Admin", role: "admin", icon: Shield },
            { label: "Login as Consumer", role: "consumer", icon: ShoppingCart }
        ]
    },
    admin: {
        role: "admin",
        icon: Shield,
        title: "FISH FARMING GUIDE",
        subtitle: "Manage Platform & Operations",
        cardTitle: "Admin Portal",
        cardSubtitle: "Log in to continue",
        bgGradient: "from-slate-800 via-slate-700 to-slate-900",
        iconBg: "bg-slate-600 shadow-[0_8px_30px_rgba(51,65,85,0.4)]",
        titleColor: "text-white",
        subtitleColor: "text-slate-400",
        cardBg: "bg-white/10 backdrop-blur-xl border-white/10",
        cardTitleColor: "text-white",
        cardSubColor: "text-slate-400",
        labelColor: "text-slate-300",
        inputBorder: "border-slate-500/40",
        inputFocus: "focus-within:ring-slate-400/30 focus-within:border-slate-400",
        inputBg: "bg-slate-700/50 text-white placeholder:text-slate-400",
        buttonBg: "bg-slate-600 hover:bg-slate-500",
        buttonText: "text-white",
        linkColor: "text-blue-400",
        switchLinks: [
            { label: "Login as Farmer", role: "farmer", icon: Fish },
            { label: "Login as Consumer", role: "consumer", icon: ShoppingCart }
        ]
    },
    consumer: {
        role: "Consumer",
        icon: ShoppingCart,
        title: "FISH FARMING GUIDE",
        subtitle: "Buy Fresh Fish & Seafood",
        cardTitle: "Consumer Marketplace",
        cardSubtitle: "Log in to continue",
        bgGradient: "from-emerald-400 via-teal-400 to-green-500",
        iconBg: "bg-emerald-600 shadow-[0_8px_30px_rgba(16,185,129,0.35)]",
        titleColor: "text-white",
        subtitleColor: "text-emerald-100",
        cardBg: "bg-white/80 backdrop-blur-xl border-white/40",
        cardTitleColor: "text-slate-800",
        cardSubColor: "text-emerald-500",
        labelColor: "text-slate-700",
        inputBorder: "border-emerald-200/60",
        inputFocus: "focus-within:ring-emerald-400/30 focus-within:border-emerald-400",
        buttonBg: "bg-emerald-600 hover:bg-emerald-700",
        buttonText: "text-white",
        linkColor: "text-emerald-600",
        switchLinks: [
            { label: "Login as Farmer", role: "farmer", icon: Fish },
            { label: "Login as Admin", role: "admin", icon: Shield }
        ]
    }
};

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeRole, setActiveRole] = useState("farmer"); // farmer | admin | consumer
    const [transitioning, setTransitioning] = useState(false);

    const theme = ROLE_THEMES[activeRole];
    const IconComponent = theme.icon;
    const isDark = activeRole === "admin";

    const switchRole = (newRole) => {
        if (newRole === activeRole) return;
        setTransitioning(true);
        setError("");
        setTimeout(() => {
            setActiveRole(newRole);
            setTimeout(() => setTransitioning(false), 50);
        }, 200);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await farmApi.login(email, password);

            if (data.success) {
                // Save the Bearer Token to localStorage
                localStorage.setItem("token", data.token);
                // Save user basic info for display purposes
                localStorage.setItem("user", JSON.stringify(data.user));

                // Validate role matches the portal they logged into
                const userRole = data.user.role;
                if (activeRole === "admin" && userRole !== "admin") {
                    setError("This account is not authorized for Admin access.");
                    setLoading(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return;
                }
                if (activeRole === "consumer" && userRole !== "Consumer") {
                    setError("This account is not a Consumer account. Please use Farmer login.");
                    setLoading(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return;
                }
                if (activeRole === "farmer" && (userRole === "admin" || userRole === "Consumer")) {
                    setError(`This is a ${userRole} account. Please use the correct portal.`);
                    setLoading(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return;
                }

                // Route to appropriate dashboard
                if (userRole === "admin") {
                    router.push("/admin");
                } else if (userRole === "Consumer") {
                    router.push("/marketplace");
                } else {
                    router.push("/dashboard");
                }
            } else {
                setError(data.error || "Invalid email or password");
            }
        } catch (err) {
            const errorMessage = err.message || "Cannot connect to server. Check if backend is running.";
            alert(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} flex flex-col items-center justify-center px-4 transition-all duration-500 ease-in-out`}>
            {/* Logo + Title */}
            <div className={`flex flex-col items-center mb-10 mt-6 transition-all duration-300 ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className={`w-16 h-16 ${theme.iconBg} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300`}>
                    <IconComponent className="text-white w-9 h-9" strokeWidth={2.5} />
                </div>
                <h1 className={`text-[17px] font-medium tracking-wide ${theme.titleColor} uppercase transition-colors duration-300`}>
                    {theme.title}
                </h1>
                <p className={`text-[15px] ${theme.subtitleColor} mt-1 transition-colors duration-300`}>
                    {theme.subtitle}
                </p>
            </div>

            {/* Login Card */}
            <div className={`${theme.cardBg} w-full max-w-md rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-8 border transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
                <h2 className={`text-[22px] font-medium text-center ${theme.cardTitleColor} transition-colors duration-300`}>
                    {theme.cardTitle}
                </h2>
                <p className={`text-center text-[15px] ${theme.cardSubColor} mb-8 mt-1 transition-colors duration-300`}>
                    {theme.cardSubtitle}
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className={`block text-[13px] font-medium ${theme.labelColor} mb-1.5 transition-colors duration-300`}>
                            Email Address
                        </label>
                        <div className={`relative border ${theme.inputBorder} rounded-xl overflow-hidden focus-within:ring-2 ${theme.inputFocus} transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-gray-500'} stroke-[1.5]`} />
                            </div>
                            <input
                                type="email"
                                className={`w-full py-3.5 pl-11 pr-3 text-[15px] outline-none ${isDark ? 'bg-slate-700/50 text-white placeholder:text-slate-400' : 'bg-white text-gray-900 placeholder:text-gray-400'}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-[13px] font-medium ${theme.labelColor} mb-1.5 transition-colors duration-300`}>
                            Password
                        </label>
                        <div className={`relative border ${theme.inputBorder} rounded-xl overflow-hidden focus-within:ring-2 ${theme.inputFocus} transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-gray-500'} stroke-[1.5]`} />
                            </div>
                            <input
                                type="password"
                                className={`w-full py-3.5 pl-11 pr-3 text-[15px] outline-none ${isDark ? 'bg-slate-700/50 text-white placeholder:text-slate-400' : 'bg-white text-gray-900 placeholder:text-gray-400'}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className={`p-2.5 rounded-lg text-xs text-center font-medium ${isDark ? 'bg-red-500/20 border border-red-400/30 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full ${theme.buttonBg} ${theme.buttonText} py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] shadow-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Authenticating..." : "Login"}
                    </button>
                </form>

                <p className={`text-center text-[15px] mt-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    New to Fish Farming Guide?{" "}
                    <Link href="/signup" className={`${theme.linkColor} font-semibold hover:underline`}>
                        Create Account
                    </Link>
                </p>

                {/* Role Switch Links */}
                <div className={`mt-5 pt-5 border-t ${isDark ? 'border-slate-600/40' : 'border-gray-200/60'} flex flex-col items-center gap-2`}>
                    {theme.switchLinks.map((link) => {
                        const SwitchIcon = link.icon;
                        return (
                            <button
                                key={link.role}
                                onClick={() => switchRole(link.role)}
                                className={`flex items-center gap-2 text-[14px] font-medium transition-all hover:scale-[1.03] active:scale-[0.97] ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <SwitchIcon size={16} strokeWidth={2} />
                                {link.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
