"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export default function AddExpenseModal({
    isOpen,
    onClose,
    onAdd,
    pondId,
    pondName,
    ponds = [] // New: Array of all user ponds for global selection
}) {
    const [selectedPondId, setSelectedPondId] = useState(pondId || "");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    // If pondId prop changes (e.g. opened from a specific pond card), update local state
    useEffect(() => {
        if (pondId) setSelectedPondId(pondId);
    }, [pondId]);

    /* ---------- Validation ---------- */
    const isValid =
        selectedPondId !== "" &&
        category !== "" &&
        typeof amount === "number" &&
        amount > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl text-black">

                {/* Header */}
                <div className="p-6 border-b relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-black hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold text-black">Add Expense</h2>
                    <p className="text-sm text-black/70 mt-1">
                        {pondName ? `Add expense for ${pondName}` : "Record a new expense for your fish farm"}
                    </p>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Pond Selection (Only if ponds array is provided and no specific pondId is forced) */}
                    {ponds.length > 0 && !pondName && (
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Pond *
                            </label>
                            <select
                                value={selectedPondId}
                                onChange={(e) => setSelectedPondId(Number(e.target.value))}
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select pond</option>
                                {ponds.map(p => (
                                    <option key={p.id || p.PondId} value={p.id || p.PondId}>
                                        {p.pondName || p.PondName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Category</option>
                            <option value="Feed">Feed</option>
                            <option value="Fertilizers">Fertilizers</option>
                            <option value="Fingerlings">Fingerlings</option>
                            <option value="Medicines">Medicines</option>
                            <option value="Repair">Repair</option>
                            <option value="Labor">Labor</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) =>
                                setAmount(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            placeholder="e.g., 5000"
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-black placeholder-black/50 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Description (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Description (optional)
                        </label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Monthly feed purchase"
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-black placeholder-black/50 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        disabled={!isValid}
                        onClick={() => {
                            onAdd({
                                pondId: selectedPondId,
                                category,
                                amount,
                                description: description.trim() || null
                            });
                            // Reset local state if it's the global modal
                            if (ponds.length > 0) {
                                setSelectedPondId("");
                                setCategory("");
                                setAmount("");
                                setDescription("");
                            }
                            onClose();
                        }}
                        className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2
              ${isValid
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        <Check size={18} />
                        Add Expense
                    </button>

                </div>
            </div>
        </div>
    );
}


