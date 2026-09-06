"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fish, Mail, Lock, User, MapPin, Building2, Landmark, ShoppingCart } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function SignupPage() {
    const router = useRouter();

    // State for form fields (connecting to your SQL columns)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [farmName, setFarmName] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState("");
    const [role, setRole] = useState("user"); // "user" = Farmer, "Consumer" = Buyer
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isFarmer = role === "user";

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const signupData = {
            fullName: name, // Maps to your backend variable
            email,
            password,
            farmName: role === "Consumer" ? "" : farmName,
            district: city, // Maps city to your district column
            province,
            role // The chosen role
        };

        try {
            const data = await farmApi.signup(signupData);

            if (data.success) {
                alert("Account created successfully! Please login.");
                router.push("/"); // Redirect to Login page exactly as before
            } else {
                setError(data.error || "Signup failed. Please try again.");
            }
        } catch (err) {
            console.error("Signup failed:", err);
            // farmApi throws an error with the backend message, so we display it
            setError(err.message || "Server connection failed. Is your backend running?");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic theme based on selected role
    const bgGradient = isFarmer
        ? "from-cyan-400 via-sky-400 to-blue-500"
        : "from-emerald-400 via-teal-400 to-green-500";
    const iconBg = isFarmer
        ? "bg-blue-600 shadow-[0_8px_30px_rgba(37,99,235,0.35)]"
        : "bg-emerald-600 shadow-[0_8px_30px_rgba(16,185,129,0.35)]";
    const accentColor = isFarmer ? "blue" : "emerald";
    const IconComponent = isFarmer ? Fish : ShoppingCart;
    const subtitleText = isFarmer ? "Smart Fish Farming Management" : "Buy Fresh Fish & Seafood";

    return (
        <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center px-4 py-8 transition-all duration-500 ease-in-out`}>
            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8 mt-4">
                <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300`}>
                    <IconComponent className="text-white w-9 h-9" strokeWidth={2.5} />
                </div>
                <h1 className="text-[17px] font-medium tracking-wide text-white uppercase">
                    FISH FARMING GUIDE
                </h1>
                <p className={`text-[15px] mt-1 transition-colors duration-300 ${isFarmer ? 'text-blue-100' : 'text-emerald-100'}`}>
                    {subtitleText}
                </p>
            </div>

            {/* Signup Card */}
            <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-8 border border-white/40 transition-all duration-300">
                <h2 className="text-[22px] font-medium text-center text-slate-800">Create Account</h2>
                <p className={`text-center text-[15px] mb-6 mt-1 ${isFarmer ? 'text-blue-400' : 'text-emerald-500'}`}>
                    Fill in the details below
                </p>

                <form onSubmit={handleSignup} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Full Name</label>
                        <div className={`relative border border-${accentColor}-200/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-${accentColor}-400/30 focus-within:border-${accentColor}-400 transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500 stroke-[1.5]" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full py-3 pl-11 pr-3 text-[14px] text-gray-900 outline-none bg-white placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email Address</label>
                        <div className={`relative border border-${accentColor}-200/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-${accentColor}-400/30 focus-within:border-${accentColor}-400 transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500 stroke-[1.5]" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full py-3 pl-11 pr-3 text-[14px] text-gray-900 outline-none bg-white placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
                        <div className={`relative border border-${accentColor}-200/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-${accentColor}-400/30 focus-within:border-${accentColor}-400 transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 stroke-[1.5]" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full py-3 pl-11 pr-3 text-[14px] text-gray-900 outline-none bg-white placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Account Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("user")}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[13px] font-semibold border-2 transition-all active:scale-[0.97] ${
                                    role === "user"
                                        ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                <Fish size={18} />
                                Fish Farmer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("Consumer")}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[13px] font-semibold border-2 transition-all active:scale-[0.97] ${
                                    role === "Consumer"
                                        ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm"
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                <ShoppingCart size={18} />
                                Consumer
                            </button>
                        </div>
                    </div>

                    {/* Farm Name (Farmer Only) */}
                    {role === "user" && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Farm Name</label>
                            <div className="relative border border-blue-200/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-400/30 focus-within:border-blue-400 transition-all">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-500 stroke-[1.5]" />
                                </div>
                                <input
                                    type="text"
                                    value={farmName}
                                    onChange={(e) => setFarmName(e.target.value)}
                                    placeholder="Enter your farm name"
                                    className="w-full py-3 pl-11 pr-3 text-[14px] text-gray-900 outline-none bg-white placeholder:text-gray-400"
                                    required={role === "user"}
                                />
                            </div>
                        </div>
                    )}

                    {/* City / District */}
                    <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">City / District</label>
                        <div className={`relative border border-${accentColor}-200/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-${accentColor}-400/30 focus-within:border-${accentColor}-400 transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-500 stroke-[1.5]" />
                            </div>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter your city/district"
                                className="w-full py-3 pl-11 pr-3 text-[14px] text-gray-900 outline-none bg-white placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Province */}
                    <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Province</label>
                        <div className={`relative border border-${accentColor}-200/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-${accentColor}-400/30 focus-within:border-${accentColor}-400 transition-all`}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Landmark className="h-5 w-5 text-gray-500 stroke-[1.5]" />
                            </div>
                            <select
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="w-full py-3 pl-11 pr-3 text-[14px] text-gray-900 outline-none bg-white appearance-none cursor-pointer"
                                required
                            >
                                <option value="">Select your province</option>
                                <option value="Punjab">Punjab</option>
                                <option value="Sindh">Sindh</option>
                                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                                <option value="Balochistan">Balochistan</option>
                                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                                <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] shadow-lg ${
                            isFarmer
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-[15px] text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link href="/" className={`${isFarmer ? 'text-blue-600' : 'text-emerald-600'} font-semibold hover:underline`}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
