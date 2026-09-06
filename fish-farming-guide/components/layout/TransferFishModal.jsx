"use client";

import { useState, useEffect } from "react";
import { X, Check, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function TransferFishModal({
    isOpen,
    sourcePondName,
    availableSpecies,
    growOutPonds,
    onClose,
    onTransfer,
}) {
    const [selectedPond, setSelectedPond] = useState("");
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [transferQuantities, setTransferQuantities] = useState({});
    const [compatibilityError, setCompatibilityError] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    if (!isOpen) return null;

    useEffect(() => {
        const checkCompatibility = async () => {
            if (!selectedPond || selectedBatches.length === 0) {
                setCompatibilityError(null);
                return;
            }

            try {
                setIsChecking(true);
                setCompatibilityError(null);

                const selectedFish = availableSpecies.filter(fish => {
                    const stringId = fish.id ? String(fish.id) : null;
                    return stringId && selectedBatches.includes(stringId);
                });

                for (const fish of selectedFish) {
                    if (!fish.SpeciesId) continue;
                    const preview = await farmApi.getStockingPreview(selectedPond, fish.SpeciesId, fish.quantity);
                    if (preview.compatibility && !preview.compatibility.isCompatible) {
                        setCompatibilityError(preview.compatibility.message);
                        return; // Stop on first incompatibility
                    }
                }
            } catch (err) {
                console.error("Compatibility check failed:", err);
            } finally {
                setIsChecking(false);
            }
        };

        checkCompatibility();
    }, [selectedPond, selectedBatches, availableSpecies]);

    const toggleBatch = (id, maxQuantity) => {
        const stringId = String(id);
        setSelectedBatches((prev) => {
            if (prev.includes(stringId)) {
                setTransferQuantities(q => {
                    const newQ = { ...q };
                    delete newQ[stringId];
                    return newQ;
                });
                return prev.filter((item) => item !== stringId);
            } else {
                setTransferQuantities(q => ({ ...q, [stringId]: maxQuantity }));
                return [...prev, stringId];
            }
        });
    };

    const handleTransfer = () => {
        if (selectedPond && selectedBatches.length > 0) {
            const transfers = selectedBatches.map(id => ({
                batchId: id,
                quantity: transferQuantities[id]
            }));
            onTransfer(Number(selectedPond), transfers);
            setSelectedBatches([]);
            setTransferQuantities({});
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 pt-8 pb-4 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-[#2D3E50]">Transfer Fish to Grow-out Pond</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Move mature fish from <span className="font-semibold text-gray-700">{sourcePondName}</span> to a larger pond
                    </p>
                </div>

                <div className="p-6 pt-2 space-y-6">
                    {/* Batch Selection */}
                    <div>
                        <label className="block text-sm font-bold text-[#2D3E50] mb-3">
                            Fish Ready for Transfer (6+ inches)
                        </label>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                            {availableSpecies.length > 0 ? (
                                availableSpecies.map((fish, index) => {
                                    const stringId = fish.id ? String(fish.id) : `batch-${fish.species}-${index}`;
                                    const isSelected = selectedBatches.includes(stringId);
                                    const isReady = fish.currentSize >= 6;

                                    return (
                                        <div
                                            key={stringId}
                                            onClick={() => toggleBatch(stringId, fish.quantity)}
                                            className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                                ? "border-blue-500 bg-blue-50/30"
                                                : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? "bg-[#2D3E50] border-[#2D3E50]" : "bg-white border-gray-300"
                                                    }`}>
                                                    {isSelected && <Check size={12} className="text-white font-bold" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#2D3E50] text-sm">{fish.species}</p>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Quantity: {fish.quantity} • Size: {fish.currentSize} inches
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected ? (
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <label className="text-xs font-bold text-gray-500">Transfer:</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        max={fish.quantity} 
                                                        value={transferQuantities[stringId] || fish.quantity}
                                                        onChange={(e) => {
                                                            const val = Math.min(Math.max(1, Number(e.target.value)), fish.quantity);
                                                            setTransferQuantities(prev => ({ ...prev, [stringId]: val }));
                                                        }}
                                                        className="w-16 px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                                                    />
                                                </div>
                                            ) : (isReady && (
                                                <span className="text-[10px] font-bold text-gray-400 opacity-50">
                                                    Ready
                                                </span>
                                            ))}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-400 italic text-center py-4">No batches available.</p>
                            )}
                        </div>
                    </div>

                    {/* Destination Selection */}
                    <div>
                        <label className="block text-sm font-bold text-[#2D3E50] mb-3">
                            Destination Pond (Grow-out)
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all appearance-none cursor-pointer font-medium bg-white opacity-100 relative z-20"
                                value={selectedPond}
                                onChange={(e) => setSelectedPond(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="" className="text-gray-400">Select grow-out pond...</option>
                                {growOutPonds.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.pondName} ({p.size} acres)
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-30">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Compatibility Preview Box */}
                        {isChecking && (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2">
                                <Loader2 size={16} className="text-gray-400 animate-spin shrink-0" />
                                <p className="text-sm font-medium text-gray-500">Checking compatibility...</p>
                            </div>
                        )}
                        {!isChecking && compatibilityError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <p className="text-sm font-medium text-red-700 leading-snug">{compatibilityError}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleTransfer}
                            disabled={!selectedPond || selectedBatches.length === 0 || !!compatibilityError || isChecking}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm ${selectedPond && selectedBatches.length > 0 && !compatibilityError && !isChecking
                                ? "bg-[#82D6A6] hover:bg-[#71c595] active:scale-[0.98]"
                                : "bg-gray-200 cursor-not-allowed opacity-70"
                                }`}
                        >
                            <ArrowRight size={18} />
                            Transfer Fish
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-[#E2E8F0] hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


