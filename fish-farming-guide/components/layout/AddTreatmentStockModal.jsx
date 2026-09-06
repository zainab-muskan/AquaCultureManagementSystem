import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function AddTreatmentStockModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        medicineName: "",
        customMedicineName: "",
        category: "Chemical",
        quantity: "",
        unit: "ml",
        costPerUnit: "",
        supplier: "",
        expiryDate: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: ""
    });

    const [medicineOptions, setMedicineOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch treatment types when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchTreatmentTypes();
        }
    }, [isOpen]);

    const fetchTreatmentTypes = async () => {
        try {
            const types = await farmApi.getTreatmentTypes();
            setMedicineOptions(types || []);
        } catch (err) {
            console.error("Could not fetch treatment types:", err);
            setMedicineOptions([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Auto-set category when a medicine is selected from the dropdown
        if (name === "medicineName" && value !== "Other") {
            const selectedMedicine = medicineOptions.find(m => m.name === value);
            if (selectedMedicine) {
                setFormData(prev => ({ ...prev, [name]: value, category: selectedMedicine.category }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const finalName = formData.medicineName === "Other" ? formData.customMedicineName : formData.medicineName;

        if (!finalName || finalName.trim() === "") {
            setError("Please select or enter a valid medicine/treatment name.");
            setLoading(false);
            return;
        }

        try {
            await farmApi.addTreatmentStock({
                medicineName: finalName,
                category: formData.category,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                costPerUnit: parseFloat(formData.costPerUnit),
                supplier: formData.supplier,
                expiryDate: formData.expiryDate || null,
                purchaseDate: formData.purchaseDate,
                notes: formData.notes
            });
            // Reset form
            setFormData({
                medicineName: "",
                customMedicineName: "",
                category: "Chemical",
                quantity: "",
                unit: "ml",
                costPerUnit: "",
                supplier: "",
                expiryDate: "",
                purchaseDate: new Date().toISOString().split("T")[0],
                notes: ""
            });
            onSuccess();
        } catch (err) {
            setError(err.message || "Failed to add treatment stock");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Group medicines by category for the dropdown
    const groupedMedicines = medicineOptions.reduce((acc, med) => {
        if (!acc[med.category]) acc[med.category] = [];
        acc[med.category].push(med);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white flex flex-col max-h-[90vh] sm:max-h-[85vh] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Add Treatment Stock</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Record a new medicine or treatment purchase</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Medicine / Treatment</label>
                                <select
                                    name="medicineName"
                                    value={formData.medicineName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all bg-white opacity-100 relative z-20"
                                >
                                    <option value="">Select medicine...</option>
                                    {Object.entries(groupedMedicines).map(([cat, meds]) => (
                                        <optgroup key={cat} label={`── ${cat} ──`}>
                                            {meds.map((med, idx) => (
                                                <option key={idx} value={med.name}>{med.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    <option value="Other">Other (Type manually...)</option>
                                </select>
                            </div>

                            {formData.medicineName === "Other" && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Custom Medicine Name</label>
                                    <input
                                        type="text"
                                        name="customMedicineName"
                                        value={formData.customMedicineName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all"
                                        placeholder="Enter medicine name"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all bg-white"
                                    >
                                        <option value="Chemical">Chemical</option>
                                        <option value="Natural">Natural</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Pesticide">Pesticide</option>
                                        <option value="Supplement">Supplement</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Unit</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all bg-white"
                                    >
                                        <option value="ml">ml (milliliters)</option>
                                        <option value="L">L (liters)</option>
                                        <option value="g">g (grams)</option>
                                        <option value="kg">kg (kilograms)</option>
                                        <option value="tablets">Tablets</option>
                                        <option value="packets">Packets</option>
                                        <option value="bottles">Bottles</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0.1"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Cost Per {formData.unit} (PKR)</label>
                                    <input
                                        type="number"
                                        name="costPerUnit"
                                        value={formData.costPerUnit}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Purchase Date</label>
                                    <input
                                        type="date"
                                        name="purchaseDate"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Supplier (Optional)</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all"
                                    placeholder="Supplier Name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-medium outline-none transition-all resize-none"
                                    placeholder="Any additional notes..."
                                />
                            </div>

                            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex justify-between items-center">
                                <span className="text-xs font-black text-rose-900 uppercase tracking-widest">Total Investment</span>
                                <span className="text-lg font-black text-rose-600">
                                    PKR {((parseFloat(formData.quantity) || 0) * (parseFloat(formData.costPerUnit) || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
