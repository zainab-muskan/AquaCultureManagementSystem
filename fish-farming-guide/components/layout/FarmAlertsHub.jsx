"use client";
import React from 'react';
import { AlertTriangle, Droplets, Utensils, FlaskConical, HeartPulse, Scissors, ArrowRightLeft, Clock, Info, CheckCircle2 } from 'lucide-react';

export default function FarmAlertsHub({ ponds, waterAlerts, waterSummary, diseaseOutbreaks, feedSchedule, fertilizerSchedule, onClose }) {
    
    const alerts = [];

    // 1. Water Quality Alerts
    (waterAlerts || []).forEach(alert => {
        alerts.push({
            id: `water-${alert.id || Math.random()}`,
            type: 'water',
            priority: 'critical',
            title: `Water Quality Alert in ${alert.pond}`,
            message: `${alert.parameter} is abnormal.`,
            icon: <Droplets size={16} />,
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            borderColor: 'border-red-200'
        });
    });

    // 2. Disease Alerts
    (diseaseOutbreaks || []).forEach(disease => {
        if (disease.Status !== 'Resolved') {
            alerts.push({
                id: `disease-${disease.OutbreakId}`,
                type: 'disease',
                priority: disease.Severity === 'Critical' ? 'critical' : 'warning',
                title: `Disease Outbreak: ${disease.DiseaseName}`,
                message: `Active in ${disease.PondName}. Status: ${disease.Status}`,
                icon: <HeartPulse size={16} />,
                bgColor: disease.Severity === 'Critical' ? 'bg-red-50' : 'bg-orange-50',
                textColor: disease.Severity === 'Critical' ? 'text-red-700' : 'text-orange-700',
                borderColor: disease.Severity === 'Critical' ? 'border-red-200' : 'border-orange-200'
            });
        }
    });

    // 3. Fertilizer Alerts
    (fertilizerSchedule || []).forEach(fs => {
        if (fs.status === 'overdue' || fs.status === 'due_soon') {
            alerts.push({
                id: `fert-${fs.pondId}`,
                type: 'fertilizer',
                priority: fs.status === 'overdue' ? 'critical' : 'warning',
                title: `Fertilizer ${fs.status === 'overdue' ? 'Overdue' : 'Due Soon'}`,
                message: `${fs.pondName} is scheduled for fertilizer application.`,
                icon: <FlaskConical size={16} />,
                bgColor: fs.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50',
                textColor: fs.status === 'overdue' ? 'text-red-700' : 'text-amber-700',
                borderColor: fs.status === 'overdue' ? 'border-red-200' : 'border-amber-200'
            });
        }
    });

    // 4. Feed Alerts
    (feedSchedule || []).forEach(fs => {
        if (fs.status === 'overdue' || fs.status === 'due_soon') {
            alerts.push({
                id: `feed-${fs.stockId}`,
                type: 'feed',
                priority: fs.status === 'overdue' ? 'critical' : 'warning',
                title: `Feed ${fs.status === 'overdue' ? 'Overdue' : 'Due Soon'}`,
                message: `${fs.speciesName} in ${fs.pondName} needs feeding.`,
                icon: <Utensils size={16} />,
                bgColor: fs.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50',
                textColor: fs.status === 'overdue' ? 'text-red-700' : 'text-amber-700',
                borderColor: fs.status === 'overdue' ? 'border-red-200' : 'border-amber-200'
            });
        }
    });

    // 5. Pond/Batch Checks (Harvest, Transfer, Size Updates)
    const now = new Date();
    (ponds || []).forEach(pond => {
        if (pond.needsMaintenance) {
            alerts.push({
                id: `maint-${pond.id}`,
                type: 'maintenance',
                priority: 'info',
                title: `Maintenance Required`,
                message: `${pond.pondName || pond.name} requires scheduled maintenance.`,
                icon: <Info size={16} />,
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-200'
            });
        }

        // Water Quality Not Checked Alert (using 3 days threshold)
        const wqSummary = (waterSummary || []).find(w => w.PondId === pond.id);
        if (wqSummary && wqSummary.recorded_at) {
            const lastWqCheck = new Date(wqSummary.recorded_at);
            const daysSinceWqCheck = Math.floor((now - lastWqCheck) / (1000 * 60 * 60 * 24));
            if (daysSinceWqCheck >= 3) {
                alerts.push({
                    id: `wq-overdue-${pond.id}`,
                    type: 'water-overdue',
                    priority: 'warning',
                    title: `Water Test Overdue`,
                    message: `${pond.pondName || pond.name} water hasn't been tested in ${daysSinceWqCheck} days.`,
                    icon: <Droplets size={16} />,
                    bgColor: 'bg-orange-50',
                    textColor: 'text-orange-700',
                    borderColor: 'border-orange-200'
                });
            }
        } else if (pond.species && pond.species.length > 0) {
            // If it's stocked but NEVER checked
            alerts.push({
                id: `wq-never-${pond.id}`,
                type: 'water-overdue',
                priority: 'warning',
                title: `Water Test Needed`,
                message: `${pond.pondName || pond.name} is stocked but water parameters have never been logged.`,
                icon: <Droplets size={16} />,
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-700',
                borderColor: 'border-orange-200'
            });
        }

        (pond.species || []).forEach((f, i) => {
            // Harvest
            if (Number(f.currentSize) >= Number(f.targetSize)) {
                alerts.push({
                    id: `harvest-${pond.id}-${i}`,
                    type: 'harvest',
                    priority: 'success',
                    title: `Ready for Harvest`,
                    message: `${f.species} in ${pond.pondName || pond.name} has reached target size.`,
                    icon: <Scissors size={16} />,
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-700',
                    borderColor: 'border-emerald-200'
                });
            }

            // Transfer (Nursery)
            if (Number(f.currentSize) >= 6 && String(pond.stage || pond.pondType || "").toLowerCase().includes("nursery")) {
                alerts.push({
                    id: `transfer-${pond.id}-${i}`,
                    type: 'transfer',
                    priority: 'success',
                    title: `Ready for Transfer`,
                    message: `${f.species} in ${pond.pondName || pond.name} is ready to move to Grow-out.`,
                    icon: <ArrowRightLeft size={16} />,
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-700',
                    borderColor: 'border-emerald-200'
                });
            }

            // Size Not Updated (using 7 days threshold)
            if (f.lastUpdateDate) {
                const lastUpdate = new Date(f.lastUpdateDate);
                const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
                if (daysSinceUpdate >= 7) {
                    alerts.push({
                        id: `size-${pond.id}-${i}`,
                        type: 'size',
                        priority: 'info',
                        title: `Size Update Overdue`,
                        message: `${f.species} in ${pond.pondName || pond.name} hasn't been measured in ${daysSinceUpdate} days.`,
                        icon: <Clock size={16} />,
                        bgColor: 'bg-indigo-50',
                        textColor: 'text-indigo-700',
                        borderColor: 'border-indigo-200'
                    });
                }
            } else {
                 // If no last update date, maybe it was just stocked. Let's look at stocking date if available.
                 if (f.stockingDate) {
                     const stockDate = new Date(f.stockingDate);
                     const daysSinceStock = Math.floor((now - stockDate) / (1000 * 60 * 60 * 24));
                     if (daysSinceStock >= 7) {
                         alerts.push({
                            id: `size-never-${pond.id}-${i}`,
                            type: 'size',
                            priority: 'info',
                            title: `Initial Measurement Needed`,
                            message: `${f.species} in ${pond.pondName || pond.name} was stocked ${daysSinceStock} days ago and needs a size update.`,
                            icon: <Clock size={16} />,
                            bgColor: 'bg-indigo-50',
                            textColor: 'text-indigo-700',
                            borderColor: 'border-indigo-200'
                        });
                     }
                 }
            }
        });
    });

    // Sort: Critical first, then warnings, then info/success
    const priorityOrder = { 'critical': 0, 'warning': 1, 'info': 2, 'success': 3 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl shrink-0">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Farm Alerts</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {alerts.length} Total
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-1 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 transition-colors">
                        Close
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                    {alerts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <CheckCircle2 size={40} className="mx-auto text-emerald-300 mb-3" />
                            <p className="font-semibold">All clear! No pending alerts.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded border ${alert.bgColor} ${alert.borderColor}`}>
                                    <div className={`mt-0.5 ${alert.textColor}`}>
                                        {alert.icon}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${alert.textColor}`}>
                                            {alert.title}
                                        </h4>
                                        <p className="text-sm text-gray-800 mt-0.5">
                                            {alert.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
