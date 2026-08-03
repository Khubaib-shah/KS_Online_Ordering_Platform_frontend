import React, { useState, useEffect } from 'react'; import { Button } from '@/components/ui/Button';

import { MessageSquare, ShieldAlert, Clock, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { supportApi } from '@/lib/api/support.api';
import { SupportTicket } from '@/types/support';
import { useUIStore } from '@/store/uiStore';;
import { Input } from '@components/ui/Input';

export function SuperEscalationsView() {
  const { addToast } = useUIStore();;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const data = supportApi.getTickets();
    setTickets(data);
    if (data.length > 0 && !selectedTicketId) {
      setSelectedTicketId(data[0].id);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    try {
      supportApi.addReply(selectedTicketId, replyText, 'super-admin', 'Support Help Desk');
      setReplyText('');
      loadTickets();
      addToast('Reply sent successfully', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = (status: SupportTicket['status']) => {
    if (!selectedTicketId) return;
    try {
      supportApi.updateStatus(selectedTicketId, status);
      loadTickets();
      addToast(`Ticket status updated to ${status}`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="space-y-6 w-full px-4 md:px-6 py-2 text-left">

      {/* Top Welcome Title Card */}
      <div className="border-b border-border-subtle pb-5 select-none flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="text-rose-600 shrink-0" />
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-poppins">
              Help & Support Tickets
            </h1>
          </div>
          <p className="text-xs font-semibold text-text-secondary mt-1">
            Review support tickets sent by restaurant stores, send replies, or update ticket status.
          </p>
        </div>
        <Button variant="custom" size="none" onClick={loadTickets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[650px]">

        {/* Left Side: Tickets List */}
        <div className="md:col-span-5 bg-white border border-border-subtle rounded-3xl p-4 shadow-sm flex flex-col h-full select-none">
          <div className="space-y-3.5 mb-4 shrink-0">
            {/* Search */}
            <Input
              type="text"
              placeholder="Search escalations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Filter pills */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'open', 'pending', 'resolved'] as const).map(f => (
                <Button variant="custom" size="none" key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 text-center py-1 rounded-lg text-[10px] font-extrabold capitalize cursor-pointer transition-all ${statusFilter === f
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Tickets List Scrollable container */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-text-secondary">
                <AlertCircle size={28} className="mx-auto mb-2 text-text-secondary/60" />
                <p className="text-xs font-bold text-slate-600">No tickets found</p>
                <p className="text-[10px] text-text-secondary mt-0.5">Adjust filter criteria or verify active tickets</p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isSelected = ticket.id === selectedTicketId;
                return (
                  <Button variant="custom" size="none" key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full p-3.5 text-left rounded-2xl border transition-all flex flex-col gap-2 relative group cursor-pointer ${isSelected
                      ? 'bg-slate-55 border-slate-900 shadow-sm'
                      : 'bg-white hover:bg-slate-50/60 border-border-subtle'
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold font-poppins text-slate-500 truncate max-w-[70%]">
                        {ticket.tenantName}
                      </span>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${ticket.severity === 'high'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : ticket.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                        {ticket.severity}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 font-poppins line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {ticket.subject}
                      </h4>
                      <p className="text-[11px] text-text-secondary font-medium line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px] text-text-secondary font-medium">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>

                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${ticket.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700'
                        : ticket.status === 'pending'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Thread */}
        <div className="md:col-span-7 bg-white border border-border-subtle rounded-3xl p-5 shadow-sm flex flex-col h-full overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Ticket Meta / Status Actions */}
              <div className="border-b border-border-subtle/70 pb-4 select-none shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-poppins">
                    {selectedTicket.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-text-secondary">
                    <span className="text-slate-800">{selectedTicket.tenantName}</span>
                    <span>•</span>
                    <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 self-start sm:self-center">
                  <Button variant="custom" size="none" onClick={() => handleUpdateStatus('open')}
                    className={`px-2.5 h-7 rounded-lg text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${selectedTicket.status === 'open'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    Open
                  </Button>
                  <Button variant="custom" size="none" onClick={() => handleUpdateStatus('pending')}
                    className={`px-2.5 h-7 rounded-lg text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${selectedTicket.status === 'pending'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    Pending
                  </Button>
                  <Button variant="custom" size="none" onClick={() => handleUpdateStatus('resolved')}
                    className={`px-2.5 h-7 rounded-lg text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${selectedTicket.status === 'resolved'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    Resolved
                  </Button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 no-scrollbar">
                {/* Initial Description Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Original Store Message:
                  </span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Message list */}
                {selectedTicket.replies.map((reply) => {
                  const isAdmin = reply.sender === 'super-admin';
                  return (
                    <div
                      key={reply.id}
                      className={`flex flex-col gap-1 max-w-[85%] ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary">
                        <span className="font-bold text-slate-800">{reply.senderName}</span>
                        <span>•</span>
                        <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${isAdmin
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                        }`}>
                        <p>{reply.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send Reply Box */}
              {selectedTicket.status === 'resolved' ? (
                <div className="pt-3 border-t border-slate-100 text-center text-[11px] font-bold text-text-secondary select-none">
                  🔒 This support ticket is marked as resolved. Re-open to send more messages.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="pt-3 border-t border-border-subtle/70 flex gap-2 shrink-0">
                  <Input
                    type="text"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button variant="custom" size="none" type="submit"
                    disabled={!replyText.trim()}
                    className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary select-none">
              <MessageSquare size={48} className="text-text-secondary/40 mb-3" />
              <p className="text-sm font-bold text-slate-700">No Ticket Selected</p>
              <p className="text-xs text-text-secondary mt-1">Select a support ticket from the list.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
