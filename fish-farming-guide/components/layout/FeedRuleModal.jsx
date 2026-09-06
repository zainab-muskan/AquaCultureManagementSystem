"use client";
import { Loader2 } from "lucide-react";

export default function FeedRuleModal({ 
    isOpen, 
    onClose, 
    editingFeedRule, 
    feedRuleForm, 
    setFeedRuleForm, 
    approvedSpecies, 
    handleFeedRuleSubmit, 
    ruleAction 
}) {
    if (!isOpen) return null;

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-black text-slate-900 mb-6">{editingFeedRule ? 'Edit Feed Rule' : 'New Feed Rule'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className={labelCls}>Species</label>
                        <select value={feedRuleForm.speciesId} onChange={e => setFeedRuleForm({ ...feedRuleForm, speciesId: e.target.value })} className={inputCls}>
                            <option value="">Select Species</option>
                            {approvedSpecies.map(s => <option key={s.SpeciesId} value={s.SpeciesId}>{s.Name}</option>)}
                        </select>
                    </div>
                    <div><label className={labelCls}>Stage</label>
                        <select value={feedRuleForm.stage} onChange={e => setFeedRuleForm({ ...feedRuleForm, stage: e.target.value })} className={inputCls}>
                            <option value="Fingerling">Fingerling</option><option value="Grow-out">Grow-out</option><option value="Market">Market</option>
                        </select>
                    </div>
                    <div><label className={labelCls}>Feed Type</label><input type="text" value={feedRuleForm.feedType} onChange={e => setFeedRuleForm({ ...feedRuleForm, feedType: e.target.value })} className={inputCls} placeholder="e.g. Fine Pellets" /></div>
                    <div><label className={labelCls}>Min Size (inch)</label><input type="number" step="0.1" value={feedRuleForm.minSize} onChange={e => setFeedRuleForm({ ...feedRuleForm, minSize: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Max Size (inch)</label><input type="number" step="0.1" value={feedRuleForm.maxSize} onChange={e => setFeedRuleForm({ ...feedRuleForm, maxSize: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Daily Rate (%)</label><input type="number" step="0.1" value={feedRuleForm.dailyRate} onChange={e => setFeedRuleForm({ ...feedRuleForm, dailyRate: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Condition Factor (K)</label><input type="number" step="0.001" value={feedRuleForm.conditionFactor} onChange={e => setFeedRuleForm({ ...feedRuleForm, conditionFactor: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div className="col-span-2"><label className={labelCls}>Frequency</label><input type="text" value={feedRuleForm.frequency} onChange={e => setFeedRuleForm({ ...feedRuleForm, frequency: e.target.value })} className={inputCls} placeholder="e.g. 3 times daily" /></div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl">Cancel</button>
                    <button onClick={handleFeedRuleSubmit} disabled={ruleAction === 'submitting'} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50">
                        {ruleAction === 'submitting' && <Loader2 size={14} className="animate-spin" />}{editingFeedRule ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
