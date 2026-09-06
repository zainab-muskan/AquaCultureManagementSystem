"use client";

import { useState, useEffect } from "react";
import { FlaskConical, DollarSign, Target, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function FertilizationPage() {
    // State
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    // Dashboard Stats
    const [stats, setStats] = useState({
        monthCost: 0,
        applications: 0,
        efficiency: 0
    });

    // Form inputs
    const [inputs, setInputs] = useState({
        size: "3",
        type: "Concrete",
        intensity: "Semi-Intensive"
    });

    // Calculation Result
    const [result, setResult] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);

    // Dynamic Options
    const [options, setOptions] = useState({
        pondTypes: [],
        cultivationTypes: []
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [dash, history, opts] = await Promise.all([
                farmApi.getFertilizerDashboard(),
                farmApi.getRecentFertilizations(),
                farmApi.getFertilizerOptions()
            ]);
            if (dash) setStats(dash);
            if (history) setRecentLogs(history);
            if (opts) {
                setOptions(opts);
                // Pre-fill inputs with first available DB options if lists aren't empty
                setInputs(prev => ({
                    ...prev,
                    type: opts.pondTypes.length > 0 ? opts.pondTypes[0] : prev.type,
                    intensity: opts.cultivationTypes.length > 0 ? opts.cultivationTypes[0] : prev.intensity
                }));
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setCalculating(true);
        try {
            const data = await farmApi.getFertilizerCalculation(inputs.size, inputs.type, inputs.intensity);
            setResult(data);
        } catch (error) {
            console.error("Calculation failed", error);
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Fertilization Guide</h1>
                        <p className="text-sm text-gray-500 mt-1">Get personalized fertilization recommendations for your pond</p>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col justify-center">
                        <p className="text-[12px] text-gray-500 font-medium tracking-wide">This Month</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">PKR {Number(stats.monthCost || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col justify-center">
                        <p className="text-[12px] text-gray-500 font-medium tracking-wide">Applications</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{stats.applications}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col justify-center">
                        <p className="text-[12px] text-gray-500 font-medium tracking-wide">Estimated Cost</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">PKR {result ? Number(result.total_cost || 0).toLocaleString() : "0"}</p>
                    </div>
                </div>

                {/* Calculator Form */}
                <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Calculate Fertilization Requirements</h2>
                            <p className="text-[13px] text-gray-500 mt-1">Enter your pond details to get customized fertilization recommendations</p>
                        </div>

                        <form onSubmit={handleCalculate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Size */}
                                <div>
                                    <label className="block text-[12px] font-bold text-gray-700 mb-2">Pond Size (Acres)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={inputs.size}
                                        onChange={e => setInputs({ ...inputs, size: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                {/* Type */}
                                <div>
                                    <label className="block text-[12px] font-bold text-gray-700 mb-2">Pond Type</label>
                                    <div className="relative">
                                        <select
                                            value={inputs.type}
                                            onChange={e => setInputs({ ...inputs, type: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                        >
                                            {options.pondTypes.length > 0 ? (
                                                options.pondTypes.map(pt => (
                                                    <option key={pt} value={pt}>{pt}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Concrete Pond">Concrete Pond</option>
                                                    <option value="Earthen Pond">Earthen Pond</option>
                                                    <option value="Lined Pond">Lined Pond</option>
                                                </>
                                            )}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                                {/* Intensity */}
                                <div>
                                    <label className="block text-[12px] font-bold text-gray-700 mb-2">Cultivation Intensity</label>
                                    <div className="relative">
                                        <select
                                            value={inputs.intensity}
                                            onChange={e => setInputs({ ...inputs, intensity: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                        >
                                            {options.cultivationTypes.length > 0 ? (
                                                options.cultivationTypes.map(ct => (
                                                    <option key={ct} value={ct}>{ct}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Extensive">Extensive</option>
                                                    <option value="Semi-Intensive">Semi-Intensive</option>
                                                    <option value="Intensive">Intensive</option>
                                                </>
                                            )}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={calculating}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {calculating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : "Generate Fertilization Guide"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Summary Banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-[12px] py-3 px-4 text-center">
                            <p className="text-[13px] text-blue-800 font-medium">
                                Based on your inputs <span className="font-bold">({inputs.size} acres, {inputs.type.toLowerCase()} pond, {inputs.intensity.toLowerCase()} cultivation)</span>, here are your personalized fertilization recommendations:
                            </p>
                        </div>

                        {/* Recommendation Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Organic Card */}
                            <div className="bg-[#FAFFF5] border-2 border-green-500 rounded-[20px] overflow-hidden flex flex-col">
                                <div className="bg-green-50/50 px-6 py-4 border-b border-green-100">
                                    <h3 className="text-[14px] text-green-800 font-medium">Organic Fertilizer</h3>
                                </div>
                                <div className="p-6 flex-1 space-y-6">
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1">Recommended Product</p>
                                        <p className="text-lg font-bold text-gray-900">{result.organic.product}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Quantity</p>
                                            <p className="text-xl font-black text-gray-900">{result.organic.quantity_kg} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Cost</p>
                                            <p className="text-lg font-bold text-green-600">PKR {Number(result.organic.cost_pkr).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1.5">Application Frequency</p>
                                        <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] text-gray-600 font-medium">
                                            {result.organic.instruction}
                                        </span>
                                    </div>
                                    <div className="border-t border-green-100 pt-4">
                                        <p className="text-[11px] text-gray-500 mb-2">Benefits</p>
                                        <ul className="text-[12px] text-gray-700 space-y-1">
                                            {result.organic.benefits?.split(';').map((b, i) => (
                                                <li key={i}>{b.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-2 text-[10px] text-gray-400 border-t border-green-100">
                                        Rate: PKR {result.organic.rate}/kg
                                    </div>
                                </div>
                            </div>

                            {/* Inorganic Card */}
                            <div className="bg-[#F5F9FF] border-2 border-blue-500 rounded-[20px] overflow-hidden flex flex-col">
                                <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100">
                                    <h3 className="text-[14px] text-blue-800 font-medium">Inorganic Fertilizer</h3>
                                </div>
                                <div className="p-6 flex-1 space-y-6">
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1">Recommended Product</p>
                                        <p className="text-lg font-bold text-gray-900">{result.inorganic.product}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Quantity</p>
                                            <p className="text-xl font-black text-gray-900">{result.inorganic.quantity_kg} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Cost</p>
                                            <p className="text-lg font-bold text-blue-600">PKR {Number(result.inorganic.cost_pkr).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1.5">Application Frequency</p>
                                        <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] text-gray-600 font-medium">
                                            {result.inorganic.instruction}
                                        </span>
                                    </div>
                                    <div className="border-t border-blue-100 pt-4">
                                        <p className="text-[11px] text-gray-500 mb-2">Benefits</p>
                                        <ul className="text-[12px] text-gray-700 space-y-1">
                                            {result.inorganic.benefits?.split(';').map((b, i) => (
                                                <li key={i}>{b.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-2 text-[10px] text-gray-400 border-t border-blue-100">
                                        Rate: PKR {result.inorganic.rate}/kg
                                    </div>
                                </div>
                            </div>

                            {/* Lime Card */}
                            <div className="bg-[#FCFDFD] border border-gray-200 rounded-[20px] overflow-hidden flex flex-col relative top-0 sm:top-2">
                                <div className="px-6 py-4">
                                    <h3 className="text-[14px] text-gray-600 font-medium">Lime (pH Control)</h3>
                                </div>
                                <div className="p-6 flex-1 space-y-6">
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1">Recommended Product</p>
                                        <p className="text-lg font-bold text-gray-900">{result.lime.product}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Quantity</p>
                                            <p className="text-xl font-black text-gray-900">{result.lime.quantity_kg} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-500 mb-1">Cost</p>
                                            <p className="text-lg font-bold text-gray-900">PKR {Number(result.lime.cost_pkr).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1.5">Application Frequency</p>
                                        <span className="inline-block px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[11px] text-gray-600 font-medium">
                                            {result.lime.instruction}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-[11px] text-gray-500 mb-2">Benefits</p>
                                        <ul className="text-[12px] text-gray-700 space-y-1">
                                            {result.lime.benefits?.split(';').map((b, i) => (
                                                <li key={i}>{b.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-2 text-[10px] text-gray-400 border-t border-gray-100">
                                        Rate: PKR {result.lime.rate}/kg
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Total Estimations */}
                        <div className="bg-[#FFF8EE] border border-orange-100 rounded-[16px] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-[12px] text-orange-800/60 font-medium mb-0.5">Total Estimated Cost (Initial Application)</p>
                                <p className="text-xl font-black text-[#964B00]">PKR {Number(result.total_cost).toLocaleString()}</p>
                                <p className="text-[11px] text-orange-800/50 mt-1">This covers the initial fertilization for your {inputs.size} acre {inputs.type.toLowerCase()} pond</p>
                            </div>
                            <button className="bg-transparent border-0 text-white font-medium text-sm sr-only">
                                Add to Budget
                            </button>
                            <span className="text-white bg-transparent pointer-events-none opacity-50 text-sm hidden sm:block">
                                Add to Budget
                            </span>
                        </div>

                    </div>
                )}

                {/* Recent Records List */}
                <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Fertilization Records</h2>
                    {recentLogs.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">
                            <FlaskConical size={32} className="mx-auto mb-3 opacity-30" />
                            No recent records found.
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {recentLogs.map((log, index) => (
                                <div key={log.LogId} className={`flex justify-between items-center py-5 ${index !== recentLogs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex gap-4 sm:gap-6 items-center">
                                        <div className="hidden sm:block text-[12px] text-gray-400 font-medium w-20 text-right">
                                            {new Date(log.ApplicationDate).toLocaleDateString('en-GB')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900 text-[14px]">{log.PondName}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${String(log.FertilizerType).toLowerCase() === 'organic'
                                                    ? 'bg-green-50 text-green-700'
                                                    : String(log.FertilizerType).toLowerCase() === 'lime'
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {log.FertilizerType}
                                                </span>
                                            </div>
                                            <p className="text-[13px] text-gray-600">{log.ProductName} • {log.QuantityApplied} kg</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{log.Remarks}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 text-[14px]">PKR {Number(log.TotalCost).toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">PKR {(Number(log.TotalCost) / Number(log.QuantityApplied)).toFixed(2)}/kg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* General Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F8FCF5] border border-green-200/60 rounded-[16px] p-6">
                        <h3 className="font-bold text-green-800 text-[13px] mb-3">Before Application:</h3>
                        <ul className="text-[11px] text-green-700/80 space-y-1.5 font-medium">
                            <li>• Test water pH and temperature</li>
                            <li>• Check pond water level</li>
                            <li>• Ensure proper water circulation</li>
                            <li>• Remove excess vegetation if any</li>
                        </ul>
                    </div>
                    <div className="bg-[#F8FCF5] border border-green-200/60 rounded-[16px] p-6">
                        <h3 className="font-bold text-green-800 text-[13px] mb-3">After Application:</h3>
                        <ul className="text-[11px] text-green-700/80 space-y-1.5 font-medium">
                            <li>• Monitor water color change</li>
                            <li>• Check fish behavior regularly</li>
                            <li>• Maintain proper aeration</li>
                            <li>• Record application details</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
