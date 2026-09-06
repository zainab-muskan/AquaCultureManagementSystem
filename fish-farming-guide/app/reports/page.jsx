"use client";

import React, { useState, useEffect } from 'react';
import { farmApi } from '@/integration/farmApi';
import {
    BarChart3,
    Calendar,
    CalendarDays,
    CalendarRange,
    Activity,
    Fish,
    Waves,
    Droplets,
    Sprout,
    Skull,
    HeartPulse,
    PackageOpen,
    ShoppingCart,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Calculator
} from 'lucide-react';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('reports');
    const [timeframe, setTimeframe] = useState('all-time');
    const [activityFilter, setActivityFilter] = useState('all');
    const [pondFilter, setPondFilter] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [roiData, setROIData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else {
            fetchROIReport();
        }
    }, [timeframe, activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await farmApi.getFarmReports(timeframe, customStartDate, customEndDate);
            if (res.success) {
                setReportData(res);
            } else {
                setError("Failed to load reports data.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const fetchROIReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await farmApi.getROIReport(timeframe, customStartDate, customEndDate);
            if (res.success) {
                setROIData(res);
            } else {
                setError("Failed to load ROI data.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'pond_created': return <MapPin className="text-blue-500" size={20} />;
            case 'stocking': return <Fish className="text-indigo-500" size={20} />;
            case 'feed': return <PackageOpen className="text-amber-500" size={20} />;
            case 'fertilizer': return <Sprout className="text-lime-500" size={20} />;
            case 'mortality': return <Skull className="text-red-500" size={20} />;
            case 'harvest': return <Waves className="text-emerald-500" size={20} />;
            case 'marketplace_sale': return <ShoppingCart className="text-green-500" size={20} />;
            case 'marketplace_purchase': return <ShoppingCart className="text-indigo-500" size={20} />;
            case 'stock_purchase': return <ShoppingCart className="text-slate-500" size={20} />;
            case 'expense': return <ArrowDownRight className="text-orange-500" size={20} />;
            case 'sale': return <ArrowUpRight className="text-green-500" size={20} />;
            case 'water': return <Droplets className="text-cyan-500" size={20} />;
            case 'disease': return <Activity className="text-rose-500" size={20} />;
            case 'treatment': return <HeartPulse className="text-purple-500" size={20} />;
            default: return <Activity className="text-gray-500" size={20} />;
        }
    };

    const uniquePonds = reportData?.activities
        ? [...new Set(reportData.activities.map(a => a.pondName).filter(Boolean))]
        : [];

    const timeframeTabs = [
        { id: 'weekly', label: '7 Days', icon: Calendar },
        { id: 'monthly', label: '30 Days', icon: CalendarDays },
        { id: 'yearly', label: '1 Year', icon: CalendarRange },
        { id: 'all-time', label: 'All Time', icon: Activity },
        { id: 'custom', label: 'Custom', icon: CalendarRange },
    ];

    return (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-white min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-black uppercase flex items-center gap-3">
                            <BarChart3 className="text-black w-8 h-8" />
                            Farm Reports
                        </h1>
                        <p className="text-black mt-2">Comprehensive activity and financial tracking.</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex mb-6 border-2 border-black bg-white">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'reports' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                    >
                        <BarChart3 size={18} /> Farm Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('roi')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold border-l-2 border-black transition-colors ${activeTab === 'roi' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                    >
                        <Calculator size={18} /> ROI Report
                    </button>
                </div>

                {/* Timeframe + Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 w-full">
                    {activeTab === 'reports' && uniquePonds.length > 0 && (
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={pondFilter}
                                onChange={(e) => setPondFilter(e.target.value)}
                                className="w-full appearance-none bg-white border-2 border-black text-black py-2 pl-4 pr-10 focus:outline-none font-bold text-sm cursor-pointer"
                            >
                                <option value="all">All Ponds</option>
                                {uniquePonds.map(pond => (
                                    <option key={pond} value={pond}>{pond}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    )}
                    {activeTab === 'reports' && (
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value)}
                                className="w-full appearance-none bg-white border-2 border-black text-black py-2 pl-4 pr-10 focus:outline-none font-bold text-sm cursor-pointer"
                            >
                                <option value="all">All Activities</option>
                                <option value="pond_created">Pond Creation</option>
                                <option value="stocking">Stocking</option>
                                <option value="feed">Feed</option>
                                <option value="fertilizer">Fertilizers</option>
                                <option value="mortality">Mortality</option>
                                <option value="harvest">Harvest</option>
                                <option value="water">Water Parameters</option>
                                <option value="disease">Disease</option>
                                <option value="treatment">Treatment</option>
                                <option value="expense">Expenses</option>
                                <option value="sale">Sales</option>
                                <option value="marketplace_sale">Marketplace Sales</option>
                                <option value="marketplace_purchase">Marketplace Purchases</option>
                                <option value="stock_purchase">Stock Purchases</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    )}
                    <div className="flex bg-white border-2 border-black w-full sm:w-auto">
                        {timeframeTabs.map((tab, idx) => (
                            <button
                                key={tab.id}
                                onClick={() => setTimeframe(tab.id)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold ${idx !== 0 ? 'border-l-2 border-black' : ''} ${timeframe === tab.id ? 'bg-black text-white' : 'text-black hover:bg-gray-200'}`}
                            >
                                <tab.icon size={14} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Range */}
                {timeframe === 'custom' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-gray-100 border-2 border-black p-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="font-bold text-black">From:</span>
                            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-white border-2 border-black px-3 py-1.5 focus:outline-none font-bold text-black w-full" />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="font-bold text-black">To:</span>
                            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-white border-2 border-black px-3 py-1.5 focus:outline-none font-bold text-black w-full" />
                        </div>
                        <button onClick={activeTab === 'reports' ? fetchReports : fetchROIReport}
                            className="w-full sm:w-auto bg-black text-white font-bold px-6 py-2 border-2 border-black hover:bg-gray-800 transition-colors">
                            Apply Range
                        </button>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center font-medium">
                        {error}
                    </div>
                ) : activeTab === 'reports' ? (
                    /* ========== FARM REPORTS TAB ========== */
                    reportData && (
                        <div className="bg-white border-2 border-black">
                            <div className="p-4 border-b-2 border-black bg-gray-200">
                                <h2 className="text-xl font-bold text-black uppercase">Reports</h2>
                            </div>
                            <div className="p-6">
                                {reportData.activities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium text-lg">No activities recorded for this period.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reportData.activities
                                            .filter(act => activityFilter === 'all' || act.type === activityFilter)
                                            .filter(act => pondFilter === 'all' || act.pondName === pondFilter)
                                            .map((act, idx) => (
                                                <div key={idx} className="bg-white border-2 border-black p-4">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 border-b-2 border-gray-200 pb-2">
                                                        <h4 className="font-bold text-black text-lg">{act.title}</h4>
                                                        <span className="text-sm font-bold text-black border-2 border-black px-2 py-1 bg-gray-200 whitespace-nowrap">
                                                            {new Date(act.date).toLocaleDateString(undefined, {
                                                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-black font-medium">{act.description}</p>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    /* ========== ROI REPORT TAB ========== */
                    roiData && <ROIReportView data={roiData} />
                )}
            </div>
        </main>
    );
}

/* ============================
   ROI Report View Component
   ============================ */
function ROIReportView({ data }) {
    const { harvests, summary } = data;
    const [pondFilter, setPondFilter] = useState('all');

    const uniquePonds = [...new Set(harvests.map(h => h.pondName))];
    const filtered = pondFilter === 'all' ? harvests : harvests.filter(h => h.pondName === pondFilter);

    if (harvests.length === 0) {
        return (
            <div className="bg-white border-2 border-black">
                <div className="p-4 border-b-2 border-black bg-gray-200">
                    <h2 className="text-xl font-bold text-black uppercase">ROI Report</h2>
                </div>
                <div className="text-center py-16">
                    <Calculator className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-lg">No harvests recorded for this period.</p>
                    <p className="text-gray-400 text-sm mt-1">Harvest your fish to see ROI analysis here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Pond Filter */}
            {uniquePonds.length > 1 && (
                <div className="relative w-full sm:w-64">
                    <select value={pondFilter} onChange={(e) => setPondFilter(e.target.value)}
                        className="w-full appearance-none bg-white border-2 border-black text-black py-2 pl-4 pr-10 focus:outline-none font-bold text-sm cursor-pointer">
                        <option value="all">All Ponds</option>
                        {uniquePonds.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border-2 border-black overflow-x-auto">
                <div className="p-4 border-b-2 border-black bg-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-black uppercase">ROI Report</h2>
                    <span className="text-sm font-bold text-gray-600">{filtered.length} harvest{filtered.length !== 1 ? 's' : ''}</span>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-black bg-gray-100">
                            <th className="text-left px-4 py-3 font-bold text-black">Date</th>
                            <th className="text-left px-4 py-3 font-bold text-black">Pond</th>
                            <th className="text-left px-4 py-3 font-bold text-black">Species</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Qty</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Weight (kg)</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Revenue</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Fingerling</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Feed</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Fertilizer</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Other</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Total Exp.</th>
                            <th className="text-right px-4 py-3 font-bold text-black">Profit/Loss</th>
                            <th className="text-right px-4 py-3 font-bold text-black">ROI %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((h) => (
                            <tr key={h.harvestId} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                    {new Date(h.harvestDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 font-medium text-black">{h.pondName}</td>
                                <td className="px-4 py-3 text-black">{h.speciesName}</td>
                                <td className="px-4 py-3 text-right text-black">{h.quantity.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-black">{h.weightKg.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-700">₨{h.revenue.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600">₨{h.expenses.fingerling.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600">₨{h.expenses.feed.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600">₨{h.expenses.fertilizer.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-600">₨{h.expenses.other.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-red-700">₨{h.expenses.total.toLocaleString()}</td>
                                <td className={`px-4 py-3 text-right font-bold ${h.isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                                    {h.isProfitable ? '' : '-'}₨{Math.abs(h.profit).toLocaleString()}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${h.roiPercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {h.roiPercent}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* Totals Row */}
                    <tfoot>
                        <tr className="border-t-2 border-black bg-gray-100 font-bold">
                            <td className="px-4 py-3 text-black" colSpan={3}>TOTALS</td>
                            <td className="px-4 py-3 text-right text-black">{summary.totalFishHarvested.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-black">{summary.totalWeightHarvested.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-green-700">₨{summary.totalRevenue.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-600" colSpan={4}></td>
                            <td className="px-4 py-3 text-right text-red-700">₨{summary.totalAllocatedExpenses.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-right ${summary.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {summary.totalProfit >= 0 ? '' : '-'}₨{Math.abs(summary.totalProfit).toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-right ${summary.overallROI >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {summary.overallROI}%
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

