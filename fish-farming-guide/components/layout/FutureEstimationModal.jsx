"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Calendar, DollarSign, Scale, Activity, Droplets } from 'lucide-react';
import { farmApi } from '../../integration/farmApi';

export default function FutureEstimationModal({ isOpen, onClose, pond }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimationData, setEstimationData] = useState(null);

    useEffect(() => {
        if (isOpen && pond?.PondId) {
            setLoading(true);
            setError(null);
            
            farmApi.getFutureEstimation(pond.PondId)
                .then(res => {
                    if (res && res.success) {
                        setEstimationData(res.data);
                    } else {
                        setError("Could not load estimation data.");
                    }
                })
                .catch(err => {
                    console.error("Error loading future estimation:", err);
                    setError("Failed to fetch estimation data.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, pond]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="text-blue-600" size={20} />
                            Future Estimation: {pond?.PondName || "Pond"}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                            <p className="text-slate-500 font-medium">Calculating projections...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-medium border border-red-100">
                            {error}
                        </div>
                    ) : estimationData ? (
                        <div className="space-y-8">
                            
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Expected Biomass</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{estimationData.summary.totalExpectedBiomassKg.toLocaleString()} kg</h3>
                                </div>
                                
                                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Estimated Revenue</p>
                                    <h3 className="text-2xl font-bold text-gray-800">Rs {Math.round(estimationData.summary.expectedRevenue.avg).toLocaleString()}</h3>
                                </div>

                                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Projected Expenses</p>
                                    <h3 className="text-2xl font-bold text-gray-800">Rs {Math.round(estimationData.summary.expenses.totalEstimated).toLocaleString()}</h3>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                    <p className="text-blue-600 text-xs uppercase tracking-wide mb-1 font-semibold">Estimated Net Profit</p>
                                    <h3 className="text-2xl font-bold text-blue-700">Rs {Math.round(estimationData.summary.estimatedProfit.avg).toLocaleString()}</h3>
                                </div>
                            </div>

                            {/* Batch Breakdowns */}
                            <div>
                                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <Droplets className="text-blue-500" size={20} />
                                    Active Stock Estimates
                                </h3>
                                
                                {estimationData.batches.length === 0 ? (
                                    <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-500 border border-slate-100">
                                        No active stocking found in this pond. Stock fish to see future estimates.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {estimationData.batches.map((batch, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{batch.speciesName}</h4>
                                                        <p className="text-gray-500 text-xs mt-1">Stocked: {new Date(batch.stockingDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 uppercase">Expected Harvest</p>
                                                        <p className="font-bold text-gray-800">{new Date(batch.expectedHarvestDate).toLocaleDateString()}</p>
                                                        <p className="text-gray-400 text-xs">in {batch.daysRemaining} days</p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>{batch.daysElapsed} days elapsed</span>
                                                        <span>{batch.progressPercent}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: batch.progressPercent + '%' }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Survival Rate</p>
                                                        <p className="font-semibold text-gray-800">{Math.round((batch.expectedFinalQuantity / batch.currentQuantity) * 100)}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Est. Quantity</p>
                                                        <p className="font-semibold text-gray-800">{batch.expectedFinalQuantity.toLocaleString()} pcs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Est. Biomass</p>
                                                        <p className="font-semibold text-gray-800">{batch.expectedBiomassKg.toLocaleString()} kg</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Est. Revenue</p>
                                                        <p className="font-semibold text-gray-800">Rs {batch.expectedRevenue.min.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
