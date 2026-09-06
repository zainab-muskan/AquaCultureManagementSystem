"use client";

import { useState, useEffect } from "react";
import { Plus, Fish, Droplet, DollarSign, Package, AlertCircle, Droplets, Utensils, BookOpen } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function FeedingManagementPage() {
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Data State
    const [stats, setStats] = useState({ fedTodayKg: 0, costToday: 0, pondsFedCount: 0, activePonds: 0 });
    const [rulesAll, setRulesAll] = useState([]);
    const [activePondsList, setActivePondsList] = useState([]);
    const [feedTypes, setFeedTypes] = useState(["Floating Pellets", "Sinking Pellets", "Powder Feed", "Live Feed"]);

    // Form State
    const [formData, setFormData] = useState({
        pondId: "",
        feedType: "",
        quantity: "",
        cost: ""
    });

    // Feed Recommendation State
    const [recommendations, setRecommendations] = useState([]);
    const [activeSpeciesId, setActiveSpeciesId] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashStats, rules, ponds, typesDb] = await Promise.all([
                farmApi.getFeedDashboard().catch(() => ({ fedTodayKg: 0, costToday: 0, pondsFedCount: 0, activePonds: 0 })),
                farmApi.getFeedRulesAll().catch(() => []),
                farmApi.getPonds().catch(() => []),
                farmApi.getFeedTypes().catch(() => [])
            ]);

            setStats(dashStats);
            setRulesAll(rules || []);
            setActivePondsList(ponds || []);

            if (typesDb && typesDb.length > 0) {
                setFeedTypes(typesDb);
            }
        } catch (error) {
            console.error("Failed to load feeding data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePondChange = async (e) => {
        const pondId = e.target.value;
        setFormData({ ...formData, pondId, feedType: "" });
        setRecommendations([]);
        setActiveSpeciesId("");

        try {
            const data = await farmApi.getFeedRecommendation(pondId);
            const recs = data?.recommendations || [];

            setRecommendations(recs);

            if (recs.length > 0) {
                // Default to first species
                const first = recs[0];
                setActiveSpeciesId(`${first.speciesId}-0`);
                if (first.recommendation) {
                    setFormData(prev => ({ ...prev, feedType: first.recommendation.feedType }));
                }
            }
        } catch (err) {
            console.error("Failed to fetch feed recommendations:", err);
        }
    };

    const handleSpeciesChange = (e) => {
        const val = e.target.value;
        setActiveSpeciesId(val);
        const [sid, idx] = val.split('-');
        const rec = recommendations[parseInt(idx, 10)];

        if (rec?.recommendation) {
            setFormData(prev => ({ ...prev, feedType: rec.recommendation.feedType, quantity: rec.recommendation.dailyQty_kg || "" }));
        } else {
            setFormData(prev => ({ ...prev, feedType: "", quantity: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMessage("");

        try {
            // Find the primary species in the pond for the log (or just default to the first one)
            const speciesId = activeSpeciesId ? activeSpeciesId.split('-')[0] : (selectedPond?.species?.[0]?.SpeciesId || 0);

            await farmApi.logFeed({
                pondId: formData.pondId,
                speciesId: speciesId,
                feedType: formData.feedType,
                quantity: parseFloat(formData.quantity),
                cost: parseFloat(formData.cost)
            });

            setSuccessMessage("Feeding logged successfully!");
            setFormData({ pondId: "", feedType: "", quantity: "", cost: "" });
            setTimeout(() => {
                setSuccessMessage("");
                setIsFormOpen(false);
            }, 2000);

            // Refresh stats to show immediate update
            fetchData();
        } catch (error) {
            console.error("Submission failed:", error);
            // If error is an object with a message, use it; otherwise fallback
            const msg = error?.message || "Failed to log feeding session. Please ensure you have sufficient stock.";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-slate-900 px-4 sm:px-8 py-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Feeding Management</h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">Track feeding schedules and manage fish nutrition</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
                    >
                        <Plus size={18} />
                        {isFormOpen ? "Close Details" : "Add Feeding"}
                    </button>
                </div>

                {/* Inline Form (Matches the large white box in mockup) */}
                {isFormOpen && (
                    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 sm:p-8 animate-in slide-in-from-top-4 fade-in duration-300">
                        <h2 className="text-gray-700 font-bold mb-6 text-[15px]">Record Feeding</h2>

                        {successMessage && (
                            <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
                                <Plus size={16} /> {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Row 1 */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Select Pond <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formData.pondId}
                                        onChange={handlePondChange}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    >
                                        <option value="" disabled>Choose a pond</option>
                                        {activePondsList.map(pond => {
                                            // Extract species names if they exist, fallback if empty
                                            const speciesNames = pond.species && pond.species.length > 0
                                                ? pond.species.map(s => s.SpeciesName).join(", ")
                                                : "No Fish Stocked";

                                            return (
                                                <option key={pond.PondId} value={pond.PondId}>
                                                    {pond.PondName} ({pond.PondType}) - {speciesNames}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Species Selector (Appears if pond has fish) */}
                                {recommendations.length > 0 && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Select Species to Feed <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={activeSpeciesId}
                                            onChange={handleSpeciesChange}
                                            className="w-full bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                                        >
                                            <option value="" disabled>Choose species</option>
                                            {recommendations.map((r, idx) => (
                                                <option key={`${r.speciesId}-${idx}`} value={`${r.speciesId}-${idx}`}>
                                                    {r.speciesName} ({r.currentSize})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Recommendation Alert Box */}
                                {recommendations.length > 0 && activeSpeciesId && (
                                    <div className="md:col-span-2">
                                        {(() => {
                                            const [sid, idx] = activeSpeciesId.split('-');
                                            const currentRec = recommendations[parseInt(idx, 10)];
                                            if (currentRec?.recommendation) {
                                                const isMismatch = formData.feedType && formData.feedType !== currentRec.recommendation.feedType;
                                                return (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                                                        <div className="flex items-center gap-2 text-blue-700">
                                                            <Utensils size={16} />
                                                            <span className="text-xs font-bold uppercase tracking-wider">Database Recommendation: {currentRec.speciesName}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                            <div><span className="text-gray-500 text-xs block">Optimal Feed</span><span className="font-bold text-gray-900">{currentRec.recommendation.feedType}</span></div>
                                                            <div><span className="text-gray-500 text-xs block">Daily Qty</span><span className="font-bold text-gray-900">{currentRec.recommendation.dailyQty_kg} kg</span></div>
                                                            <div><span className="text-gray-500 text-xs block">Frequency</span><span className="font-bold text-gray-900">{currentRec.recommendation.frequency}</span></div>
                                                            <div><span className="text-gray-500 text-xs block">Biomass</span><span className="font-bold text-gray-900">{currentRec.totalBiomass_kg} kg</span></div>
                                                        </div>
                                                        {isMismatch && (
                                                            <div className="mt-2 bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200 text-xs font-medium flex gap-2">
                                                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                                Warning: The feed type you selected does not match the database recommendation for this species' current growth stage.
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } else if (currentRec?.error) {
                                                return (
                                                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm flex items-center gap-2">
                                                        <AlertCircle size={16} />
                                                        {currentRec.error}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}

                                {/* Row 2 */}
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Select Feed Type <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={formData.feedType}
                                        onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    >
                                        <option value="" disabled>Choose feed type</option>
                                        {feedTypes.map(ft => (
                                            <option key={ft} value={ft}>{ft}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Quantity Used (kg) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        placeholder="0.0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Total Cost (PKR) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                                >
                                    {submitting ? "Saving..." : "Save Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[13px] font-bold text-gray-400 mb-1">Fed Today</p>
                        <p className="text-lg font-black text-gray-900">{stats.fedTodayKg.toFixed(1)} <span className="text-sm font-bold text-gray-500">kg</span></p>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[13px] font-bold text-gray-400 mb-1">Ponds Fed</p>
                        <p className="text-lg font-black text-gray-900">{stats.pondsFedCount}/{stats.activePonds}</p>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[13px] font-bold text-gray-400 mb-1">Cost Today</p>
                        <p className="text-lg font-black text-gray-900"><span className="text-sm font-bold text-gray-500">PKR</span> {stats.costToday.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[13px] font-bold text-gray-400 mb-1">Active Ponds</p>
                        <p className="text-lg font-black text-gray-900">{stats.activePonds}</p>
                    </div>
                </div>

                {/* Pond Feeding Status Card */}
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 sm:p-8 min-h-[250px] flex flex-col">
                    <div className="flex items-center gap-2 mb-8">
                        <Fish size={18} className="text-gray-400" />
                        <h2 className="text-gray-700 font-bold text-[14px]">Pond Feeding Status</h2>
                    </div>

                    {stats.pondsFedCount === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                            <Utensils size={32} strokeWidth={1.5} className="text-gray-300 mb-3" />
                            <p className="text-gray-400 text-sm font-medium">No ponds yet. Add ponds to start tracking feeding.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-black">{stats.pondsFedCount}</span>
                            </div>
                            <p className="text-gray-900 text-lg font-bold">Successfully fed {stats.pondsFedCount} ponds today.</p>
                            <p className="text-gray-400 text-sm mt-1">{stats.activePonds - stats.pondsFedCount} remaining to be fed.</p>
                        </div>
                    )}
                </div>

                {/* Species Feeding Habits - Bottom Section */}
                <div className="pt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Species Feeding Habits</h2>
                            <p className="text-sm text-gray-500 font-medium">Nutritional requirements stored in your database</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {rulesAll.map((species) => (
                                <div key={species.SpeciesId} className="bg-white rounded-[16px] sm:rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-8 flex flex-col h-full relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-5">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{species.Name}</h3>
                                            <div className="mt-2">
                                                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold border border-blue-100 uppercase tracking-wide">
                                                    {species.Rules.length} Registered Stages
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-[12px] sm:rounded-[16px] border border-gray-100 flex items-center justify-center text-blue-200 shrink-0 overflow-hidden shadow-sm shadow-gray-100/50">
                                            {species.ImageUrl ? (
                                                <img
                                                    src={species.ImageUrl}
                                                    alt={species.Name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/100x100?text=?";
                                                    }}
                                                />
                                            ) : (
                                                <Fish size={28} strokeWidth={1.5} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {species.Rules.length === 0 ? (
                                            <div className="py-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <p className="text-gray-400 text-sm italic font-medium">No feeding rules defined.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {species.Rules.map((rule, idx) => (
                                                    <div key={rule.RuleId}>
                                                        {idx !== 0 && <div className="h-px bg-gray-50 my-4" />}

                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-gray-900 text-sm">{rule.Stage}</span>
                                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                                                {rule.Rate}% Body Wt
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center text-[13px]">
                                                                <span className="text-gray-500">Size Range:</span>
                                                                <span className="text-gray-900 font-bold">{rule.MinSize}" - {rule.MaxSize}"</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[13px]">
                                                                <span className="text-gray-500">Frequency:</span>
                                                                <span className="text-gray-900 font-bold">{rule.Frequency}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[13px]">
                                                                <span className="text-gray-500">Feed Type:</span>
                                                                <span className="text-gray-900 font-bold">{rule.FeedType}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Best Feeding Practices */}
                <div className="pt-4 pb-12">
                    <div className="bg-[#F0F7FF] border border-[#D0E2FF] rounded-[16px] p-6 text-[13px] text-[#0050D8]">
                        <h3 className="font-semibold mb-3">Best Feeding Practices</h3>
                        <ul className="space-y-1.5 list-disc list-inside">
                            <li>Feed at consistent times daily (morning and evening)</li>
                            <li>Adjust amount based on fish appetite and weather</li>
                            <li>Reduce feeding during cold weather or low oxygen levels</li>
                            <li>Remove uneaten feed after 30 minutes to maintain water quality</li>
                            <li>Monitor fish behavior during feeding</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
