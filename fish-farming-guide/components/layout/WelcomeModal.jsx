"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { farmApi } from "../../integration/farmApi";
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl border border-slate-200 flex items-center justify-center">
            <p className="text-sm text-slate-400">Loading Map...</p>
        </div>
    )
});

export default function WelcomeModal({ isOpen, onClose, onComplete, onSkip }) {
    const [step, setStep] = useState(1);

    // Step 1: Farm Data
    const [totalArea, setTotalArea] = useState("");
    const [regionId, setRegionId] = useState("");
    const [regionName, setRegionName] = useState("");
    const [location, setLocation] = useState(null);

    // Step 2: Species Selection Data
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState([]); // Array of Species objects
    const [compatibilityMap, setCompatibilityMap] = useState({}); // { speciesId: [compatId1, compatId2] }
    const [cultivationType, setCultivationType] = useState('Extensive');

    // Step 3: Quantities and Pond Calculation
    const [pondPlan, setPondPlan] = useState([]); // Array of { speciesId, quantity }
    const [pondSpecs, setPondSpecs] = useState(null);

    // Global UI States
    const [regionsList, setRegionsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [calculating, setCalculating] = useState(false);

    // Load Initial Data (Regions)
    useEffect(() => {
        if (isOpen) {
            const fetchRegions = async () => {
                setLoading(true);
                try {
                    const regions = await farmApi.getRegions();
                    setRegionsList(regions || []);
                } catch (err) {
                    setError("Failed to load regions.");
                } finally {
                    setLoading(false);
                }
            };
            fetchRegions();
        }
    }, [isOpen]);

    // Step 1 -> Step 2: Fetch Regional Species
    const handleNextToSpecies = async () => {
        if (!totalArea || !regionId) return;
        setStep(2);
        setLoading(true);
        try {
            // Use farmApi to correctly resolve backend base URL on mobile
            const data = await farmApi.getRegionalSpecies(regionName);
            setAvailableSpecies(data || []);

            // Also build a basic compatibility map
            const compMap = {};
            for (const sp of data) {
                try {
                    const compData = await farmApi.getSpeciesCompatibility(sp.SpeciesId);
                    compMap[sp.SpeciesId] = (compData || []).map(c =>
                        c.MainSpeciesName === sp.Name ?
                            data.find(d => d.Name === c.CompatibleSpeciesName)?.SpeciesId :
                            data.find(d => d.Name === c.MainSpeciesName)?.SpeciesId
                    ).filter(Boolean);
                } catch (e) {
                    compMap[sp.SpeciesId] = [];
                }
            }
            setCompatibilityMap(compMap);

        } catch (err) {
            setError("Failed to load regional species.");
        } finally {
            setLoading(false);
        }
    };

    // Handle Species Checkbox Selection
    const toggleSpecies = (species) => {
        const isSelected = selectedSpecies.some(s => s.SpeciesId === species.SpeciesId);
        if (isSelected) {
            const updated = selectedSpecies.filter(s => s.SpeciesId !== species.SpeciesId);
            setSelectedSpecies(updated);
            // reset pond plan matching this species
            setPondPlan(pondPlan.filter(p => p.speciesId !== species.SpeciesId));
        } else {
            if (selectedSpecies.length >= 3) {
                alert("Maximum 3 species allowed for polyculture.");
                return;
            }
            setSelectedSpecies([...selectedSpecies, species]);
            setPondPlan([...pondPlan, { speciesId: species.SpeciesId, quantity: 1000 }]); // Default qty
        }
    };

    // Is a species allowed to be selected based on current selections?
    const isSpeciesAllowed = (speciesId) => {
        if (selectedSpecies.length === 0) return true;
        // If it's already selected, let them deselect it
        if (selectedSpecies.some(s => s.SpeciesId === speciesId)) return true;

        // Every currently selected species MUST be compatible with this new one
        return selectedSpecies.every(selected => {
            const allowedPartners = compatibilityMap[selected.SpeciesId] || [];
            return allowedPartners.includes(speciesId);
        });
    };

    // Step 2 -> Step 3: Moving to Quantities
    const handleNextToQuantities = () => {
        if (selectedSpecies.length === 0) {
            alert("Please select at least one species.");
            return;
        }
        setStep(3);
        calculateDimensions(pondPlan, cultivationType);
    };

    // Calculate dimensions when quantities change
    const updateQuantity = (speciesId, newQty) => {
        const newPlan = pondPlan.map(p => p.speciesId === speciesId ? { ...p, quantity: Number(newQty) } : p);
        setPondPlan(newPlan);
        calculateDimensions(newPlan, cultivationType);
    };

    const calculateDimensions = async (plan, cultType = cultivationType) => {
        setCalculating(true);
        try {
            const result = await farmApi.calculatePondSpecs(plan, Number(totalArea), 'Nursery', cultType);
            if (result.success) {
                setPondSpecs(result.data);
            }
        } catch (err) {
            console.error("Calculation error", err);
        } finally {
            setCalculating(false);
        }
    };

    const handleComplete = async () => {
        if (pondSpecs?.requiredAcres > pondSpecs?.fixedNurseryArea) {
            alert(`Your stocking requires ${pondSpecs.requiredAcres} acres, which exceeds the allowed ${pondSpecs.fixedNurseryArea} acre limit for your Nursery pond. Please reduce your fish quantities.`);
            return;
        }

        setSaving(true);
        setError("");
        try {
            const result = await farmApi.setupFarm({
                totalArea: Number(totalArea),
                regionId: Number(regionId),
                latitude: location?.lat || null,
                longitude: location?.lng || null,
                pondPlan: pondPlan,
                pondSpecs: pondSpecs
            });

            if (result.success) {
                onComplete({
                    totalArea: Number(totalArea),
                    regionId: Number(regionId),
                    farmId: result.farmId
                });
            } else {
                setError(result.error || "Setup failed.");
            }
        } catch (err) {
            console.error("Setup Error:", err);
            setError(err.message || "Failed to set up farm.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b shrink-0 relative">
                    <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Setup Farm</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Step {step} of 3: {step === 1 ? 'Farm Area & Location' : step === 2 ? 'Species Selection' : 'Stocking Quantities'}
                    </p>
                </div>

                {/* Form Body Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* STEP 1: Basic Farm Details */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                <h3 className="text-sm font-semibold text-blue-900">How It Works</h3>
                                <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                                    Welcome! Tell us about your farm layout and we'll automatically engineer perfect pond dimensions and multi-species polyculture stocking plans optimized for your region.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Usable Area (acres)</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.1"
                                    placeholder="e.g. 5"
                                    value={totalArea}
                                    onChange={(e) => setTotalArea(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Region</label>
                                <select
                                    value={regionId}
                                    onChange={(e) => {
                                        setRegionId(e.target.value);
                                        const reg = regionsList.find(r => String(r.RegionId) === e.target.value);
                                        if (reg) setRegionName(reg.Name);
                                    }}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{loading ? "Loading..." : "Select Region"}</option>
                                    {regionsList.map(r => (
                                        <option key={r.RegionId} value={r.RegionId}>{r.Name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* <div className="pt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <LocationPickerMap onLocationSelect={setLocation} />
                            </div> */}
                        </div>
                    )}

                    {/* STEP 2: Species Selection */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            {/* Cultivation Type Selection */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold text-gray-800">Cultivation Type</h3>
                                <p className="text-xs text-gray-500">Choose your farming intensity to calculate stock densities correctly.</p>
                                <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                                    <button
                                        onClick={() => setCultivationType('Extensive')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${cultivationType === 'Extensive' ? 'bg-white shadow-sm text-green-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Extensive
                                    </button>
                                    <button
                                        onClick={() => setCultivationType('Semi-Intensive')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${cultivationType === 'Semi-Intensive' ? 'bg-white shadow-sm text-green-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Semi-Intensive
                                    </button>
                                    <button
                                        onClick={() => setCultivationType('Intensive')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${cultivationType === 'Intensive' ? 'bg-white shadow-sm text-green-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Intensive
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                                <h3 className="text-sm font-bold text-blue-800">Polyculture Rules</h3>
                                <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                                    <li>Select up to 3 compatible species to grow together perfectly.</li>
                                    <li>Incompatible species will automatically lock.</li>
                                </ul>
                            </div>

                            {loading ? (
                                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                            ) : availableSpecies.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4">No species found for your region.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {availableSpecies.map(sp => {
                                        const allowed = isSpeciesAllowed(sp.SpeciesId);
                                        const selected = selectedSpecies.some(s => s.SpeciesId === sp.SpeciesId);
                                        return (
                                            <div
                                                key={sp.SpeciesId}
                                                onClick={() => allowed && toggleSpecies(sp)}
                                                className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all select-none
                                                    ${selected ? 'border-blue-600 bg-blue-50' :
                                                        allowed ? 'border-gray-200 hover:border-blue-300 cursor-pointer' :
                                                            'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0
                                                    ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                                    {selected && <Check size={14} className="text-white" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${selected ? 'text-blue-900' : 'text-gray-900'}`}>{sp.Name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{sp.FeedingZone || 'Mixed Zone'}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Quantities & Live Math */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-gray-600">Enter how many fingerlings of each species you want to stock. We will calculate the perfect pond dimensions.</p>

                            <div className="space-y-4">
                                {selectedSpecies.map(sp => {
                                    const qty = pondPlan.find(p => p.speciesId === sp.SpeciesId)?.quantity || 0;
                                    const breakdown = pondSpecs?.speciesBreakdown?.find(b => b.speciesId === sp.SpeciesId);
                                    const feedingZone = breakdown?.feedingZone || sp.FeedingZone || 'Column';
                                    const zonePercent = breakdown?.zonePercent || (feedingZone === 'Column' ? 40 : 30);
                                    const maxAllowed = breakdown?.maxAllowed || 0;
                                    return (
                                        <div key={sp.SpeciesId} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-gray-900 text-sm">{sp.Name}</span>
                                                        <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                                            {feedingZone} feeder &middot; {zonePercent}%
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                                                        Max allowed: {maxAllowed.toLocaleString()} fish
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="10" step="10"
                                                        max={maxAllowed}
                                                        value={qty}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            updateQuantity(sp.SpeciesId, val > maxAllowed ? maxAllowed : val);
                                                        }}
                                                        className={`w-24 text-right border rounded-md px-2 py-1 text-sm font-medium focus:ring-blue-500 ${qty > maxAllowed ? 'border-red-400 bg-red-50 text-red-700' : ''}`}
                                                    />
                                                    <span className="text-xs text-gray-500">fish</span>
                                                </div>
                                            </div>
                                            {qty > maxAllowed && maxAllowed > 0 && (
                                                <p className="text-xs text-red-600 font-semibold mt-2">⚠ Exceeds {zonePercent}% ratio limit for {feedingZone} feeders</p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Live Dashboard */}
                            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 relative overflow-hidden">
                                {calculating && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 transition">
                                        <Loader2 className="animate-spin text-emerald-600" />
                                    </div>
                                )}
                                <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-2 mb-3 text-sm">Engineered Pond Dimensions</h4>
                                {pondSpecs ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-0.5">Stock Capacity</p>
                                            <p className={`text-lg font-black ${pondSpecs.requiredAcres > pondSpecs.fixedNurseryArea ? 'text-red-600' : 'text-emerald-900'}`}>
                                                {pondSpecs.requiredAcres} / {pondSpecs.fixedNurseryArea} ac
                                                {pondSpecs.requiredAcres > pondSpecs.fixedNurseryArea && <span className="block text-xs text-red-500 font-medium leading-tight mt-1">Exceeds allowed {pondSpecs.fixedNurseryArea} acre Nursery limit!</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-0.5">Physical Size</p>
                                            <p className="text-emerald-900 font-bold">L: {pondSpecs.recommendedLengthFeet}' &times; W: {pondSpecs.recommendedWidthFeet}'</p>
                                        </div>
                                        <div>
                                            <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-0.5">Deepest Point</p>
                                            <p className="text-emerald-900 font-bold">{pondSpecs.recommendedDepthFeet} ft</p>
                                        </div>
                                        <div>
                                            <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-0.5">Water Volume</p>
                                            <p className="text-emerald-900 font-bold">{pondSpecs.estimatedVolumeGallons?.toLocaleString()} gal</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-emerald-700">Awaiting calculations...</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-0 shrink-0">
                    <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                        {step === 1 ? (
                            <button onClick={onSkip} className="w-full sm:w-auto text-gray-500 text-sm hover:text-gray-800 font-medium px-4 py-2">Skip Setup</button>
                        ) : (
                            <button onClick={() => setStep(step - 1)} className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm hover:text-gray-800 font-medium px-4 py-2">
                                <ArrowLeft size={16} /> Back
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {step === 1 && (
                            <button disabled={!totalArea || !regionId} onClick={handleNextToSpecies} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1b64f2] text-white px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                                Next Step <ArrowRight size={16} />
                            </button>
                        )}
                        {step === 2 && (
                            <button disabled={selectedSpecies.length === 0} onClick={handleNextToQuantities} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1b64f2] text-white px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                                Plan Stock <ArrowRight size={16} />
                            </button>
                        )}
                        {step === 3 && (
                            <button disabled={saving || !pondSpecs || pondSpecs.requiredAcres > pondSpecs.fixedNurseryArea} onClick={handleComplete} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1b64f2] text-white px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Provision Farm
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

