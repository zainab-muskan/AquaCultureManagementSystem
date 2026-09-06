"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, Calendar, Ruler, BarChart3, ListChecks } from "lucide-react";
import { farmApi } from "../../integration/farmApi";

export default function GrowthDetailsModal({ isOpen, pond, onClose }) {
    const [timeframe, setTimeframe] = useState(7); // default 7 days
    const [activeTab, setActiveTab] = useState("details"); // "details" | "chart"
    const [growthData, setGrowthData] = useState({}); // { stockId: [...records] }
    const [chartFilter, setChartFilter] = useState("all"); // "7d" | "30d" | "90d" | "365d" | "all"
    const [loadingChart, setLoadingChart] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === "chart" && pond?.species?.length > 0) {
            fetchAllGrowthData();
        }
    }, [isOpen, activeTab]);

    const fetchAllGrowthData = async () => {
        setLoadingChart(true);
        try {
            const results = {};
            for (const s of pond.species) {
                const stockId = s.PondStockId || s.StockId || s.id;
                if (stockId) {
                    const history = await farmApi.getGrowthHistory(stockId);
                    results[stockId] = history || [];
                }
            }
            setGrowthData(results);
        } catch (err) {
            console.error("Failed to load growth history:", err);
        } finally {
            setLoadingChart(false);
        }
    };

    if (!isOpen || !pond) return null;

    const calculateDays = (dateStr) => {
        if (!dateStr) return 0;
        const start = new Date(dateStr);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // Filter growth data by timeframe
    const filterByTimeframe = (records) => {
        if (chartFilter === "all") return records;
        const daysMap = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
        const days = daysMap[chartFilter];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return records.filter(r => new Date(r.RecordedAt) >= cutoff);
    };

    // Get max size across all species for chart scaling
    const getMaxSize = () => {
        let max = 1;
        for (const s of pond.species) {
            const target = parseFloat(s.TargetSizeInch || s.targetSizeInch || 12);
            if (target > max) max = target;
            const stockId = s.PondStockId || s.StockId || s.id;
            const records = growthData[stockId] || [];
            for (const r of records) {
                if (r.SizeInches > max) max = r.SizeInches;
            }
        }
        return max;
    };

    // Generate bar colors per species index
    const barColors = [
        { bar: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
        { bar: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
        { bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
        { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
        { bar: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={22} className="text-blue-500" />
                            Growth Details
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{pond.pondName} - Growth Progress Tracker</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all border-b-2 ${
                            activeTab === "details"
                                ? "border-blue-500 text-blue-600 bg-white"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <ListChecks size={16} /> Details
                    </button>
                    <button
                        onClick={() => setActiveTab("chart")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all border-b-2 ${
                            activeTab === "chart"
                                ? "border-blue-500 text-blue-600 bg-white"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <BarChart3 size={16} /> Growth Chart
                    </button>
                </div>

                {/* ==================== DETAILS TAB ==================== */}
                {activeTab === "details" && (
                    <>
                        {/* Timeframe selector */}
                        <div className="px-4 pt-3 pb-2 bg-gray-50/30 border-b border-gray-100 flex-shrink-0">
                            <select 
                                value={timeframe} 
                                onChange={(e) => setTimeframe(Number(e.target.value))}
                                className="w-full sm:w-auto text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold text-gray-700 outline-none shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={1}>Projected: 1 Day</option>
                                <option value={7}>Projected: 7 Days</option>
                                <option value={30}>Projected: 1 Month</option>
                                <option value={90}>Projected: 3 Months</option>
                                <option value={365}>Projected: 1 Year</option>
                            </select>
                        </div>

                        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto">
                            {(!pond.species || pond.species.length === 0) ? (
                                <div className="text-center text-gray-500 py-6">
                                    No fish stocked in this pond yet.
                                </div>
                            ) : (
                                pond.species.map((s, idx) => {
                                    const current = parseFloat(s.CurrentSizeInch || s.currentSizeInch || 0);
                                    const target = parseFloat(s.TargetSizeInch || s.targetSizeInch || 0);
                                    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                                    const daysInPond = Math.max(1, calculateDays(s.StockingDate || s.stockingDate));
                                    
                                    // Growth calculations
                                    const startingSize = 1.0; 
                                    const growthTotal = Math.max(0, current - startingSize);
                                    
                                    const ratePerDay = (growthTotal / daysInPond);
                                    const projectedGrowth = (ratePerDay * timeframe).toFixed(2);
                                    
                                    const lastCheckedDays = calculateDays(s.LastSizeUpdateDate || s.lastSizeUpdateDate);

                                    return (
                                        <div key={idx} className="bg-white border text-sm border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-base">{s.SpeciesName || s.species || "Unknown Species"}</h3>
                                                    <p className="text-gray-500 text-xs mt-0.5">{parseInt(s.Quantity || s.quantity || 0).toLocaleString()} fish</p>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs border border-blue-100">
                                                        <Ruler size={13} /> {current.toFixed(1)}" / {target.toFixed(1)}"
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                                                    <span>Progress</span>
                                                    <span className={percent >= 100 ? "text-emerald-600" : "text-blue-600"}>
                                                        {percent}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 flex items-center gap-1">
                                                        <Calendar size={11} /> Stocked
                                                    </span>
                                                    <span className="font-semibold text-gray-700">{daysInPond} Days Ago</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 flex items-center gap-1">
                                                        <TrendingUp size={11} /> Growth Projected
                                                    </span>
                                                    <span className="font-semibold text-emerald-600">~{projectedGrowth}" 
                                                        <span className="text-[9px] font-medium text-emerald-600/70 ml-1">
                                                            in {timeframe === 1 ? '1 Day' : timeframe === 7 ? '7 Days' : timeframe === 30 ? '1 Month' : timeframe === 90 ? '3 Months' : '1 Year'}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 text-[10px] text-center text-gray-400">
                                                Last measured: {s.LastSizeUpdateDate || s.lastSizeUpdateDate ? `${lastCheckedDays} days ago` : 'Never updated'}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* ==================== CHART TAB ==================== */}
                {activeTab === "chart" && (
                    <>
                        {/* Chart Filter */}
                        <div className="px-4 pt-3 pb-2 bg-gray-50/30 border-b border-gray-100 flex-shrink-0">
                            <div className="flex gap-1.5 flex-wrap">
                                {[
                                    { key: "7d", label: "7 Days" },
                                    { key: "30d", label: "1 Month" },
                                    { key: "90d", label: "3 Months" },
                                    { key: "365d", label: "1 Year" },
                                    { key: "all", label: "All Time" },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => setChartFilter(f.key)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                            chartFilter === f.key
                                                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto">
                            {loadingChart ? (
                                <div className="text-center py-12">
                                    <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-400 mt-3">Loading growth data...</p>
                                </div>
                            ) : (!pond.species || pond.species.length === 0) ? (
                                <div className="text-center text-gray-500 py-6">No fish stocked in this pond yet.</div>
                            ) : (
                                pond.species.map((s, idx) => {
                                    const stockId = s.PondStockId || s.StockId || s.id;
                                    const rawRecords = growthData[stockId] || [];
                                    const records = filterByTimeframe(rawRecords);
                                    const speciesName = s.SpeciesName || s.species || "Unknown";
                                    const target = parseFloat(s.TargetSizeInch || s.targetSizeInch || 12);
                                    const color = barColors[idx % barColors.length];
                                    const maxSize = getMaxSize();

                                    return (
                                        <div key={idx} className={`rounded-xl border ${color.border} ${color.bg} p-4`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className={`font-bold text-sm ${color.text}`}>{speciesName}</h4>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {records.length} measurement{records.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>

                                            {records.length === 0 ? (
                                                <div className="bg-white/80 rounded-lg border border-gray-100 p-6 text-center">
                                                    <BarChart3 size={28} className="mx-auto text-gray-300 mb-2" />
                                                    <p className="text-sm text-gray-400 font-medium">No growth data recorded yet</p>
                                                    <p className="text-[11px] text-gray-300 mt-1">Use "Update Size" to start tracking</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Bar Chart */}
                                                    <div className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4">
                                                        {/* Target line label */}
                                                        <div className="flex items-center justify-end gap-2 mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-4 h-[2px] bg-red-400 rounded-full"></div>
                                                                <span className="text-[9px] font-bold text-red-400 uppercase">Target ({target.toFixed(1)}")</span>
                                                            </div>
                                                        </div>

                                                        {/* Chart area */}
                                                        <div className="relative" style={{ minHeight: "160px" }}>
                                                            {/* Target line */}
                                                            <div 
                                                                className="absolute left-0 right-0 border-t-2 border-dashed border-red-300/60 z-10"
                                                                style={{ bottom: `${(target / maxSize) * 100}%` }}
                                                            />

                                                            {/* Bars container */}
                                                            <div className="flex items-end gap-1 sm:gap-1.5 h-40 relative z-20">
                                                                {records.map((r, ri) => {
                                                                    const heightPercent = Math.min(100, (r.SizeInches / maxSize) * 100);
                                                                    const date = new Date(r.RecordedAt);
                                                                    const label = `${date.getDate()}/${date.getMonth() + 1}`;
                                                                    const isLatest = ri === records.length - 1;

                                                                    return (
                                                                        <div key={ri} className="flex-1 flex flex-col items-center justify-end h-full group min-w-0" style={{ maxWidth: "48px" }}>
                                                                            {/* Tooltip */}
                                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 pointer-events-none">
                                                                                <div className="bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                                                                    {r.SizeInches.toFixed(2)}"
                                                                                </div>
                                                                            </div>
                                                                            {/* Size label on top */}
                                                                            <span className={`text-[9px] font-bold mb-0.5 ${isLatest ? color.text : 'text-gray-400'}`}>
                                                                                {r.SizeInches.toFixed(1)}"
                                                                            </span>
                                                                            {/* Bar */}
                                                                            <div 
                                                                                className={`w-full rounded-t-md transition-all duration-500 ${isLatest ? color.bar : color.bar + ' opacity-60'} hover:opacity-100 cursor-pointer`}
                                                                                style={{ 
                                                                                    height: `${heightPercent}%`,
                                                                                    minHeight: "4px"
                                                                                }}
                                                                            />
                                                                            {/* Date label */}
                                                                            <span className="text-[8px] text-gray-400 mt-1 font-medium truncate w-full text-center">
                                                                                {label}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Summary stats */}
                                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                                        <div className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase">First</p>
                                                            <p className="text-sm font-bold text-gray-800">{records[0].SizeInches.toFixed(2)}"</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase">Latest</p>
                                                            <p className={`text-sm font-bold ${color.text}`}>{records[records.length - 1].SizeInches.toFixed(2)}"</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase">Growth</p>
                                                            <p className="text-sm font-bold text-emerald-600">
                                                                +{(records[records.length - 1].SizeInches - records[0].SizeInches).toFixed(2)}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end flex-shrink-0 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
