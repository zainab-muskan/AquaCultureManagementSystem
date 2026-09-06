"use client";

import { useState, useEffect } from "react";
import { X, Plus, ChevronDown, Check, Info, AlertCircle } from "lucide-react";
import { farmApi } from "@/integration/farmApi"; // Import API

export default function AddPondModal({
    isOpen,
    onClose,
    availableArea,
    totalArea,
    usedArea,
    onAdd,
    farmRegionName
}) {

    const [formData, setFormData] = useState({
        name: "",
        size: "",
        pondType: "Grown-out", // UI: Pond Type -> Backend: Stage
        pondStructure: "",     // UI: Pond Structure -> Backend: PondType
        pondShape: "Rectangle", // UI: Pond Shape -> Backend logic
        cultivationType: "",   // UI: Cultivation Intensity -> Backend: CultivationType
        cultureType: "Polyculture", // STRICT DEFAULT TO PREVENT MOBILE FALLBACK BUGS
    });

    const [options, setOptions] = useState({
        pondTypes: ["Earthen Pond", "Concrete Pond", "Lined Pond"], // Fallback defaults
        cultureTypes: ["Monoculture", "Polyculture"],
        cultivationTypes: ["Extensive", "Semi-Intensive", "Intensive"],
        stages: ["Grown-out", "Nursery","Junveline"]
    });

    // --- NEW: Dimensions State ---
    const [recommendations, setRecommendations] = useState(null);
    const [useManualDimensions, setUseManualDimensions] = useState(false);
    const [manualDimensions, setManualDimensions] = useState({
        length: "",
        width: "",
        depth: ""
    });

    // --- NEW: Biological State for Dynamic Sizing ---
    const [availableSpecies, setAvailableSpecies] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState([]); // Array of Species objects
    const [compatibilityMap, setCompatibilityMap] = useState({}); // { speciesId: [compatId1, compatId2] }
    const [pondPlan, setPondPlan] = useState([]); // Array of { speciesId, quantity }
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load base dropdown options
            farmApi.getPondOptions()
                .then(data => {
                    if (data) setOptions(prev => ({ ...prev, ...data }));
                })
                .catch(err => console.error("Failed to fetch options, using defaults:", err));

            // Load regional species for dynamic math
            if (farmRegionName) {
                farmApi.getRegionalSpecies(farmRegionName)
                    .then(async (data) => {
                        setAvailableSpecies(data);
                        const cmap = {};
                        for (const sp of data) {
                            try {
                                const compData = await farmApi.getSpeciesCompatibility(sp.SpeciesId);
                                cmap[sp.SpeciesId] = (compData || []).map(c =>
                                    c.MainSpeciesName === sp.Name ?
                                        data.find(d => d.Name === c.CompatibleSpeciesName)?.SpeciesId :
                                        data.find(d => d.Name === c.MainSpeciesName)?.SpeciesId
                                ).filter(Boolean);
                            } catch (err) {
                                cmap[sp.SpeciesId] = [];
                            }
                        }
                        setCompatibilityMap(cmap);
                    })
                    .catch(err => console.error("Failed to load regional species:", err));
            }
        } else {
            // Reset Biological State on close
            setSelectedSpecies([]);
            setPondPlan([]);
            setRecommendations(null);
            setUseManualDimensions(false);
        }
    }, [isOpen, farmRegionName]);

    // --- NEW: Real-time Calculation Engine ---
    useEffect(() => {
        if (selectedSpecies.length > 0 && formData.pondStructure && formData.pondType && formData.cultivationType && formData.pondShape && !useManualDimensions) {
            const delayDebounce = setTimeout(async () => {
                setCalculating(true);
                try {
                    // Send plan + user-entered size so backend can compute capacity limits based on actual pond size
                    const result = await farmApi.calculatePondSpecs(pondPlan, availableArea, formData.pondType, formData.cultivationType, formData.pondStructure, formData.pondShape, formData.size || null);

                    if (result.success && result.data) {
                        setRecommendations({
                            size: result.data.requiredAcres,
                            length: result.data.recommendedLengthFeet,
                            width: result.data.recommendedWidthFeet,
                            depth: result.data.recommendedDepthFeet,
                            volume: result.data.estimatedVolumeLiters,
                            volumeGallons: result.data.estimatedVolumeGallons,
                            speciesBreakdown: result.data.speciesBreakdown,
                            totalCapacity: result.data.totalCapacity
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch calculated specs:", err);
                } finally {
                    setCalculating(false);
                }
            }, 500); // Debounce to allow user to finish typing quantities

            return () => clearTimeout(delayDebounce);
        } else if (selectedSpecies.length === 0) {
            setRecommendations(null); // Clear recommendations if no fish
        }
    }, [pondPlan, selectedSpecies.length, formData.pondStructure, formData.pondType, formData.cultivationType, formData.pondShape, formData.size, useManualDimensions, availableArea]);

    // --- Culture Type Change Handler ---
    // If the user switches back to Monoculture while having 2+ species, clear them and reset.
    useEffect(() => {
        if (formData.cultureType === 'Monoculture' && selectedSpecies.length > 1) {
            setSelectedSpecies([]);
            setPondPlan([]);
        }
    }, [formData.cultureType]);

    // --- Species Selection Logic ---
    const isSpeciesAllowed = (speciesId) => {
        if (selectedSpecies.length === 0) return true;
        if (formData.cultureType === 'Monoculture' && selectedSpecies.length >= 1) {
            return selectedSpecies.some(s => s.SpeciesId === speciesId);
        }

        if (selectedSpecies.some(s => s.SpeciesId === speciesId)) return true;

        return selectedSpecies.every(selected => {
            const allowedPartners = compatibilityMap[selected.SpeciesId] || [];
            return allowedPartners.includes(speciesId);
        });
    };

    const toggleSpecies = (species) => {
        const isSelected = selectedSpecies.some(s => s.SpeciesId === species.SpeciesId);
        if (isSelected) {
            setSelectedSpecies(selectedSpecies.filter(s => s.SpeciesId !== species.SpeciesId));
            setPondPlan(pondPlan.filter(p => p.speciesId !== species.SpeciesId));
        } else {
            const maxAllowed = formData.cultureType === 'Monoculture' ? 1 : 3;
            if (selectedSpecies.length < maxAllowed) {
                setSelectedSpecies([...selectedSpecies, species]);
                setPondPlan([...pondPlan, { speciesId: species.SpeciesId, quantity: 1000 }]); // Default qty
            } else {
                alert(`Maximum ${maxAllowed} species allowed for ${formData.cultureType}.`);
            }
        }
    };

    const updateQuantity = (speciesId, newQty) => {
        setPondPlan(pondPlan.map(p => p.speciesId === speciesId ? { ...p, quantity: Number(newQty) } : p));
    };


    if (!isOpen) return null;

    // --- AREA VALIDATION & PRECISION FIXES ---
    const enteredSize = Number(formData.size || 0);
    const isOverLimit = enteredSize > Number(availableArea.toFixed(4));

    // Validation
    const isValid = formData.name &&
        formData.size &&
        !isOverLimit &&
        formData.pondType &&
        formData.pondStructure &&
        formData.cultivationType &&
        formData.cultureType &&
        selectedSpecies.length > 0 &&
        (useManualDimensions ? (manualDimensions.length && manualDimensions.width && manualDimensions.depth) : true);

    const handleSubmit = () => {
        if (!isValid) return;

        // Determine final dimensions
        let finalDims = {};
        if (useManualDimensions) {
            finalDims = {
                LengthFeet: manualDimensions.length,
                WidthFeet: manualDimensions.width,
                DepthFeet: manualDimensions.depth,
                // Volume can be calculated or let backend handle it, but for now let's send what we have
                // Backend creates Volume if missing
            };
        } else if (recommendations) {
            finalDims = {
                LengthFeet: recommendations.length,
                WidthFeet: recommendations.width,
                DepthFeet: recommendations.depth,
                VolumeLiters: recommendations.volume
            };
        }

        // Map UI fields to Backend Schema expected by DashboardPage/API
        onAdd({
            pondName: formData.name,
            size: formData.size,
            pondType: formData.pondStructure,      // Backend: PondType (Earthen, etc.)
            cultivationType: formData.cultivationType, // Backend: CultivationType
            cultureType: formData.cultureType,     // Backend: CultureType
            stage: formData.pondType,               // Backend: Stage (Nursery/Grow-out)
            ...finalDims,
            pondPlan // <--- IMPORTANT: We pass the exact species and quantities array out
        });
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex justify-between items-start bg-white shrink-0 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Pond</h2>
                        <p className="text-sm text-gray-600 mt-1 font-medium">Enter your pond details to start tracking</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-5 sm:px-6 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Area Info Banner */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-900 font-semibold text-sm">Available Area:</span>
                            <span className="text-blue-700 font-bold text-base">{Math.max(0, availableArea).toFixed(2)} acres</span>
                        </div>
                        <p className="text-xs text-blue-800 font-bold">
                            Total: {totalArea.toFixed(2)} acres • Used: {usedArea.toFixed(2)} acres
                        </p>
                    </div>

                    {/* Pond Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">Pond Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Main Pond 1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Size */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">Size (acres)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="e.g., 1.5"
                                step="0.01"
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm font-bold focus:ring-2 outline-none transition-all placeholder:text-gray-400
                                    ${isOverLimit
                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50 text-red-900'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900'}`}
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            />
                        </div>
                        <p className={`text-xs mt-1.5 ${isOverLimit ? 'text-red-600 font-bold' : 'text-gray-500 font-bold'}`}>
                            {isOverLimit ? `Exceeds available ${availableArea.toFixed(2)} acres` : `Maximum: ${availableArea.toFixed(2)} acres`}
                        </p>
                    </div>

                    {/* Pond Type (Stage) */}
                    <Select
                        label="Pond Type"
                        value={formData.pondType}
                        onChange={(v) => setFormData({ ...formData, pondType: v })}
                        placeholder="Select pond type..."
                    >
                        {options.stages.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>

                    {/* Pond Structure (Backend: PondType) */}
                    <Select
                        label="Pond Structure"
                        placeholder="Select pond structure..."
                        value={formData.pondStructure}
                        onChange={(v) => setFormData({ ...formData, pondStructure: v })}
                    >
                        {options.pondTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>

                    {/* Pond Shape */}
                    <Select
                        label="Pond Shape"
                        value={formData.pondShape}
                        onChange={(v) => setFormData({ ...formData, pondShape: v })}
                    >
                        <option value="Rectangle">Rectangle</option>
                        <option value="Square">Square</option>
                        <option value="Circular">Circular</option>
                    </Select>

                    {/* Cultivation Intensity */}
                    <Select
                        label="Cultivation Intensity"
                        placeholder="Select cultivation intensity..."
                        value={formData.cultivationType}
                        onChange={(v) => setFormData({ ...formData, cultivationType: v })}
                    >
                        {options.cultivationTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>

                    {/* Culture Type */}
                    <Select
                        label="Culture Type"
                        placeholder="Select culture type..."
                        value={formData.cultureType}
                        onChange={(v) => setFormData({ ...formData, cultureType: v })}
                    >
                        {options.cultureTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>

                    {/* --- NEW: SPECIES SELECTION GRID --- */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-800">Select Species (Max 3)</label>
                        {availableSpecies.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Please select a compatible region on your Farm settings to load species.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                                {availableSpecies.map(sp => {
                                    const allowed = isSpeciesAllowed(sp.SpeciesId);
                                    const selected = selectedSpecies.some(s => s.SpeciesId === sp.SpeciesId);
                                    return (
                                        <div
                                            key={sp.SpeciesId}
                                            onClick={() => allowed && toggleSpecies(sp)}
                                            className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all select-none
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
                        )}
                    </div>

                    {/* --- NEW: QUANTITIES --- */}
                    {selectedSpecies.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-800">Target Quantities</label>
                            {selectedSpecies.map(sp => {
                                const qty = pondPlan.find(p => p.speciesId === sp.SpeciesId)?.quantity || 0;
                                const breakdown = recommendations?.speciesBreakdown?.find(b => b.speciesId === sp.SpeciesId);
                                const feedingZone = breakdown?.feedingZone || sp.FeedingZone || 'Column';
                                const zonePercent = breakdown?.zonePercent || (feedingZone === 'Column' ? 40 : 30);
                                const maxAllowed = breakdown?.maxAllowed || 0;
                                return (
                                    <div key={sp.SpeciesId} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-gray-900 text-[14px]">{sp.Name}</span>
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
                                                        updateQuantity(sp.SpeciesId, val > maxAllowed && maxAllowed > 0 ? maxAllowed : val);
                                                    }}
                                                    className={`w-24 text-right border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#1b64f2] font-medium outline-none ${qty > maxAllowed && maxAllowed > 0 ? 'border-red-400 bg-red-50 text-red-700' : ''}`}
                                                />
                                                <span className="text-[13px] text-gray-500 font-medium w-6">fish</span>
                                            </div>
                                        </div>
                                        {qty > maxAllowed && maxAllowed > 0 && (
                                            <p className="text-xs text-red-600 font-semibold mt-2">⚠ Exceeds {zonePercent}% ratio limit for {feedingZone} feeders</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* --- RECOMMENDATIONS CARD --- */}
                    {recommendations && !useManualDimensions && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
                                    Recommended Pond Dimensions:
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
                                <div className="bg-white p-2 rounded border border-green-200">
                                    <span className="block text-xs text-gray-500 font-bold">Length</span>
                                    <span className="block font-black text-gray-900">{recommendations.length} ft</span>
                                    <span className="block text-xs text-gray-500 font-medium">({Math.round(recommendations.length * 0.3048)} m)</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-green-200">
                                    <span className="block text-xs text-gray-500 font-bold">Width</span>
                                    <span className="block font-black text-gray-900">{recommendations.width} ft</span>
                                    <span className="block text-xs text-gray-500 font-medium">({Math.round(recommendations.width * 0.3048)} m)</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-green-200">
                                    <span className="block text-xs text-gray-500 font-bold">Depth</span>
                                    <span className="block font-black text-gray-900">{recommendations.depth} ft</span>
                                    <span className="block text-xs text-gray-500 font-medium">{formData.pondStructure === 'Concrete Pond' ? '5-6 ft' : '4-6 ft'}</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-green-200">
                                    <span className="block text-xs text-gray-500 font-bold">Volume</span>
                                    <span className="block font-black text-gray-900">{(recommendations.volumeGallons || 0).toLocaleString()} Gal</span>
                                    <span className="block text-xs text-gray-500 font-medium" title={`${recommendations.volume.toLocaleString()} Liters`}>({Math.round(recommendations.volume / 1000)} m³)</span>
                                </div>
                            </div>
                            <p className="text-xs text-green-700">
                                Ratio: {formData.pondStructure === 'Concrete Pond' ? '2.0:1' : '2.5:1'} (Length:Width) for optimal water circulation
                            </p>
                        </div>
                    )}

                    {/* --- MANUAL DIMENSIONS TOGGLE --- */}
                    <div className="border border-gray-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={useManualDimensions}
                                onChange={(e) => setUseManualDimensions(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm font-bold text-gray-800">I have different pond dimensions</span>
                        </label>

                        {/* Manual Inputs */}
                        {useManualDimensions && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-3 text-sm text-gray-700 font-bold">
                                    Enter Your Actual Pond Dimensions:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 font-bold mb-1">Length (feet)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
                                            placeholder="e.g. 330"
                                            value={manualDimensions.length}
                                            onChange={(e) => setManualDimensions({ ...manualDimensions, length: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 font-bold mb-1">Width (feet)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
                                            placeholder="e.g. 132"
                                            value={manualDimensions.width}
                                            onChange={(e) => setManualDimensions({ ...manualDimensions, width: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 font-bold mb-1">Depth (feet)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
                                            placeholder="e.g. 6.5"
                                            value={manualDimensions.depth}
                                            onChange={(e) => setManualDimensions({ ...manualDimensions, depth: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-bold">
                                    <Info size={12} className="text-blue-600" />
                                    Use your actual pond measurements.
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Footer Info */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-900">
                        <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <div>
                            <span className="font-semibold block mb-0.5">Add Fish Later:</span>
                            <span className="text-blue-800/80 leading-relaxed">After creating the pond, use the "Add Fish" button to stock it with fingerlings.</span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex flex-col sm:flex-row gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-1/3 order-2 sm:order-1 py-3.5 sm:py-3 rounded-xl text-sm font-black text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-all active:scale-95 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!isValid}
                        onClick={handleSubmit}
                        className={`w-full sm:w-2/3 order-1 sm:order-2 py-3.5 sm:py-3 rounded-xl text-sm font-black shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                            ${isValid
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"}`}
                    >
                        <Plus size={18} />
                        Add Pond
                    </button>
                </div>
            </div>
        </div>
    );
}

function Select({ label, value, onChange, placeholder, children }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all font-bold
                        ${value ? 'text-gray-900' : 'text-gray-400'}`}
                >
                    {placeholder && <option value="" disabled>{placeholder}</option>}
                    {children}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}


