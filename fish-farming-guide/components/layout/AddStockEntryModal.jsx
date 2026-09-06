"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

const AddStockEntryModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [ponds, setPonds] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        pondId: "",
        speciesId: "",
        quantity: "",
        weightPerFish: "",
        costPerUnit: "",
        batchNumber: "",
        supplier: "",
        notes: "",
        stockingDate: new Date().toISOString().split('T')[0]
    });

    // Fetch user's ponds and species from backend when modal opens
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setFetchingData(true);
                try {
                    const [pondData, speciesData] = await Promise.all([
                        farmApi.getPonds(),
                        farmApi.getApprovedSpecies()
                    ]);
                    setPonds(pondData || []);
                    setSpeciesList(speciesData || []);
                } catch (err) {
                    console.error("Failed to load modal data:", err);
                } finally {
                    setFetchingData(false);
                }
            };
            loadData();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Map form data to backend expected field names
            const payload = {
                pondId: Number(formData.pondId),
                speciesId: Number(formData.speciesId),
                batchNo: formData.batchNumber,
                quantity: Number(formData.quantity),
                weight: Number(formData.weightPerFish),
                cost: Number(formData.costPerUnit), // Backend treats this as Price Per Fish
                supplier: formData.supplier,
                stockingDate: formData.stockingDate
            };

            const result = await farmApi.addInventory(payload);
            if (result.success) {
                onSuccess(); // Close modal and refresh parent stats
                setFormData({
                    pondId: "",
                    speciesId: "",
                    quantity: "",
                    weightPerFish: "",
                    costPerUnit: "",
                    batchNumber: "",
                    supplier: "",
                    notes: "",
                    stockingDate: new Date().toISOString().split('T')[0]
                });
            }
        } catch (err) {
            alert(err.message || "Failed to add stock");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Stock Entry</h2>
                        <p className="text-sm text-gray-500">Add a new stocking event to your farm inventory.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Select Pond */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Pond *</label>
                            <select
                                required
                                value={formData.pondId}
                                onChange={(e) => setFormData({ ...formData, pondId: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">{fetchingData ? "Loading Ponds..." : "Choose a pond..."}</option>
                                {ponds.map(p => (
                                    <option key={p.PondId || p.id} value={p.PondId || p.id}>
                                        {p.PondName || p.pondName} ({p.PondType || p.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Species Dropdown */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Fish Species *</label>
                            <select
                                required
                                value={formData.speciesId}
                                onChange={(e) => setFormData({ ...formData, speciesId: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">{fetchingData ? "Loading Species..." : "Select species..."}</option>
                                {speciesList.map(s => (
                                    <option key={s.SpeciesId} value={s.SpeciesId}>{s.Name || s.speciesName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity (fish) *</label>
                            <input
                                required
                                type="number"
                                placeholder="e.g., 1000"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Weight/Fish (g) *</label>
                            <input
                                required
                                type="number"
                                placeholder="e.g., 50"
                                value={formData.weightPerFish}
                                onChange={(e) => setFormData({ ...formData, weightPerFish: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Cost */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Price Per Fish (PKR) *</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="e.g., 15.50"
                                value={formData.costPerUnit}
                                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Batch Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number</label>
                            <input
                                type="text"
                                placeholder="e.g., B-2025-001"
                                value={formData.batchNumber}
                                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Stocking Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Stocking Date *</label>
                            <input
                                required
                                type="date"
                                value={formData.stockingDate}
                                onChange={(e) => setFormData({ ...formData, stockingDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label>
                            <input
                                type="text"
                                placeholder="Supplier name"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Notes */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows="2"
                                placeholder="Additional notes about this batch..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || fetchingData}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Adding..." : "Add Stock Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStockEntryModal;

