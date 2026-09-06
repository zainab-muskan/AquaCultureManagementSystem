"use client";
import { Loader2 } from "lucide-react";

export default function DiseaseModal({ 
    isOpen, 
    onClose, 
    editingDisease, 
    diseaseForm, 
    setDiseaseForm, 
    handleDiseaseSubmit, 
    diseaseAction,
    emptyDiseaseForm
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                    {editingDisease ? 'Edit Disease' : 'Add New Disease'}
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Disease Name *</label>
                            <input type="text" value={diseaseForm.name}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., EUS (Epizootic Ulcerative Syndrome)" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category *</label>
                            <select value={diseaseForm.category}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Bacterial">Bacterial</option>
                                <option value="Fungal">Fungal</option>
                                <option value="Parasitic">Parasitic</option>
                                <option value="Viral">Viral</option>
                                <option value="Nutritional">Nutritional</option>
                                <option value="Environmental">Environmental</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Severity</label>
                            <select value={diseaseForm.severity}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, severity: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Mild">Mild</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Severe">Severe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Affected Species</label>
                            <input type="text" value={diseaseForm.species}
                                onChange={(e) => setDiseaseForm({ ...diseaseForm, species: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Rohu, Catla, Tilapia" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Symptoms</label>
                        <textarea value={diseaseForm.symptoms}
                            onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe visible symptoms..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recommended Treatment</label>
                        <textarea value={diseaseForm.treatment}
                            onChange={(e) => setDiseaseForm({ ...diseaseForm, treatment: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe recommended treatment..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prevention Tips</label>
                        <textarea value={diseaseForm.prevention}
                            onChange={(e) => setDiseaseForm({ ...diseaseForm, prevention: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="How to prevent this disease..." />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => { onClose(); setDiseaseForm(emptyDiseaseForm); }}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleDiseaseSubmit}
                        disabled={diseaseAction === 'saving'}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                        {diseaseAction === 'saving' && <Loader2 size={14} className="animate-spin" />}
                        {editingDisease ? 'Save Changes' : 'Add Disease'}
                    </button>
                </div>
            </div>
        </div>
    );
}
