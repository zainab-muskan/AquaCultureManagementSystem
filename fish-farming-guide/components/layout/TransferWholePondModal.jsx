import React, { useState } from 'react';
import { Settings, CheckCircle2, ChevronDown, ArrowRightLeft, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { farmApi } from '@/integration/farmApi';

export default function TransferWholePondModal({ pond, allPonds, onClose, onSuccess }) {
    if (!pond) return null;

    const [selectedPondId, setSelectedPondId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Exclude the current pond from destinations
    const availableDestinations = allPonds.filter(p => String(p.id) !== String(pond.id));
    const selectedPondInfo = availableDestinations.find(p => String(p.id) === String(selectedPondId));

    const handleTransfer = async () => {
        if (!selectedPondId) {
            setError("Please select a destination pond.");
            return;
        }

        const confirmMessage = `WARNING: Are you sure you want to transfer ALL fish from ${pond.name || pond.pondName} to ${selectedPondInfo?.name || selectedPondInfo?.pondName}? This cannot be undone easily.`;
        if (!window.confirm(confirmMessage)) return;

        setLoading(true);
        setError(null);

        try {
            await farmApi.transferWholePond(pond.id, selectedPondId);
            onSuccess(selectedPondInfo);
        } catch (err) {
            console.error("Bulk transfer failed", err);
            setError(err.message || "Failed to transfer all fish. Please try again.");
            setLoading(false);
        }
    };

    const hasFish = pond.species && pond.species.length > 0 && pond.species.reduce((acc, s) => acc + (s.quantity || 0), 0) > 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                            <ArrowRightLeft size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Transfer Entire Pond</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {!hasFish ? (
                        <div className="p-4 bg-amber-50 text-amber-700 rounded-xl flex items-start gap-3 border border-amber-100">
                            <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-500" />
                            <div>
                                <p className="font-bold text-sm">No Fish Found</p>
                                <p className="text-sm mt-1">This pond is currently empty. There is nothing to transfer.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                                <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
                                <div>
                                    <p className="font-bold text-sm">Bulk Transfer Warning</p>
                                    <p className="text-xs mt-1 leading-relaxed text-red-600">
                                        You are about to move <strong>all batches of fish</strong> currently residing in <strong>{pond.name || pond.pondName}</strong> to another pond. Make sure the destination pond is biologically safe for these species.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destination Pond</label>
                                <div className="relative">
                                    <select
                                        value={selectedPondId}
                                        onChange={(e) => setSelectedPondId(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all outline-none pr-10"
                                    >
                                        <option value="">Select a pond...</option>
                                        {availableDestinations.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name || p.pondName} ({p.stage || p.pondType || 'Grow-out'})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={handleTransfer}
                                    disabled={loading || !selectedPondId}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <ArrowRightLeft size={18} />
                                            Transfer All Fish Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
