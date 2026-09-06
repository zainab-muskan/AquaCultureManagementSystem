"use client";
import React from 'react';
import { AlertTriangle, X, Droplets, Activity, Thermometer, FlaskConical } from 'lucide-react';

export default function SpeciesAlertModal({ isOpen, alertData, onClose }) {
    if (!isOpen || !alertData) return null;

    const { pond, species, time, failing_factors } = alertData;

    const renderIcon = (factor) => {
        if (factor.includes("Temp")) return <Thermometer size={16} className="text-orange-500" />;
        if (factor.includes("pH")) return <FlaskConical size={16} className="text-purple-500" />;
        if (factor.includes("Oxygen")) return <Droplets size={16} className="text-blue-500" />;
        if (factor.includes("Ammonia") || factor.includes("Nitrite") || factor.includes("Nitrate")) return <Activity size={16} className="text-red-500" />;
        return <AlertTriangle size={16} className="text-red-400" />;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-red-100">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-900 leading-tight">Water Quality Stress</h2>
                            <p className="text-xs font-semibold text-red-600">Species Danger Detected</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 bg-white space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pond</p>
                            <p className="text-sm font-semibold text-gray-800">{pond}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Species</p>
                            <p className="text-sm font-semibold text-gray-800">{species}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <Activity size={14} className="text-red-500" /> Failing Parameters
                        </h4>
                        <ul className="space-y-2 bg-red-50/50 rounded-lg p-3 border border-red-100">
                            {failing_factors?.map((factor, idx) => (
                                <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-gray-800 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                    {renderIcon(factor)}
                                    {factor}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
                    >
                        Acknowledge Alert
                    </button>
                </div>
            </div>
        </div>
    );
}
