"use client";
import { Loader2 } from "lucide-react";

export default function StockingRuleModal({ 
    isOpen, 
    onClose, 
    editingStockingRule, 
    stockingRuleForm, 
    setStockingRuleForm, 
    handleStockingRuleSubmit, 
    ruleAction 
}) {
    if (!isOpen) return null;

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6">{editingStockingRule ? 'Edit Stocking Rule' : 'Add Stocking Rule'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Stage</label>
                        <select value={stockingRuleForm.Stage} onChange={e => setStockingRuleForm({ ...stockingRuleForm, Stage: e.target.value })} className={inputCls}>
                            <option>Nursery</option>
                            <option>Grown-out</option>
                        </select>
                    </div>
                    <div><label className={labelCls}>Cultivation Type</label>
                        <select value={stockingRuleForm.CultivationType} onChange={e => setStockingRuleForm({ ...stockingRuleForm, CultivationType: e.target.value })} className={inputCls}>
                            <option>Extensive</option>
                            <option>Semi-Intensive</option>
                            <option>Intensive</option>
                        </select>
                    </div>
                    <div><label className={labelCls}>Culture Type</label>
                        <select value={stockingRuleForm.CultureType} onChange={e => setStockingRuleForm({ ...stockingRuleForm, CultureType: e.target.value })} className={inputCls}>
                            <option>Monoculture</option>
                            <option>Polyculture</option>
                        </select>
                    </div>
                    <div><label className={labelCls}>Max Species Allowed</label>
                        <input type="number" value={stockingRuleForm.MaxSpeciesAllowed} onChange={e => setStockingRuleForm({ ...stockingRuleForm, MaxSpeciesAllowed: e.target.value === '' ? '' : parseInt(e.target.value) })} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Min Fish Per Acre</label>
                        <input type="number" value={stockingRuleForm.MinFishPerAcre} onChange={e => setStockingRuleForm({ ...stockingRuleForm, MinFishPerAcre: e.target.value === '' ? '' : parseInt(e.target.value) })} className={inputCls} />
                    </div>
                    <div><label className={labelCls}>Max Fish Per Acre</label>
                        <input type="number" value={stockingRuleForm.MaxFishPerAcre} onChange={e => setStockingRuleForm({ ...stockingRuleForm, MaxFishPerAcre: e.target.value === '' ? '' : parseInt(e.target.value) })} className={inputCls} />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl">Cancel</button>
                    <button onClick={handleStockingRuleSubmit} disabled={ruleAction === 'submitting-stocking'} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50">
                        {ruleAction === 'submitting-stocking' && <Loader2 size={14} className="animate-spin" />}{editingStockingRule ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
