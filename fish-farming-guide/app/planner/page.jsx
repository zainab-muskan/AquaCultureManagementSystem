"use client";

import { useState, useEffect } from "react";
import { farmApi } from "@/integration/farmApi";
import {
    LayoutDashboard,
    Maximize2,
    Plus,
    PlusCircle,
    Info,
    Waves,
    Calendar,
    Lightbulb,
    Check,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FarmPlannerPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [farmDetails, setFarmDetails] = useState(null);
    const [ponds, setPonds] = useState([]);
    const [areaUsage, setAreaUsage] = useState(null);

    // Planner States
    const [pondStage, setPondStage] = useState('Grow-out');
    const [cultivationType, setCultivationType] = useState('Extensive');
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState([]);
    const [compatibilityMap, setCompatibilityMap] = useState({});
    const [pondPlan, setPondPlan] = useState([]);
    const [pondSpecs, setPondSpecs] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [provisioning, setProvisioning] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [details, pondData, usageData] = await Promise.all([
                farmApi.getFarmDetails(),
                farmApi.getPonds(),
                farmApi.getAreaUsage()
            ]);

            const normalizedPonds = (pondData || []).map(pond => ({
                ...pond,
                id: pond.PondId || pond.id,
                pondName: pond.PondName || pond.pondName || pond.name || "Unnamed Pond",
                size: Number(pond.Size || pond.size || 0),
                species: (pond.species || []).map(s => ({
                    ...s,
                    quantity: s.Quantity || s.quantity || 0
                }))
            }));

            setFarmDetails(details);
            setPonds(normalizedPonds);

            if (usageData?.success) {
                setAreaUsage(usageData.data);
            }

            // Fetch Regional Species using Region from FarmDetails
            if (details && details.RegionName) {
                const data = await farmApi.getRegionalSpecies(details.RegionName);
                setAvailableSpecies(data || []);

                const compMap = {};
                for (const sp of data) {
                    try {
                        const compData = await farmApi.getSpeciesCompatibility(sp.SpeciesId);
                        compMap[sp.SpeciesId] = (compData || []).map(c =>
                            c.MainSpeciesName === sp.Name ?
                                data.find(d => d.Name === c.CompatibleSpeciesName)?.SpeciesId :
                                data.find(d => d.Name === c.MainSpeciesName)?.SpeciesId
                        ).filter(Boolean);
                    } catch (err) {
                        compMap[sp.SpeciesId] = [];
                    }
                }
                setCompatibilityMap(compMap);
            }
        } catch (err) {
            console.error("Failed to fetch planner data:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper Functions for Polyculture
    const isSpeciesAllowed = (speciesId) => {
        if (selectedSpecies.length === 0) return true;
        if (selectedSpecies.length >= 3 && !selectedSpecies.some(s => s.SpeciesId === speciesId)) return false;
        const mainSpecies = selectedSpecies[0];
        const allowedIds = compatibilityMap[mainSpecies.SpeciesId] || [];
        return mainSpecies.SpeciesId === speciesId || allowedIds.includes(speciesId);
    };

    const toggleSpecies = (species) => {
        const isSelected = selectedSpecies.some(s => s.SpeciesId === species.SpeciesId);
        if (isSelected) {
            const updated = selectedSpecies.filter(s => s.SpeciesId !== species.SpeciesId);
            setSelectedSpecies(updated);
            setPondPlan(pondPlan.filter(p => p.speciesId !== species.SpeciesId));
            if (updated.length === 0) setPondSpecs(null);
        } else {
            if (selectedSpecies.length >= 3) return;
            setSelectedSpecies([...selectedSpecies, species]);
            setPondPlan([...pondPlan, { speciesId: species.SpeciesId, quantity: 1000 }]);
        }
    };

    const updateQuantity = (speciesId, val) => {
        const qty = parseInt(val) || 0;
        setPondPlan(pondPlan.map(p => p.speciesId === speciesId ? { ...p, quantity: qty } : p));
    };

    const totalArea = areaUsage?.totalArea || farmDetails?.TotalAreaAcres || 0;
    const usedArea = areaUsage?.usedArea !== undefined ? areaUsage.usedArea : ponds.reduce((sum, p) => sum + p.size, 0);
    const availableArea = areaUsage?.remainingArea !== undefined ? areaUsage.remainingArea : Math.max(0, totalArea - usedArea);
    const capacityUsed = areaUsage?.capacityUsedPercentage !== undefined
        ? areaUsage.capacityUsedPercentage
        : (totalArea > 0 ? Math.round((usedArea / totalArea) * 100) : 0);

    const totalFish = ponds.reduce((sum, p) =>
        sum + (p.species || []).reduce((acc, s) => acc + (Number(s.quantity || 0)), 0), 0
    );

    // Calculate dimensions whenever the plan changes
    useEffect(() => {
        if (selectedSpecies.length === 0) return;
        const timeoutId = setTimeout(async () => {
            setCalculating(true);
            try {
                // Use farmApi to calculate dimensions
                const resData = await farmApi.calculatePondSpecs(pondPlan, totalArea, pondStage, cultivationType);
                if (resData.success) {
                    setPondSpecs(resData.data);
                }
            } catch (err) {
                console.error("Calculation failed:", err);
            } finally {
                setCalculating(false);
            }
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [pondPlan, selectedSpecies.length, totalArea, pondStage, cultivationType]);

    const handleProvision = async () => {
        setProvisioning(true);
        setError("");
        try {
            const provisionData = { ...pondSpecs, cultivationType };
            const res = await farmApi.provisionPond({
                pondPlan,
                pondSpecs: provisionData
            });
            if (res.success || res.pondId) {
                // Return to dashboard
                router.push("/dashboard");
            } else {
                setError(res.error || "Provisioning failed.");
            }
        } catch (err) {
            setError(err.message || "Failed to provision new pond.");
        } finally {
            setProvisioning(false);
        }
    };

    if (loading && !farmDetails) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Waves className="animate-bounce text-blue-600" size={48} />
                    <p className="text-gray-500 font-medium">Loading Farm Planner...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 sm:p-10 font-sans">
            <div className="max-w-[1280px] mx-auto space-y-6 sm:space-y-10">

                {/* Optimized Header for Mobile */}
                <div className="text-center space-y-2 pb-2">
                    <h1 className="text-[24px] sm:text-[28px] font-black text-gray-900 tracking-tight">Farm Planner</h1>
                    <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium tracking-tight">Design & Provision an Optimal Grow-out Pond</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Section 1: Your Farm Overview */}
                <div className="bg-white rounded-[6px] border border-gray-300 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5 sm:p-8 space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-2.5">
                        <LayoutDashboard size={18} className="text-gray-400" />
                        <h2 className="text-[15px] font-bold text-gray-800">Your Farm Overview</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#EEF2FF] rounded-[4px] border border-gray-300 p-6 pr-12 min-h-[100px] flex flex-col justify-between">
                            <p className="text-[13px] font-bold text-gray-900">Total Ponds</p>
                            <p className="text-[18px] font-bold text-blue-600 leading-none">{ponds.length}</p>
                        </div>
                        <div className="bg-[#F0FAF5] rounded-[4px] border border-gray-300 p-6 pr-12 min-h-[100px] flex flex-col justify-between">
                            <p className="text-[13px] font-bold text-gray-900">Total Area</p>
                            <p className="text-[18px] font-bold text-green-600 leading-none">{totalArea} acres</p>
                        </div>
                        <div className="bg-[#EFF6FF] rounded-[4px] border border-gray-300 p-6 pr-12 min-h-[100px] flex flex-col justify-between">
                            <p className="text-[13px] font-bold text-gray-900">Used Area</p>
                            <p className="text-[18px] font-bold text-blue-600 leading-none">{usedArea.toFixed(1)} acres</p>
                        </div>
                        <div className="bg-[#FFF8F1] rounded-[4px] border border-gray-300 p-6 pr-12 min-h-[100px] flex flex-col justify-between">
                            <p className="text-[13px] font-bold text-gray-900">Available Area</p>
                            <p className="text-[18px] font-bold text-orange-600 leading-none">{availableArea.toFixed(1)} acres</p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Interactive Pond Designer */}
                <div className="bg-white rounded-[6px] border border-gray-300 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6 sm:p-10 space-y-8 sm:space-y-10">
                    <div className="flex items-center gap-2.5">
                        <Lightbulb size={18} className="text-gray-400" />
                        <h2 className="text-[15px] font-bold text-gray-800">Polyculture Designer</h2>
                    </div>

                    {/* Step 2A: Pond Stage Selection */}
                    <div className="space-y-4">
                        <p className="text-[13px] font-bold text-gray-900">1. Select Pond Stage</p>
                        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
                            <button
                                onClick={() => setPondStage('Grow-out')}
                                className={`flex-1 sm:px-8 py-2 text-sm font-bold rounded-lg transition-all ${pondStage === 'Grow-out' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Grow-out Pond
                            </button>
                            <button
                                onClick={() => setPondStage('Nursery')}
                                className={`flex-1 sm:px-8 py-2 text-sm font-bold rounded-lg transition-all ${pondStage === 'Nursery' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Nursery Pond
                            </button>
                        </div>
                    </div>

                    {/* Step 2B: Cultivation Type Selection */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                        <p className="text-[13px] font-bold text-gray-900">2. Select Cultivation Type</p>
                        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
                            <button
                                onClick={() => setCultivationType('Extensive')}
                                className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${cultivationType === 'Extensive' ? 'bg-white shadow-sm text-green-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Extensive
                            </button>
                            <button
                                onClick={() => setCultivationType('Semi-Intensive')}
                                className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${cultivationType === 'Semi-Intensive' ? 'bg-white shadow-sm text-green-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Semi-Intensive
                            </button>
                            <button
                                onClick={() => setCultivationType('Intensive')}
                                className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${cultivationType === 'Intensive' ? 'bg-white shadow-sm text-green-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Intensive
                            </button>
                        </div>
                    </div>

                    {/* Step 2C: Species Selection */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                        <p className="text-[13px] font-bold text-gray-900">3. Select Species (Max 3)</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {availableSpecies.map(sp => {
                                const allowed = isSpeciesAllowed(sp.SpeciesId);
                                const selected = selectedSpecies.some(s => s.SpeciesId === sp.SpeciesId);
                                return (
                                    <div
                                        key={sp.SpeciesId}
                                        onClick={() => allowed && toggleSpecies(sp)}
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all select-none
                                            ${selected ? 'border-[#1b64f2] bg-blue-50' :
                                                allowed ? 'border-gray-200 hover:border-blue-300 cursor-pointer' :
                                                    'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0
                                            ${selected ? 'bg-[#1b64f2] border-[#1b64f2]' : 'bg-white border-gray-300'}`}>
                                            {selected && <Check size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${selected ? 'text-blue-900' : 'text-gray-900'}`}>{sp.Name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{sp.FeedingZone || 'Mixed Zone'}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Step 2D: Quantity Input & Dimensions */}
                    {selectedSpecies.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-gray-200">
                            <p className="text-[13px] font-bold text-gray-900">4. Target Quantities</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    {selectedSpecies.map(sp => {
                                        const qty = pondPlan.find(p => p.speciesId === sp.SpeciesId)?.quantity || 0;
                                        return (
                                            <div key={sp.SpeciesId} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <span className="font-bold text-gray-800 text-[14px]">{sp.Name}</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="10" step="10"
                                                        value={qty}
                                                        onChange={(e) => updateQuantity(sp.SpeciesId, e.target.value)}
                                                        className="w-24 text-right border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#1b64f2] font-medium outline-none"
                                                    />
                                                    <span className="text-[13px] text-gray-500 font-medium w-6">fish</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Live Calculator Results */}
                                <div className="bg-[#F0F7FF] rounded-xl p-6 border border-blue-200 relative overflow-hidden flex flex-col justify-center">
                                    {calculating && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 transition">
                                            <Loader2 className="animate-spin text-[#1b64f2]" />
                                        </div>
                                    )}
                                    <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-3 mb-4 text-[14px]">Calculated Dimensions</h4>

                                    {pondSpecs ? (
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            <div>
                                                <p className="text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">Required Area</p>
                                                <p className={`text-[18px] font-black ${pondSpecs.targetArea > availableArea ? 'text-red-600' : 'text-blue-900'}`}>
                                                    {pondSpecs.targetArea} ac
                                                </p>
                                                {pondSpecs.targetArea > availableArea && (
                                                    <p className="text-[11px] text-red-500 font-bold mt-1">Exceeds {availableArea.toFixed(1)} ac available!</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">Depth Requirement</p>
                                                <p className="text-blue-900 text-[18px] font-black">{pondSpecs.recommendedDepthFeet} ft</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">Physical Perimeter</p>
                                                <p className="text-blue-900 text-[16px] font-bold">L: {pondSpecs.recommendedLengthFeet}' &times; W: {pondSpecs.recommendedWidthFeet}'</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-blue-700">Select species and enter quantities to see recommendations.</p>
                                    )}
                                </div>
                            </div>

                            {/* Add Button */}
                            <div className="pt-6">
                                <button
                                    disabled={provisioning || !pondSpecs || pondSpecs.targetArea > availableArea || pondSpecs.targetArea <= 0}
                                    onClick={handleProvision}
                                    className="w-full py-4 bg-[#00B050] text-white font-bold text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-[#009040] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                                >
                                    {provisioning ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} strokeWidth={4} />}
                                    Provision & Stock New Pond
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
