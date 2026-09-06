"use client";

import { useState, useEffect } from "react";
import { farmApi } from "@/integration/farmApi";
import Sidebar from "@/components/layout/Sidebar";
import NewTicketModal from "@/components/layout/NewTicketModal";
import {
    MessageSquare,
    Send,
    Plus,
    X,
    Clock,
    CheckCircle2,
    MessageCircle,
    Loader2,
    Menu
} from "lucide-react";

export default function SupportPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [form, setForm] = useState({ subject: '', message: '', category: 'General' });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await farmApi.getMyTickets();
            setTickets(res.tickets || []);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async () => {
        if (!form.subject || !form.message) {
            alert("Please fill in both subject and message.");
            return;
        }
        setSubmitting(true);
        try {
            await farmApi.submitTicket(form);
            setForm({ subject: '', message: '', category: 'General' });
            setFormOpen(false);
            await fetchTickets();
        } catch (err) {
            alert(err.message || "Failed to submit ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const statusIcon = (status) => {
        if (status === 'Open') return <Clock size={14} className="text-amber-500" />;
        if (status === 'Responded') return <MessageCircle size={14} className="text-blue-500" />;
        return <CheckCircle2 size={14} className="text-emerald-500" />;
    };

    const statusColor = (status) => {
        if (status === 'Open') return 'bg-amber-50 text-amber-600';
        if (status === 'Responded') return 'bg-blue-50 text-blue-600';
        return 'bg-emerald-50 text-emerald-600';
    };

    return (
        <div className="flex min-h-screen bg-[#FDFDFF]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 px-4 sm:px-8 py-10 lg:py-12 overflow-x-hidden">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Mobile menu */}
                    <button onClick={() => setSidebarOpen(true)}
                        className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                        <Menu size={20} />
                    </button>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-white shrink-0">
                                <MessageSquare size={26} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Support</h1>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
                                    Feedback & Help Requests
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setFormOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                            <Plus size={16} /> New Ticket
                        </button>
                    </div>

                    <NewTicketModal 
                        isOpen={formOpen} 
                        onClose={() => setFormOpen(false)} 
                        form={form} 
                        setForm={setForm} 
                        handleSubmit={handleSubmit} 
                        submitting={submitting} 
                    />

                    {/* Tickets List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
                            <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No tickets yet</h3>
                            <p className="text-sm text-slate-500">Click "New Ticket" to submit feedback or report an issue.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((t) => (
                                <div key={t.TicketId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor(t.Status)}`}>
                                                    {statusIcon(t.Status)}
                                                    {t.Status}
                                                </span>
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium">
                                                    {t.Category}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(t.CreatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg">{t.Subject}</h3>
                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t.Message}</p>
                                        </div>
                                    </div>

                                    {/* Admin Reply */}
                                    {t.AdminReply && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <MessageCircle size={12} className="text-white" />
                                                </div>
                                                <span className="text-xs font-bold text-blue-600">Admin Response</span>
                                                {t.UpdatedAt && (
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(t.UpdatedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-700 bg-blue-50/50 rounded-xl p-4 leading-relaxed">
                                                {t.AdminReply}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
