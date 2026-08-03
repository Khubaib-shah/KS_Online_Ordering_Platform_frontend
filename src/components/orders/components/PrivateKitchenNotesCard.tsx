import { Select } from '../../ui/Select';import { Button } from '@/components/ui/Button';

import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { MessageSquare, Send } from 'lucide-react';
import { Order } from '../../../types/order';

interface PrivateKitchenNotesCardProps {
  order: Order;
  addNote: (author: string, text: string) => Promise<any>;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function PrivateKitchenNotesCard({ order, addNote, addToast }: PrivateKitchenNotesCardProps) {
  const [noteText, setNoteText] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || isPostingNote) return;

    setIsPostingNote(true);
    try {
      await addNote('Owner', noteText.trim());
      addToast('Internal note posted!', 'success');
      setNoteText('');
    } catch (err) {
      addToast('Failed to post note', 'error');
    } finally {
      setIsPostingNote(false);
    }
  };

  return (
    <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-5 text-left">
      <h3 className="font-poppins font-bold text-sm text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle/10 pb-3">
        <MessageSquare size={16} className="text-text-secondary" />
        Private Kitchen Notes
      </h3>

      {/* Note form input */}
      <form onSubmit={handlePostNote} className="mb-4">
        <div className="relative">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Post internal instruction (e.g. 'extra chili', 'on hold'...)"
            rows={2}
            className="w-full text-xs font-medium text-text-primary placeholder:text-text-secondary bg-[#FAFAFA] border border-border-subtle/45 rounded-xl p-2.5 pr-10 focus:outline-none focus:border-accent-primary focus:bg-white transition-all resize-none shadow-inner"
          />
          <Button variant="custom" size="none"             type="submit"
            disabled={!noteText.trim() || isPostingNote}
            className="absolute right-2.5 bottom-3 text-accent-primary hover:text-accent-dark disabled:text-text-secondary/20 transition-all cursor-pointer"
          >
            <Send size={14} />
          </Button>
        </div>
      </form>

      {/* Private Notes stream list */}
      <div className="flex flex-col gap-3 max-h-56 overflow-y-auto scrollbar-none">
        {order.notes.map((note) => (
          <div key={note.id} className="bg-slate-50 border border-border-subtle/15 rounded-xl p-3 text-xs select-none">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-text-primary">{note.author}</span>
              <span className="text-[10px] text-text-secondary/50">
                {new Date(note.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-text-secondary/85 leading-relaxed font-medium font-inter">{note.text}</p>
          </div>
        ))}
        {order.notes.length === 0 && (
          <span className="block text-center text-xs text-text-secondary/40 py-4 italic font-medium">
            No private kitchen notes on this order.
          </span>
        )}
      </div>
    </div>
  );
}
