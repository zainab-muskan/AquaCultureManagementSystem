"use client";

import { X, Utensils, Clock, FileText, AlertCircle, Scale, Timer, CalendarClock } from "lucide-react";

export default function FeedInfoModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const { speciesName, pondName, feedLog, feedingFrequency, totalFeedKg, scheduleEntry } = data;
    const hasFeedLog = !!feedLog;

    // Calculate time ago
    const getTimeAgo = (isoTime) => {
        const now = new Date();
        const past = new Date(isoTime);
        const diffMs = now.getTime() - past.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
        if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
        return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    };

    // Format minutes into readable countdown
    const formatCountdown = (minutes) => {
        if (minutes === null || minutes === undefined) return "N/A";
        const absMin = Math.abs(minutes);
        if (absMin < 60) return `${absMin} min`;
        const hrs = Math.floor(absMin / 60);
        const mins = absMin % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    // Next feed status config
    const getStatusConfig = (status) => {
        switch (status) {
            case 'overdue':
                return {
                    bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100',
                    iconColor: 'text-red-600', labelColor: 'text-red-600',
                    valueColor: 'text-red-900', badge: 'bg-red-100 text-red-700 border-red-300',
                    badgeText: '🔴 OVERDUE', animate: 'animate-pulse'
                };
            case 'due_soon':
                return {
                    bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600', labelColor: 'text-amber-600',
                    valueColor: 'text-amber-900', badge: 'bg-amber-100 text-amber-700 border-amber-300',
                    badgeText: '🟡 DUE SOON', animate: ''
                };
            case 'on_track':
                return {
                    bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100',
                    iconColor: 'text-emerald-600', labelColor: 'text-emerald-600',
                    valueColor: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                    badgeText: '🟢 ON TRACK', animate: ''
                };
            default:
                return {
                    bg: 'bg-gray-50', border: 'border-gray-200', iconBg: 'bg-gray-200',
                    iconColor: 'text-gray-500', labelColor: 'text-gray-500',
                    valueColor: 'text-gray-800', badge: 'bg-gray-100 text-gray-600 border-gray-300',
                    badgeText: '⚪ NO DATA', animate: ''
                };
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b shrink-0 relative bg-gradient-to-r from-blue-50 to-white">
                    <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm transition-colors">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Feeding Info</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {speciesName} • {pondName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Feeding Schedule Card */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                            <div className="p-2.5 bg-amber-100 rounded-lg shrink-0 mt-1">
                                <Utensils size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Recommended Schedule</p>
                                <p className="text-base font-bold text-amber-900">{feedingFrequency}</p>
                                {scheduleEntry && (
                                    <p className="text-[11px] text-amber-700/70 mt-1 font-medium">
                                        {scheduleEntry.feedsPerDay}× per day • Every {scheduleEntry.intervalHours}h
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Total Feed Card */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-4">
                            <div className="p-2.5 bg-indigo-100 rounded-lg shrink-0 mt-1">
                                <Scale size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Total Feed Given (All Time)</p>
                                <p className="text-xl font-black text-indigo-900">{totalFeedKg ? totalFeedKg.toLocaleString() : "0"} <span className="text-sm font-bold text-indigo-700">kg</span></p>
                            </div>
                        </div>
                    </div>

                    {/* NEXT FEED DUE — DB-Driven Schedule Card */}
                    {scheduleEntry && (
                        <div className="mt-2">
                            <h3 className="text-base font-bold text-gray-800 mb-3 px-1">Next Feed Schedule</h3>
                            {(() => {
                                const cfg = getStatusConfig(scheduleEntry.status);
                                return (
                                    <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 space-y-4 ${cfg.animate}`}>
                                        {/* Status + Countdown Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 ${cfg.iconBg} rounded-lg shrink-0`}>
                                                    <Timer size={22} className={cfg.iconColor} />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold ${cfg.labelColor} uppercase tracking-wider mb-0.5`}>
                                                        {scheduleEntry.status === 'overdue' ? 'Feed Overdue By' :
                                                         scheduleEntry.status === 'no_data' ? 'Not Yet Fed' :
                                                         'Next Feed In'}
                                                    </p>
                                                    <p className={`text-2xl font-black ${cfg.valueColor}`}>
                                                        {scheduleEntry.status === 'no_data' ? '—' : formatCountdown(scheduleEntry.minutesUntilDue)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${cfg.badge} uppercase tracking-wider`}>
                                                {cfg.badgeText}
                                            </span>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {scheduleEntry.lastFedAt && (
                                                <div className="bg-white/60 rounded-lg p-3 border border-white/80">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Clock size={12} className="text-gray-400" />
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Last Fed</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800">{getTimeAgo(scheduleEntry.lastFedAt)}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        {new Date(scheduleEntry.lastFedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                            {scheduleEntry.nextFeedDue && (
                                                <div className="bg-white/60 rounded-lg p-3 border border-white/80">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <CalendarClock size={12} className="text-gray-400" />
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due At</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        {new Date(scheduleEntry.nextFeedDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        {new Date(scheduleEntry.nextFeedDue).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Feed Type Info */}
                                        {scheduleEntry.feedType && (
                                            <div className="flex items-center gap-2 bg-white/40 rounded-lg px-3 py-2 border border-white/60">
                                                <Utensils size={12} className="text-gray-400" />
                                                <span className="text-[11px] font-bold text-gray-600">Recommended Feed Type:</span>
                                                <span className="text-[11px] font-black text-gray-800">{scheduleEntry.feedType}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-base font-bold text-gray-800 mb-4 px-1">Latest Feeding Log</h3>
                        {hasFeedLog ? (
                            <div className="space-y-3">
                                {/* Last Fed Time */}
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                                    <div className="p-2.5 bg-emerald-100 rounded-lg shrink-0">
                                        <Clock size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Time Elapsed</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-base font-bold text-emerald-900">{getTimeAgo(feedLog.time)}</p>
                                            <p className="text-xs font-medium text-emerald-700">
                                                ({new Date(feedLog.time).toLocaleString()})
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                                    <div className="p-2.5 bg-gray-200 rounded-lg shrink-0">
                                        <FileText size={20} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Log Details</p>
                                        <p className="text-sm font-medium text-gray-800">{feedLog.message}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                                <div className="p-3 bg-red-100 rounded-full shrink-0">
                                    <AlertCircle size={28} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-red-800">No Feeding Logs Found</p>
                                    <p className="text-sm text-red-600 mt-1 max-w-sm mx-auto">
                                        No recent feeding has been recorded for {speciesName} in this pond. Use the "Manage Feed" button on the dashboard to log your first feeding.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
