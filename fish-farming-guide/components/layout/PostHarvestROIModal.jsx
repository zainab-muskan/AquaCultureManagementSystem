"use client";

import { useState, useEffect } from "react";
import { X, Calculator, TrendingUp, TrendingDown, DollarSign, Fish, Weight } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function PostHarvestROIModal({ isOpen, harvestData, onClose }) {
    // harvestData: { pondId, pondName, speciesName, quantity, totalWeight, harvestLogId }

    const [fingerlingCost, setFingerlingCost] = useState(0);
    const [feedCost, setFeedCost] = useState(0);
    const [fertilizerCost, setFertilizerCost] = useState(0);
    const [otherExpenses, setOtherExpenses] = useState(0);
    const [salePricePerKG, setSalePricePerKG] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Auto-fetch pond expenses from DB on mount
    useEffect(() => {
        if (isOpen && harvestData?.pondId) {
            fetchPondExpenses();
        }
    }, [isOpen, harvestData?.pondId]);

    const fetchPondExpenses = async () => {
        setLoading(true);
        try {
            const result = await farmApi.getPondExpenseBreakdown(harvestData.pondId);
            if (result) {
                const harvestQty = Number(harvestData.quantity) || 0;
                // Use totalPondStock as divisor, fallback to batchStock or 1
                const divisor = harvestData.totalPondStock || harvestData.batchStock || harvestQty || 1;
                let proportion = harvestQty / divisor;
                if (proportion > 1) proportion = 1;

                setFingerlingCost(Math.round((result.fingerlingCost || 0) * proportion));
                setFeedCost(Math.round((result.feedCost || 0) * proportion));
                setFertilizerCost(Math.round((result.fertilizerCost || 0) * proportion));
                setOtherExpenses(Math.round((result.otherCost || 0) * proportion));
            }
        } catch (err) {
            console.error("Failed to fetch pond expenses:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !harvestData) return null;

    const totalExpenses = Number(fingerlingCost) + Number(feedCost) + Number(fertilizerCost) + Number(otherExpenses);
    const totalRevenue = salePricePerKG ? Number(harvestData.totalWeight) * Number(salePricePerKG) : 0;
    const netProfit = totalRevenue - totalExpenses;
    const roiPercent = totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(1) : 0;
    const isProfitable = netProfit >= 0;

    const handleDone = async () => {
        setSaving(true);
        try {
            // Update the harvest log with calculated revenue
            if (totalRevenue > 0 && harvestData.harvestLogId) {
                await farmApi.updateHarvestRevenue(harvestData.harvestLogId, totalRevenue);
            }
            onClose();
        } catch (err) {
            console.error("Failed to save ROI data:", err);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">ROI Calculator</h2>
                            <p className="text-gray-300 text-xs">{harvestData.pondName} • {harvestData.speciesName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Harvest Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Fish Harvested</p>
                            <p className="text-2xl font-black text-gray-900">{Number(harvestData.quantity).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">pieces</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Total Weight</p>
                            <p className="text-2xl font-black text-gray-900">{Number(harvestData.totalWeight).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">kg</p>
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <DollarSign size={16} className="text-orange-500" /> Enter Your Expenses
                            </h3>
                            {harvestData.totalPondStock && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium border border-blue-100">
                                    Auto-calculated: {Math.round((Number(harvestData.quantity) / (harvestData.totalPondStock || 1)) * 100)}% of Pond Costs
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                                    <Fish size={12} className="text-blue-500" /> Fingerling Cost
                                </label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    <span className="text-xs font-bold text-gray-400 px-2">PKR</span>
                                    <input
                                        type="number"
                                        value={fingerlingCost}
                                        onChange={(e) => setFingerlingCost(e.target.value)}
                                        className="w-full px-2 py-2 text-sm bg-transparent focus:outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                                    🍚 Feed Cost
                                </label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    <span className="text-xs font-bold text-gray-400 px-2">PKR</span>
                                    <input
                                        type="number"
                                        value={feedCost}
                                        onChange={(e) => setFeedCost(e.target.value)}
                                        className="w-full px-2 py-2 text-sm bg-transparent focus:outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                                    🔺 Fertilizer Cost
                                </label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    <span className="text-xs font-bold text-gray-400 px-2">PKR</span>
                                    <input
                                        type="number"
                                        value={fertilizerCost}
                                        onChange={(e) => setFertilizerCost(e.target.value)}
                                        className="w-full px-2 py-2 text-sm bg-transparent focus:outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                                    🔧 Other Expenses
                                </label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    <span className="text-xs font-bold text-gray-400 px-2">PKR</span>
                                    <input
                                        type="number"
                                        value={otherExpenses}
                                        onChange={(e) => setOtherExpenses(e.target.value)}
                                        className="w-full px-2 py-2 text-sm bg-transparent focus:outline-none text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sale Price */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-emerald-500" /> Sale Price
                        </h3>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                            <span className="text-xs font-bold text-gray-400 px-3">PKR</span>
                            <input
                                type="number"
                                value={salePricePerKG}
                                onChange={(e) => setSalePricePerKG(e.target.value)}
                                placeholder="Enter price per KG"
                                className="w-full px-2 py-3 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                            />
                            <span className="text-xs font-bold text-gray-400 px-3 whitespace-nowrap">/ KG</span>
                        </div>
                    </div>

                    {/* ROI Summary */}
                    {salePricePerKG ? (
                        <div className={`rounded-xl p-4 border ${isProfitable ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Revenue</p>
                                    <p className="text-lg font-black text-gray-900">₨{Math.round(totalRevenue).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Expenses</p>
                                    <p className="text-lg font-black text-orange-600">₨{Math.round(totalExpenses).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Net Profit</p>
                                    <p className={`text-lg font-black ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {isProfitable ? '+' : ''}₨{Math.round(netProfit).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-center gap-2">
                                {isProfitable ? (
                                    <TrendingUp size={18} className="text-emerald-600" />
                                ) : (
                                    <TrendingDown size={18} className="text-red-600" />
                                )}
                                <span className={`text-xl font-black ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {roiPercent}% ROI
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400">
                            <Calculator size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-wider">Enter your expenses above</p>
                        </div>
                    )}

                    {/* Done Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleDone}
                            disabled={saving}
                            className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Done"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
