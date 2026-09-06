"use client";

import { useState, useEffect, use } from "react";
import { X, Check } from "lucide-react";

export default function UpdateSizeModal({
    isOpen,
    onClose,
    speciesName,
    currentSize,
    lastUpdateDate,
    onUpdate,
}) {
    const [newSize, setNewSize] = useState(currentSize);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    
    useEffect(() => {
        if (isOpen) {
            setNewSize(currentSize);
        }
    }, [isOpen, currentSize]);

    if (!isOpen) return null;

    const handleUpdate = () => {
        // Ensure we are sending a valid number back
        const sizeToUpdate = Number(newSize);
        if (!isNaN(sizeToUpdate) && sizeToUpdate > 0 && date) {
            onUpdate({ size: sizeToUpdate, date });
            onClose();
        } else {
            alert("Please enter a valid size");
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 text-gray-900">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Update {speciesName} Size</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Current Size Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-700 font-medium tracking-wide">
                        Current Size: <span className="font-bold text-sm">{currentSize}"</span>
                    </p>
                    <p className="text-[11px] text-blue-600 mt-0.5">
                        Last Updated: {lastUpdateDate ? new Date(lastUpdateDate).toLocaleDateString() : "Never"}
                    </p>
                </div>

                {/* New Size Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                        New age
                    </label>
                    <input
                        type="number"
                        step="0.1" // Allows for decimals like 4.5
                        value={newSize}
                        onChange={(e) =>
                            setNewSize(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Enter new size"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       
                        autoFocus // Automatically focuses the input when modal opens
                    />
                </div>

                {/* Date Measured Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                        
                        Date Measured
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        // Fixed text-white for better visibility
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Check size={16} /> Update Age
                    </button>
                </div>
            </div>
        </div>
    );
}


