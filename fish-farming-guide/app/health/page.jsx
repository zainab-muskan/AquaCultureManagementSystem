"use client";

import React, { useState, useEffect } from "react";
import { farmApi } from "@/integration/farmApi";
import TreatmentModal from "@/components/layout/TreatmentModal";
import {
    HeartPulse,
    AlertTriangle,
    CheckCircle2,
    Pill,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Search,
    Shield,
    Clock,
    Trash2,
    BookOpen,
} from "lucide-react";

export default function HealthPage() {
    const [dashboard, setDashboard] = useState(null);
    const [outbreaks, setOutbreaks] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("outbreaks"); // outbreaks | catalog
    const [expandedOutbreak, setExpandedOutbreak] = useState(null);
    const [treatments, setTreatments] = useState({});
    const [treatmentModal, setTreatmentModal] = useState(null);
    const [catalogSearch, setCatalogSearch] = useState("");

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [dashRes, outbreakRes, catalogRes] = await Promise.allSettled([
                farmApi.getDiseaseDashboard(),
                farmApi.getOutbreaks(),
                farmApi.getDiseaseCatalog(),
            ]);
            if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
            if (outbreakRes.status === 'fulfilled') setOutbreaks(outbreakRes.value || []);
            if (catalogRes.status === 'fulfilled') setCatalog(catalogRes.value || []);
        } catch (err) {
            console.error("Failed to load health data:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (outbreakId) => {
        if (expandedOutbreak === outbreakId) {
            setExpandedOutbreak(null);
            return;
        }
        setExpandedOutbreak(outbreakId);
        if (!treatments[outbreakId]) {
            try {
                const data = await farmApi.getOutbreakTreatments(outbreakId);
                setTreatments((prev) => ({ ...prev, [outbreakId]: data }));
            } catch (err) {
                console.error("Failed to load treatments:", err);
            }
        }
    };

    const handleStatusChange = async (outbreakId, newStatus) => {
        try {
            await farmApi.updateOutbreak(outbreakId, { status: newStatus });
            await loadAll();
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const handleDeleteOutbreak = async (outbreakId, name) => {
        if (!confirm(`Delete outbreak "${name}"? This will also delete all related treatments.`)) return;
        try {
            await farmApi.deleteOutbreak(outbreakId);
            await loadAll();
        } catch (err) {
            alert("Failed to delete outbreak.");
        }
    };

    const statusConfig = {
        Active: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", icon: AlertTriangle },
        Treating: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", icon: Pill },
        Resolved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", icon: CheckCircle2 },
    };

    const severityConfig = {
        Mild: "bg-green-100 text-green-700",
        Moderate: "bg-yellow-100 text-yellow-700",
        Severe: "bg-orange-100 text-orange-700",
        Critical: "bg-red-100 text-red-700",
    };

    const categoryColors = {
        Bacterial: "bg-red-50 text-red-700 border-red-200",
        Viral: "bg-purple-50 text-purple-700 border-purple-200",
        Fungal: "bg-amber-50 text-amber-700 border-amber-200",
        Parasitic: "bg-orange-50 text-orange-700 border-orange-200",
        Nutritional: "bg-blue-50 text-blue-700 border-blue-200",
    };

    const filteredCatalog = catalog.filter(d =>
        d.DiseaseName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        d.Category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        d.Symptoms.toLowerCase().includes(catalogSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <HeartPulse className="animate-pulse text-rose-500" size={48} />
                    <p className="text-gray-500 font-medium">Loading Health Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fish Health Management</h1>
                <p className="text-sm text-gray-500 mt-1">Track disease outbreaks, treatments, and health status</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard
                    title="Active Outbreaks"
                    value={dashboard?.ActiveOutbreaks || 0}
                    icon={<AlertTriangle size={22} />}
                    color="red"
                />
                <StatCard
                    title="Under Treatment"
                    value={dashboard?.TreatingOutbreaks || 0}
                    icon={<Pill size={22} />}
                    color="amber"
                />
                <StatCard
                    title="Resolved"
                    value={dashboard?.ResolvedOutbreaks || 0}
                    icon={<CheckCircle2 size={22} />}
                    color="green"
                />
                <StatCard
                    title="Affected Ponds"
                    value={dashboard?.AffectedPonds || 0}
                    icon={<Shield size={22} />}
                    color="blue"
                />
                <StatCard
                    title="Treatment Cost"
                    value={`₹${Math.round(dashboard?.TotalTreatmentCost || 0).toLocaleString()}`}
                    icon={<DollarSign size={22} />}
                    color="purple"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab("outbreaks")}
                    className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all ${activeTab === "outbreaks"
                        ? "bg-white text-rose-700 border border-b-0 border-gray-200 -mb-[1px]"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <HeartPulse size={16} />
                        Outbreaks ({outbreaks.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("catalog")}
                    className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all ${activeTab === "catalog"
                        ? "bg-white text-blue-700 border border-b-0 border-gray-200 -mb-[1px]"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        Disease Catalog ({catalog.length})
                    </div>
                </button>
            </div>

            {/* Outbreaks Tab */}
            {activeTab === "outbreaks" && (
                <div className="space-y-4">
                    {outbreaks.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <div className="bg-green-50 p-4 rounded-full inline-block mb-4">
                                <CheckCircle2 size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">All Clear!</h3>
                            <p className="text-sm text-gray-500">No disease outbreaks recorded. Your fish are healthy.</p>
                        </div>
                    ) : (
                        outbreaks.map((o) => {
                            const config = statusConfig[o.Status] || statusConfig.Active;
                            const StatusIcon = config.icon;
                            const isExpanded = expandedOutbreak === o.OutbreakId;
                            const outbreakTreatments = treatments[o.OutbreakId] || [];

                            return (
                                <div key={o.OutbreakId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Outbreak header */}
                                    <div
                                        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                        onClick={() => toggleExpand(o.OutbreakId)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2 rounded-xl ${config.bg} shrink-0`}>
                                                    <StatusIcon size={18} className={config.text} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-gray-900 text-sm">{o.DiseaseName}</h3>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border} uppercase`}>
                                                            {o.Status}
                                                        </span>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${severityConfig[o.Severity] || severityConfig.Moderate}`}>
                                                            {o.Severity}
                                                        </span>
                                                        {o.DiseaseCategory && (
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[o.DiseaseCategory] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                                {o.DiseaseCategory}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        <span className="font-semibold text-gray-700">{o.PondName}</span>
                                                        {o.AffectedSpeciesName && <> • {o.AffectedSpeciesName}</>}
                                                        {o.EstimatedAffectedCount && <> • ~{o.EstimatedAffectedCount.toLocaleString()} fish</>}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(o.NotedAt).toLocaleDateString()} • {o.TreatmentCount} treatment{o.TreatmentCount !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {o.Status !== "Resolved" && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setTreatmentModal(o); }}
                                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        + Treat
                                                    </button>
                                                )}
                                                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 bg-gray-50/30">
                                            <div className="p-4 sm:p-5 space-y-4">
                                                {/* Symptoms */}
                                                {o.SymptomsObserved && (
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Symptoms Observed</h4>
                                                        <p className="text-xs text-gray-700 leading-relaxed">{o.SymptomsObserved}</p>
                                                    </div>
                                                )}

                                                {/* Recommended treatment */}
                                                {o.RecommendedTreatment && (
                                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1">Recommended Treatment</h4>
                                                        <p className="text-[11px] text-blue-800 leading-relaxed font-medium">{o.RecommendedTreatment}</p>
                                                    </div>
                                                )}

                                                {o.Notes && (
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Notes</h4>
                                                        <p className="text-xs text-gray-700">{o.Notes}</p>
                                                    </div>
                                                )}

                                                {/* Treatment History */}
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Treatment History</h4>
                                                    {outbreakTreatments.length === 0 ? (
                                                        <p className="text-xs text-gray-400 italic">No treatments logged yet.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {outbreakTreatments.map((t) => (
                                                                <div key={t.TreatmentId} className="bg-white rounded-xl border border-gray-100 p-3">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-bold text-gray-800">{t.TreatmentType}</span>
                                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.Outcome === "Improved" ? "bg-green-100 text-green-700"
                                                                                : t.Outcome === "Worsened" ? "bg-red-100 text-red-700"
                                                                                    : t.Outcome === "No Change" ? "bg-amber-100 text-amber-700"
                                                                                        : "bg-gray-100 text-gray-600"
                                                                                }`}>
                                                                                {t.Outcome}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-400">
                                                                            {new Date(t.AppliedAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-600">{t.Description}</p>
                                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                                                                        {t.Dosage && <span>Dosage: <strong className="text-gray-600">{t.Dosage}</strong></span>}
                                                                        {t.Cost > 0 && <span>Cost: <strong className="text-gray-600">₹{t.Cost}</strong></span>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    {o.Status === "Active" && (
                                                        <button
                                                            onClick={() => handleStatusChange(o.OutbreakId, "Treating")}
                                                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                                        >
                                                            Mark as Treating
                                                        </button>
                                                    )}
                                                    {o.Status !== "Resolved" && (
                                                        <button
                                                            onClick={() => handleStatusChange(o.OutbreakId, "Resolved")}
                                                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                                                        >
                                                            Mark Resolved
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setTreatmentModal(o)}
                                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-1"><Pill size={12} /> Add Treatment</span>
                                                    </button>
                                                    <div className="flex-1" />
                                                    <button
                                                        onClick={() => handleDeleteOutbreak(o.OutbreakId, o.DiseaseName)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Delete outbreak"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Catalog Tab */}
            {activeTab === "catalog" && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            placeholder="Search diseases, symptoms..."
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredCatalog.map((d) => (
                            <div key={d.DiseaseId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{d.DiseaseName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[d.Category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                {d.Category}
                                            </span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${severityConfig[d.Severity] || severityConfig.Moderate}`}>
                                                {d.Severity}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-[11px]">
                                    <div>
                                        <h4 className="font-black text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">Symptoms</h4>
                                        <p className="text-gray-700 leading-relaxed">{d.Symptoms}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">Affected Species</h4>
                                        <p className="text-gray-700">{d.AffectedSpecies}</p>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                        <h4 className="font-black text-emerald-900 uppercase tracking-wider text-[10px] mb-0.5">Treatment</h4>
                                        <p className="text-emerald-800 leading-relaxed font-medium">{d.RecommendedTreatment}</p>
                                    </div>
                                    {d.PreventionTips && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                            <h4 className="font-black text-blue-900 uppercase tracking-wider text-[10px] mb-0.5">Prevention</h4>
                                            <p className="text-blue-800 leading-relaxed font-medium">{d.PreventionTips}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Treatment Modal */}
            <TreatmentModal
                isOpen={!!treatmentModal}
                outbreak={treatmentModal}
                onClose={() => setTreatmentModal(null)}
                onSuccess={async () => {
                    await loadAll();
                    // Refresh treatments for the expanded outbreak
                    if (expandedOutbreak) {
                        const data = await farmApi.getOutbreakTreatments(expandedOutbreak);
                        setTreatments((prev) => ({ ...prev, [expandedOutbreak]: data }));
                    }
                }}
            />
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colors = {
        red: "bg-red-50 text-red-600 border-red-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        green: "bg-green-50 text-green-600 border-green-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl border ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{title}</p>
        </div>
    );
}
