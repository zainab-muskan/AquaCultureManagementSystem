"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, DollarSign } from "lucide-react";

export default function SaleModal({ isOpen, batch, onClose, onUpdate }) {
    const [quantityForSale, setQuantityForSale] = useState(0);
    const [salePricePerUnit, setSalePricePerUnit] = useState("");
    const [isForSale, setIsForSale] = useState(false);

    useEffect(() => {
        if (batch) {
            setQuantityForSale(batch.currentSaleQty || 0);
            setSalePricePerUnit(batch.currentSalePrice || "");
            setIsForSale(batch.isForSale || false);
        }
    }, [batch]);

    if (!isOpen || !batch) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            batchId: batch.batchId,
            speciesName: batch.speciesName,
            isForSale: isForSale,
            quantityForSale: Number(quantityForSale),
            salePricePerUnit: salePricePerUnit ? Number(salePricePerUnit) : null
        });
    };

    const handleRemoveFromSale = () => {
        onUpdate({
            batchId: batch.batchId,
            speciesName: batch.speciesName,
            isForSale: false,
            quantityForSale: 0,
            salePricePerUnit: null
        });
    };

    const estimatedTotal = (quantityForSale && salePricePerUnit) 
        ? (Number(quantityForSale) * Number(salePricePerUnit)) 
        : 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <Tag size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Set For Sale</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Species: <strong className="text-gray-900">{batch.speciesName}</strong></p>
                        <p className="text-sm text-gray-600">Total Available: <strong className="text-gray-900">{batch.maxQuantity}</strong></p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity to Sell</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max={batch.maxQuantity}
                            value={quantityForSale || ''}
                            onChange={(e) => {
                                setQuantityForSale(e.target.value);
                                setIsForSale(Number(e.target.value) > 0);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition outline-none"
                            placeholder={"Enter quantity (max " + batch.maxQuantity + ")"}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Price Per Fish (PKR) <span className="text-gray-400 font-normal">— optional</span>
                        </label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={salePricePerUnit}
                                onChange={(e) => setSalePricePerUnit(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 transition outline-none"
                                placeholder="e.g. 150.00"
                            />
                        </div>
                    </div>

                    {estimatedTotal > 0 && (
                        <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Estimated Total</p>
                            <p className="text-lg font-black text-emerald-800">PKR {estimatedTotal.toLocaleString()}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        {batch.isForSale && (
                            <button
                                type="button"
                                onClick={handleRemoveFromSale}
                                className="flex-1 px-4 py-2.5 rounded-xl font-semibold border-2 border-red-100 text-red-600 hover:bg-red-50 transition"
                            >
                                Cancel Sale
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                        >
                            Save Active
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
