"use client";
import { Loader2, X, Send } from "lucide-react";

export default function NewTicketModal({ 
    isOpen, 
    onClose, 
    form, 
    setForm, 
    handleSubmit, 
    submitting 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Submit a Ticket</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                        <select value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="General">General</option>
                            <option value="Bug">Bug Report</option>
                            <option value="Feature">Feature Request</option>
                            <option value="Account">Account Issue</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject *</label>
                        <input type="text" value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief summary of your issue..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message *</label>
                        <textarea value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your issue or feedback in detail..." />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Submit Ticket
                    </button>
                </div>
            </div>
        </div>
    );
}
