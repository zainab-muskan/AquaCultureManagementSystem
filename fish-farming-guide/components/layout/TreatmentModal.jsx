"use client";

import { useState, useEffect } from "react";
import { X, Pill, AlertCircle } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function TreatmentModal({
    isOpen,
    outbreak,
    onClose,
    onSuccess,
}) {
    const [treatmentStock, setTreatmentStock] = useState([]);
    const [isLoadingStock, setIsLoadingStock] = useState(true);
    const [selectedStockId, setSelectedStockId] = useState("");
    const [treatmentType, setTreatmentType] = useState("");
    const [quantityUsed, setQuantityUsed] = useState("");
    const [description, setDescription] = useState("");
    const [dosage, setDosage] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [outcome, setOutcome] = useState("Pending");
    const [notes, setNotes] = useState("");
    const [markResolved, setMarkResolved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadStock();
        }
    }, [isOpen]);

    const loadStock = async () => {
        try {
            setIsLoadingStock(true);
            const stock = await farmApi.getTreatmentStock();
            setTreatmentStock(stock || []);
        } catch (err) {
            console.error("Failed to load treatment stock:", err);
        } finally {
            setIsLoadingStock(false);
        }
    };

    if (!isOpen || !outbreak) return null;

    const handleStockSelection = (e) => {
        const id = e.target.value;
        setSelectedStockId(id);
        if (id) {
            const selected = treatmentStock.find(s => s.StockId == id);
            if (selected) {
                setTreatmentType(selected.Category);
                setDescription(`Applied ${selected.MedicineName}`);
            }
        } else {
            setTreatmentType("");
            setDescription("");
        }
    };

    const handleQuantityChange = (e) => {
        const qty = e.target.value;
        setQuantityUsed(qty);
    };

    const handleSubmit = async () => {
        if (!selectedStockId) return alert("Please select a medicine from stock.");
        if (!quantityUsed || Number(quantityUsed) <= 0) return alert("Please enter a valid quantity used.");
        if (!description.trim()) return alert("Please describe the treatment.");

        setIsSubmitting(true);
        try {
            // Log the treatment
            await farmApi.logTreatment({
                outbreakId: outbreak.OutbreakId,
                treatmentType,
                description,
                dosage: dosage || null,
                cost: 0,
                stockId: selectedStockId,
                quantityUsed: Number(quantityUsed),
                followUpDate: followUpDate || null,
                outcome,
                notes,
            });

            // If user wants to mark as resolved
            if (markResolved) {
                await farmApi.updateOutbreak(outbreak.OutbreakId, {
                    status: "Resolved"
                });
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Treatment log error:", err);
            alert(err.message || "Failed to log treatment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Pill size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Log Treatment</h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {outbreak.DiseaseName} — {outbreak.PondName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Recommended treatment hint */}
                    {outbreak.RecommendedTreatment && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1">Suggested</h4>
                            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">{outbreak.RecommendedTreatment}</p>
                        </div>
                    )}

                    {/* Medicine Selection from Stock */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Medicine from Inventory</label>
                        {isLoadingStock ? (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 animate-pulse">Loading stock...</div>
                        ) : treatmentStock.length === 0 ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-red-800">No Medicine in Stock</h4>
                                    <p className="text-xs text-red-600 mt-1">You need to add medicine to your Treatment Stock inventory before you can log a treatment.</p>
                                </div>
                            </div>
                        ) : (
                            <select
                                value={selectedStockId}
                                onChange={handleStockSelection}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">Select a medicine to apply...</option>
                                {treatmentStock.map((s) => (
                                    <option key={s.StockId} value={s.StockId} disabled={s.CurrentQuantity <= 0}>
                                        {s.MedicineName} ({s.Category}) — {s.CurrentQuantity > 0 ? `${s.CurrentQuantity} ${s.Unit || 'units'} available` : 'Out of Stock'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the treatment applied..."
                            rows={2}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        />
                    </div>

                    {/* Quantity + Dosage row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Quantity Used</label>
                            <input
                                type="number"
                                value={quantityUsed}
                                onChange={handleQuantityChange}
                                placeholder="Amount to deduct"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Dosage Instructions</label>
                            <input
                                type="text"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                                placeholder="e.g., 2 ppm"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>


                    {/* Outcome */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Outcome</label>
                        <div className="grid grid-cols-4 gap-2">
                            {["Pending", "Improved", "No Change", "Worsened"].map((o) => (
                                <button
                                    key={o}
                                    onClick={() => setOutcome(o)}
                                    className={`text-[11px] font-bold py-2 rounded-lg border transition-all ${outcome === o
                                        ? o === "Improved" ? "bg-green-100 text-green-700 border-green-300 ring-2 ring-green-200"
                                            : o === "Worsened" ? "bg-red-100 text-red-700 border-red-300 ring-2 ring-red-200"
                                                : o === "No Change" ? "bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-amber-200"
                                                    : "bg-gray-200 text-gray-700 border-gray-300 ring-2 ring-gray-300"
                                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Follow-up Date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                            Follow-up Date <span className="text-gray-400 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Mark Resolved Toggle */}
                    <label className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={markResolved}
                            onChange={(e) => setMarkResolved(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded border-green-300 focus:ring-green-500 cursor-pointer"
                        />
                        <div>
                            <span className="text-sm font-bold text-green-800">Mark outbreak as Resolved</span>
                            <p className="text-[10px] text-green-600 font-medium">Check this if the disease has been fully treated</p>
                        </div>
                    </label>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/80 rounded-b-2xl flex flex-col gap-2 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedStockId || !quantityUsed || !description.trim() || treatmentStock.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Pill size={16} />
                        {isSubmitting ? "Logging..." : "Log Treatment"}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold py-3.5 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
