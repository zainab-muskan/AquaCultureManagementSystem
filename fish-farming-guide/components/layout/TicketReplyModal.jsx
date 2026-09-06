"use client";
import { Loader2 } from "lucide-react";

export default function TicketReplyModal({ 
    replyingTicket, 
    setReplyingTicket, 
    ticketReply, 
    setTicketReply, 
    handleTicketReply, 
    ticketAction 
}) {
    if (!replyingTicket) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
                <h2 className="text-xl font-black text-slate-900 mb-2">Reply to Ticket</h2>
                <p className="text-sm text-slate-500 mb-1 font-bold">{replyingTicket.Subject}</p>
                <p className="text-xs text-slate-400 mb-4">From: {replyingTicket.UserName} ({replyingTicket.UserEmail})</p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                    {replyingTicket.Message}
                </div>
                <textarea value={ticketReply}
                    onChange={(e) => setTicketReply(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your response to the user..." />
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => { setReplyingTicket(null); setTicketReply(''); }}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => handleTicketReply(replyingTicket.TicketId)}
                        disabled={ticketAction === `reply-${replyingTicket.TicketId}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                        {ticketAction === `reply-${replyingTicket.TicketId}` && <Loader2 size={14} className="animate-spin" />}
                        Send Reply
                    </button>
                </div>
            </div>
        </div>
    );
}
