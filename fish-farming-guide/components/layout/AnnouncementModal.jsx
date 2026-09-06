"use client";
import { Loader2 } from "lucide-react";

export default function AnnouncementModal({ 
    isOpen, 
    onClose, 
    announcementForm, 
    setAnnouncementForm, 
    handleAnnouncementSubmit, 
    announcementAction 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                <h2 className="text-xl font-black text-slate-900 mb-6">New Announcement</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                        <select value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Info">Information</option>
                            <option value="Warning">Warning</option>
                            <option value="Alert">Alert (High Priority)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                        <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. System Maintenance Tomorrow" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                        <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the full announcement details..." />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleAnnouncementSubmit} disabled={announcementAction === 'submitting'}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                        {announcementAction === 'submitting' && <Loader2 size={14} className="animate-spin" />}
                        Post Announcement
                    </button>
                </div>
            </div>
        </div>
    );
}
