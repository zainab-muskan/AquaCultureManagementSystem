"use client";
import { Loader2 } from "lucide-react";

export default function FertilizerRuleModal({ 
    isOpen, 
    onClose, 
    editingFertRule, 
    fertRuleForm, 
    setFertRuleForm, 
    handleFertRuleSubmit, 
    ruleAction 
}) {
    if (!isOpen) return null;

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-black text-slate-900 mb-6">{editingFertRule ? 'Edit Fertilizer Rule' : 'New Fertilizer Rule'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Cultivation Type</label>
                        <select value={fertRuleForm.cultivationType} onChange={e => setFertRuleForm({ ...fertRuleForm, cultivationType: e.target.value })} className={inputCls}>
                            <option>Intensive</option><option>Semi-Intensive</option><option>Extensive</option>
                        </select>
                    </div>
                    <div><label className={labelCls}>Pond Type</label>
                        <select value={fertRuleForm.pondType} onChange={e => setFertRuleForm({ ...fertRuleForm, pondType: e.target.value })} className={inputCls}>
                            <option>Earthen Pond</option><option>Concrete Pond</option><option>Lined Pond</option>
                        </select>
                    </div>
                </div>
                {/* Organic */}
                <h3 className="text-sm font-black text-emerald-700 mt-6 mb-3 uppercase tracking-wider">Organic</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Product</label><input type="text" value={fertRuleForm.orgProduct} onChange={e => setFertRuleForm({ ...fertRuleForm, orgProduct: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Dosage (kg/acre)</label><input type="number" value={fertRuleForm.orgDosage} onChange={e => setFertRuleForm({ ...fertRuleForm, orgDosage: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Rate (PKR)</label><input type="number" value={fertRuleForm.orgRate} onChange={e => setFertRuleForm({ ...fertRuleForm, orgRate: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Frequency</label><input type="text" value={fertRuleForm.orgFrequency} onChange={e => setFertRuleForm({ ...fertRuleForm, orgFrequency: e.target.value })} className={inputCls} /></div>
                    <div className="col-span-2"><label className={labelCls}>Benefits</label><input type="text" value={fertRuleForm.orgBenefits} onChange={e => setFertRuleForm({ ...fertRuleForm, orgBenefits: e.target.value })} className={inputCls} /></div>
                </div>
                {/* Inorganic */}
                <h3 className="text-sm font-black text-blue-700 mt-6 mb-3 uppercase tracking-wider">Inorganic</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Product</label><input type="text" value={fertRuleForm.inorgProduct} onChange={e => setFertRuleForm({ ...fertRuleForm, inorgProduct: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Dosage (kg/acre)</label><input type="number" value={fertRuleForm.inorgDosage} onChange={e => setFertRuleForm({ ...fertRuleForm, inorgDosage: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Rate (PKR)</label><input type="number" value={fertRuleForm.inorgRate} onChange={e => setFertRuleForm({ ...fertRuleForm, inorgRate: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Frequency</label><input type="text" value={fertRuleForm.inorgFrequency} onChange={e => setFertRuleForm({ ...fertRuleForm, inorgFrequency: e.target.value })} className={inputCls} /></div>
                    <div className="col-span-2"><label className={labelCls}>Benefits</label><input type="text" value={fertRuleForm.inorgBenefits} onChange={e => setFertRuleForm({ ...fertRuleForm, inorgBenefits: e.target.value })} className={inputCls} /></div>
                </div>
                {/* Lime */}
                <h3 className="text-sm font-black text-amber-700 mt-6 mb-3 uppercase tracking-wider">Lime</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Product</label><input type="text" value={fertRuleForm.limeProduct} onChange={e => setFertRuleForm({ ...fertRuleForm, limeProduct: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Dosage (kg/acre)</label><input type="number" value={fertRuleForm.limeDosage} onChange={e => setFertRuleForm({ ...fertRuleForm, limeDosage: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Rate (PKR)</label><input type="number" value={fertRuleForm.limeRate} onChange={e => setFertRuleForm({ ...fertRuleForm, limeRate: parseFloat(e.target.value) })} className={inputCls} /></div>
                    <div><label className={labelCls}>Frequency</label><input type="text" value={fertRuleForm.limeFrequency} onChange={e => setFertRuleForm({ ...fertRuleForm, limeFrequency: e.target.value })} className={inputCls} /></div>
                    <div className="col-span-2"><label className={labelCls}>Benefits</label><input type="text" value={fertRuleForm.limeBenefits} onChange={e => setFertRuleForm({ ...fertRuleForm, limeBenefits: e.target.value })} className={inputCls} /></div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl">Cancel</button>
                    <button onClick={handleFertRuleSubmit} disabled={ruleAction === 'submitting-fert'} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50">
                        {ruleAction === 'submitting-fert' && <Loader2 size={14} className="animate-spin" />}{editingFertRule ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}
