"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function AddFishModal({
    isOpen,
    pondId,
    pondName = "General Pond",
    pondSize = 1,
    currentPondQuantity = 0,
    existingSpecies = [],
    cultureType,
    userProvince,
    onClose,
    onAdd
}) {
    const [dbSpecies, setDbSpecies] = useState([]);
    const [selectedSpeciesId, setSelectedSpeciesId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [currentSize, setCurrentSize] = useState("");
    const [targetSize, setTargetSize] = useState("");

    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Fetch species based on region
    useEffect(() => {
        if (isOpen && userProvince) {
            farmApi.getRegionalSpecies(userProvince)
                .then(data => {
                    setDbSpecies(data);
                    // Pre-select and lock if Monoculture with existing species
                    if (cultureType === "Monoculture" && existingSpecies?.length > 0) {
                        const existingMatch = data.find(s => s.Name === existingSpecies[0].species);
                        if (existingMatch) {
                            setSelectedSpeciesId(existingMatch.SpeciesId);
                        }
                    }
                })
                .catch(err => console.error("Regional Species API Error:", err));
        }
    }, [isOpen, userProvince, cultureType, existingSpecies]);

    // 2. Fetch stocking preview when quantity or species changes
    useEffect(() => {
        if (isOpen && pondId && selectedSpeciesId && quantity > 0) {
            const delayDebounce = setTimeout(() => {
                setError(null);
                farmApi.getStockingPreview(pondId, selectedSpeciesId, quantity)
                    .then(data => setPreview(data))
                    .catch(err => {
                        console.error("Preview Error:", err);
                        setError(err.message);
                        setPreview(null);
                    });
            }, 500);
            return () => clearTimeout(delayDebounce);
        } else {
            setPreview(null);
            setError(null);
        }
    }, [isOpen, pondId, selectedSpeciesId, quantity]);

    if (!isOpen) return null;

    const selectedSpecies = dbSpecies.find(s => String(s.SpeciesId) === String(selectedSpeciesId));
    const totalCost = (Number(quantity) || 0) * (Number(price) || 0);

    const isOverLimit = preview && preview.newTotal > preview.maximumCapacity;
    const isOverSpeciesLimit = preview && preview.maxQtyForThisSpecies && (preview.existingSpeciesQty + (Number(quantity) || 0)) > preview.maxQtyForThisSpecies;
    const isCompatible = preview ? preview.compatibility.isCompatible : true;
    const isValid = !!selectedSpeciesId && !!quantity && !!price && !!currentSize && !!targetSize && !isOverLimit && !isOverSpeciesLimit && !error && isCompatible;

    const handleSubmit = () => {
        if (!isValid) return;
        onAdd({
            pondId,
            speciesId: selectedSpeciesId,
            quantity,
            pricePerPiece: price,
            currentSize,
            targetSize,
            species: selectedSpecies.Name // For UI updates if needed
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2rem] shadow-2xl overflow-y-auto overscroll-contain animate-in fade-in zoom-in duration-300 border border-gray-100 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-start px-5 sm:px-8 pt-6 sm:pt-8 pb-2 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {pondName.toLowerCase().includes("nursery") ? "Add Fingerlings" : "Add Fish"}
                        </h2>
                        <p className="text-[13px] text-gray-600 mt-0.5 font-medium">Add fish to {pondName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-all group">
                        <X size={20} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                </div>

                <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-4 space-y-6">
                    {/* Species Selection */}
                    <div className="space-y-3">
                        <label className="block text-[13px] font-bold text-gray-800 ml-1">Fish Species</label>
                        <div className="relative group">
                            <select
                                value={selectedSpeciesId}
                                onChange={(e) => setSelectedSpeciesId(e.target.value)}
                                disabled={cultureType === "Monoculture" && existingSpecies?.length > 0}
                                className={`w-full appearance-none border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all pr-12
                                    ${cultureType === "Monoculture" && existingSpecies?.length > 0
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-50 hover:bg-white text-gray-900"}`}
                            >
                                <option value="">Select species...</option>
                                {dbSpecies.map(s => <option key={s.SpeciesId} value={s.SpeciesId}>{s.Name}</option>)}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Feeding Zone Badge */}
                        {preview && preview.feedingZone && (
                            <div className="mt-2">
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                                    {preview.feedingZone} feeder &middot; {preview.zonePercent || (preview.feedingZone === 'Column' ? 40 : 30)}%
                                </span>
                                {preview.maxQtyForThisSpecies > 0 && (
                                    <p className="text-xs text-gray-500 mt-1.5 ml-0.5 font-medium">
                                        Max for this species: {preview.maxQtyForThisSpecies.toLocaleString()} fish
                                        {preview.existingSpeciesQty > 0 && (
                                            <span className="text-gray-400"> &middot; Already stocked: {preview.existingSpeciesQty.toLocaleString()}</span>
                                        )}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Compatibility Alert */}
                    {preview && preview.compatibility && (
                        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border animate-in slide-in-from-top-2 ${preview.compatibility.isCompatible ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-orange-50 border-orange-100 text-orange-900'}`}>
                            {preview.compatibility.isCompatible ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> : <AlertTriangle size={18} className="text-orange-500 shrink-0" />}
                            <p className="text-[13px] font-bold">
                                {preview.compatibility.isCompatible ? ' ' : 'Conflict: '}
                                <span className="font-semibold">{preview.compatibility.message}</span>
                            </p>
                        </div>
                    )}

                    {/* Pond Capacity Alert */}
                    {isOverLimit && preview && (
                        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border bg-orange-50 border-orange-100 text-orange-900 animate-in slide-in-from-top-2">
                            <AlertTriangle size={18} className="text-orange-500 shrink-0" />
                            <p className="text-[13px] font-bold">
                                Capacity Warning: <span className="font-semibold">This will exceed the recommended density for this pond type.</span>
                            </p>
                        </div>
                    )}

                    {/* Pond Capacity Card */}
                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-[1.5rem] p-5 sm:p-6 space-y-3.5 shadow-sm">
                        <div className="flex items-center gap-2.5 text-emerald-900 font-extrabold text-sm mb-4 uppercase tracking-wider">
                            <span className="text-xl"></span> Pond Capacity: {pondName}
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: "Current fish:", value: preview?.currentFish || 0 },
                                { label: "Species limit:", value: preview?.maxQtyForThisSpecies ? `${(preview.existingSpeciesQty || 0).toLocaleString()} / ${preview.maxQtyForThisSpecies.toLocaleString()}` : 'N/A', color: isOverSpeciesLimit ? 'text-red-600' : '' },
                                { label: "New total:", value: preview?.newTotal || 0 },
                                { label: "Maximum capacity:", value: (preview?.maximumCapacity || 0).toLocaleString() },
                                { label: "Utilization:", value: preview?.utilization || "0%" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-600 font-bold">{item.label}</span>
                                    <span className={`font-black ${item.color || 'text-gray-900'}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {isOverSpeciesLimit && (
                            <div className="pt-3 border-t border-red-100 flex items-center gap-2 text-red-700 text-xs font-bold">
                                <AlertTriangle size={14} className="text-red-500" />
                                Exceeds {preview?.zonePercent}% ratio limit for {preview?.feedingZone} feeders
                            </div>
                        )}

                        {!isOverSpeciesLimit && (
                            <div className="pt-3 border-t border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs font-bold">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Healthy stocking level
                            </div>
                        )}
                    </div>

                    {/* input Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-gray-800 ml-1">Quantity</label>
                            <input
                                type="number"
                                placeholder="e.g. 500"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-gray-800 ml-1">Price per piece (PKR)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-gray-800 ml-1">Current  Age</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 3"
                                value={currentSize}
                                onChange={(e) => setCurrentSize(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-gray-800 ml-1">Target Harvest Size</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="20"
                                    value={targetSize}
                                    onChange={(e) => setTargetSize(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50 hover:bg-white pr-10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col pointer-events-none opacity-40">
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="rotate-180 mb-0.5"><path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 ml-1 italic font-bold">Optional, default: 10 inches</p>
                        </div>
                    </div>

                    {/* Total Cost Banner */}
                    <div className="bg-blue-50 border border-blue-100 rounded-[1.25rem] px-5 sm:px-6 py-4 flex items-center shadow-sm">
                        <p className="text-gray-900 text-[13px] font-bold">
                            Total Cost: <span className="text-blue-800 font-black ml-1">PKR {totalCost.toLocaleString()}</span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center pt-2 gap-4">
                        <button
                            disabled={!isValid || loading}
                            onClick={handleSubmit}
                            className={`w-full py-4 rounded-3xl text-sm font-black text-white shadow-xl transition-all active:scale-[0.98] ${isValid ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-gray-200 cursor-not-allowed text-gray-400 shadow-none"}`}
                        >
                            Stock Fish Now
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-3xl text-sm font-black transition-all border border-gray-200 active:scale-95 shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


