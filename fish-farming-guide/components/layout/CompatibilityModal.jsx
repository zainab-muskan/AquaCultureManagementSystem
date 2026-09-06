"use client";
import { Loader2 } from "lucide-react";

export default function CompatibilityModal({ 
    isOpen, 
    onClose, 
    compForm, 
    setCompForm, 
    approvedSpecies, 
    handleCompSubmit, 
    ruleAction 
}) {
    if (!isOpen) return null;

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6">Add Compatibility Rule</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Species</label>
                        <select value={compForm.speciesId} onChange={e => setCompForm({ ...compForm, speciesId: e.target.value })} className={inputCls}>
                            <option value="">Select...</option>
                            {approvedSpecies.map(s => <option key={s.SpeciesId} value={s.SpeciesId}>{s.Name}</option>)}
                        </select>
                    </div>
                    <div><label className={labelCls}>Compatible With</label>
                        <select value={compForm.compatibleWithId} onChange={e => setCompForm({ ...compForm, compatibleWithId: e.target.value })} className={inputCls}>
                            <option value="">Select...</option>
                            {approvedSpecies.map(s => <option key={s.SpeciesId} value={s.SpeciesId}>{s.Name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2"><label className={labelCls}>Reason / Benefit</label>
                        <textarea rows="3" value={compForm.reason} onChange={e => setCompForm({ ...compForm, reason: e.target.value })} className={inputCls} placeholder="Explain why these species are compatible..."></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl">Cancel</button>
                    <button onClick={handleCompSubmit} disabled={ruleAction === 'submitting-comp'} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50">
                        {ruleAction === 'submitting-comp' && <Loader2 size={14} className="animate-spin" />}Add Rule
                    </button>
                </div>
            </div>
        </div>
    );
}
