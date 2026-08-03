import React, { useState, useMemo, useEffect } from 'react';
import { Search, HelpCircle, Keyboard, BookOpen, ShoppingBag, UtensilsCrossed, Award, MessageSquare, ChevronDown, ChevronUp, Sparkles, Send, Headphones, Plus, X, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';;
import { supportApi } from '@/lib/api/support.api';
import { SupportTicket } from '@/types/support';
import { Input } from '@/components/ui/Input';
import { InputField } from '@/components/ui/forms/InputField';
import { Button } from '@/components/ui/Button';
import { PLATFORM_NAME } from '@/config/platform';

interface FAQ {
  q: string;
  a: string;
  category: 'Orders' | 'Menu' | 'Marketing' | 'Settings';
}

interface FeatureGuide {
  title: string;
  description: string;
  steps: string[];
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

export function HelpView() {
  const { currentUser } = useAuthStore();
  const { activeTenant, activeTenantId } = useTenantStore();
  const { addToast } = useUIStore();;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Ticket modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketSeverity, setTicketSeverity] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tickets list
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadMyTickets = () => {
    try {
      const all = supportApi.getTickets();
      const tenantTickets = all.filter(t => t.tenantId === (activeTenantId || `${PLATFORM_NAME.toLowerCase()}-main`));
      setMyTickets(tenantTickets);
      if (tenantTickets.length > 0 && !selectedTicketId) {
        setSelectedTicketId(tenantTickets[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, [activeTenantId]);

  // Auto-scroll to shortcuts or contact form if hash is present
  useEffect(() => {
    if (window.location.hash === '#shortcuts-guide') {
      const element = document.getElementById('shortcuts-guide');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('ring-2', 'ring-accent-primary', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-accent-primary', 'ring-offset-2');
        }, 2000);
      }
    } else if (window.location.hash === '#contact-form') {
      setShowTicketModal(true);
    }
  }, []);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      addToast('Please fill in both the subject and detailed message.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTicket = supportApi.createTicket({
        tenantId: activeTenantId || 'indolj-main',
        tenantName: activeTenant?.name || 'Indolj Fine Dining',
        subject: ticketSubject.trim(),
        description: ticketDescription.trim(),
        severity: ticketSeverity,
        status: 'open'
      });

      // Add initial reply
      supportApi.addReply(
        newTicket.id,
        ticketDescription.trim(),
        'tenant',
        currentUser?.name || 'Store Manager'
      );

      addToast('Support ticket created successfully! Our team will respond shortly.', 'success');
      setTicketSubject('');
      setTicketDescription('');
      setTicketSeverity('medium');
      setShowTicketModal(false);
      loadMyTickets();
      setSelectedTicketId(newTicket.id);
    } catch (err: any) {
      addToast(err.message || 'Failed to create ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    try {
      supportApi.addReply(
        selectedTicketId,
        replyText.trim(),
        'tenant',
        currentUser?.name || 'Store Manager'
      );
      setReplyText('');
      loadMyTickets();
      addToast('Reply sent to support desk', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const featureGuides: FeatureGuide[] = [
    {
      title: 'Order Status Workflow',
      description: 'Streamline fulfillment by shifting incoming orders through distinct production checkpoints.',
      icon: ShoppingBag,
      color: 'bg-accent-tint-bg text-accent-dark border-accent-light/20',
      steps: [
        'Incoming delivery or pickup requests appear first in the "Pending" column.',
        'Accept the order to transition it to "Preparing" for the kitchen crew.',
        'Mark as "Ready for Pickup" or "Out for Delivery" to notify drivers/customers.',
        'Once finalized, mark as "Completed" to securely log revenue into Analytics.'
      ]
    },
    {
      title: 'Menu Catalog Setup',
      description: 'Organize your dishes, pricing tiers, option customization groups, and dynamic categories.',
      icon: UtensilsCrossed,
      color: 'bg-amber-50 text-amber-800 border-amber-100',
      steps: [
        'Create structural Categories (e.g. Starters, Main Course) to group related menu items.',
        'Click "Add Dish / Item" to configure item title, description, and base pricing.',
        'Toggle "Stock Status" instantly (In Stock / Out of Stock) to prevent over-ordering.',
        'Create Option Groups (e.g. Extra Toppings) to offer add-ons and choice variations.'
      ]
    },
    {
      title: 'Promotions & Discounts',
      description: 'Boost guest order volume and attract diners using targeted discount vouchers and sliders.',
      icon: Award,
      color: 'bg-blue-50 text-blue-800 border-blue-100',
      steps: [
        'Create unique promo codes (e.g. INDOLJ50) to offer custom value deductions.',
        'Choose discount types: Flat Percentage deduction, Fixed Amount, or Free Delivery.',
        'Draft an announcement text to display on the main website ticker / banner.',
        'Upload visual promotion slides to advertise seasonal specials directly to customers.'
      ]
    }
  ];

  const faqs: FAQ[] = [
    {
      category: 'Orders',
      q: 'How do I cancel or reject an incorrect order?',
      a: 'Go to the Orders feed, select the target order card, and click the secondary options or cancellation button on the detail side drawer. You can specify a rejection reason which will be communicated back to the user.'
    },
    {
      category: 'Orders',
      q: 'How do I print physical kitchen tickets or customer receipts?',
      a: 'Open any active or completed order in the detailed order drawer view. Click the prominent "Print Receipt" button at the top right to generate a clean, thermal-printer-optimized PDF receipt ready for your POS hardware.'
    },
    {
      category: 'Menu',
      q: 'Can I temporarily disable a menu item without deleting it?',
      a: 'Yes, absolutely. Go to the Menu page, find the item, and click the green "IN STOCK" pill. This instantly toggles the item status to "OUT OF STOCK", disabling it on customer apps. Click it again to enable it instantly when ingredients are replenished.'
    },
    {
      category: 'Menu',
      q: 'How do I change the display order of categories on the customer app?',
      a: 'Navigate to the Menu -> Categories tab. Click and hold the grip icon on the far left of any category card, then drag and drop it vertically into your preferred order. This layout hierarchy is pushed instantly to the user interface.'
    },
    {
      category: 'Marketing',
      q: 'How do I apply a minimum order requirement on promo codes?',
      a: 'When creating or editing a promotion via the promo modal, input a numerical value in the "Minimum Order Amount" field. The system will automatically reject the voucher code if the customer\'s basket total is below this threshold.'
    },
    {
      category: 'Settings',
      q: 'Where can I adjust tax rates and delivery boundary fees?',
      a: 'Navigate to the General Settings page. Use the "Tax & Invoicing" section to update your standard GST/sales tax percentage, and the "Delivery Setup" section to update base delivery charges and minimum order thresholds.'
    }
  ];

  // Search and filter logic
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || faq.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const categories = ['all', 'Orders', 'Menu', 'Marketing', 'Settings'];

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto select-none animate-fade-in no-scrollbar">

      {/* Header Banner with theme styling and full width */}
      <div className="w-full bg-accent-primary rounded-3xl p-6 sm:p-8 md:p-10 text-white relative overflow-hidden mb-8 shadow-sm text-left shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/95 text-xs font-semibold uppercase tracking-wider mb-3">
              <HelpCircle size={13} className="text-white/80" />
              <span>{PLATFORM_NAME} Knowledge Base & Support</span>
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins tracking-tight">How can we help today?</h1>
            <p className="text-white/85 mt-2 text-xs sm:text-sm md:text-base font-medium max-w-xl">
              Explore step-by-step guides, search our interactive FAQs, or reach out directly to operations support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <Input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="px-5 py-3 bg-white text-accent-primary font-bold text-xs rounded-2xl hover:bg-slate-50 transition-all shadow-button flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Headphones size={16} />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body (Full 100% width with standard spacing) */}
      <div className="w-full space-y-8 pb-12">

        {/* Support Tickets Section */}
        {myTickets.length > 0 && (
          <section className="bg-white border border-border-subtle rounded-3xl p-5 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border-subtle/60 pb-3">
              <div className="flex items-center gap-2">
                <Headphones size={18} className="text-accent-primary" />
                <h2 className="text-base font-bold text-text-primary font-poppins">
                  Your Support Tickets ({myTickets.length})
                </h2>
              </div>
              <button
                onClick={() => setShowTicketModal(true)}
                className="px-3 py-1.5 bg-accent-primary text-white text-xs font-bold rounded-xl hover:bg-accent-dark transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>New Ticket</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* List */}
              <div className="md:col-span-5 space-y-2 border-r border-border-subtle/50 pr-0 md:pr-4">
                {myTickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${selectedTicketId === t.id
                      ? 'bg-accent-tint-bg border-accent-primary shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/60 border-border-subtle/50'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-text-secondary border border-border-subtle">
                        {t.severity}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-text-primary line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">{t.description}</p>
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="md:col-span-7 flex flex-col min-h-[220px]">
                {selectedTicketId ? (() => {
                  const ticket = myTickets.find(t => t.id === selectedTicketId);
                  if (!ticket) return null;
                  return (
                    <div className="flex flex-col h-full justify-between gap-3">
                      <div>
                        <div className="border-b border-border-subtle pb-2 mb-3">
                          <h4 className="text-xs font-bold text-text-primary">{ticket.subject}</h4>
                          <span className="text-[10px] text-text-secondary">Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-text-primary">
                            <span className="text-[9px] font-bold text-text-secondary block mb-0.5">Original Request:</span>
                            {ticket.description}
                          </div>

                          {ticket.replies.map(r => (
                            <div key={r.id} className={`p-2.5 rounded-xl text-xs ${r.sender === 'tenant' ? 'bg-accent-tint-bg text-accent-dark ml-4' : 'bg-indigo-50 text-indigo-950 mr-4 border border-indigo-100'
                              }`}>
                              <div className="flex justify-between text-[9px] font-bold opacity-75 mb-0.5">
                                <span>{r.senderName}</span>
                                <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p>{r.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {ticket.status !== 'resolved' && (
                        <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-border-subtle">
                          <Input
                            type="text"
                            placeholder="Reply to support desk..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <Button
                            type="submit"
                            disabled={!replyText.trim()}
                            icon={<Send size={14} />}
                            className="px-3 py-2 bg-accent-primary text-white rounded-xl text-xs font-bold h-auto min-h-0"
                          />
                        </form>
                      )}
                    </div>
                  );
                })() : (
                  <div className="flex items-center justify-center h-full text-xs text-text-secondary">
                    Select a ticket to view replies
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Core Features / Guides Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 font-poppins text-left">
            <BookOpen size={18} className="text-accent-dark" />
            <span>Interactive Platform Tutorials</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureGuides.map((guide, idx) => {
              const Icon = guide.icon;
              return (
                <div key={idx} className="bg-white border border-border-subtle rounded-3xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between text-left">
                  <div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border mb-4 ${guide.color}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary font-poppins">{guide.title}</h3>
                    <p className="text-xs text-text-secondary mt-1.5 font-medium leading-relaxed">
                      {guide.description}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle/40 pt-4 mt-5 space-y-2.5">
                    {guide.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-2 text-[11px] leading-relaxed text-text-secondary font-medium">
                        <span className="text-accent-dark font-bold shrink-0">{sIdx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 font-poppins text-left">
              <MessageSquare size={18} className="text-accent-primary" />
              <span>Common Questions & FAQs</span>
            </h2>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-border-subtle/30 self-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setExpandedFaq(null);
                  }}
                  className={`
                    px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer
                    ${selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border-subtle rounded-3xl overflow-hidden divide-y divide-border-subtle/40">
            {filteredFaqs.length === 0 ? (
              <div className="p-10 text-center text-text-secondary">
                <HelpCircle size={32} className="mx-auto mb-2 text-text-secondary/60" />
                <p className="text-sm font-bold">No FAQ articles found</p>
                <p className="text-xs mt-1">Try broadening your search query or selecting a different tab</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div key={idx} className="transition-all">
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      className="w-full px-3 sm:px-6 py-4 flex items-start sm:items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-text-secondary border border-border-subtle/30 font-poppins self-start sm:self-auto whitespace-nowrap">
                          {faq.category}
                        </span>
                        <span className="text-xs font-bold text-text-primary font-poppins leading-snug">{faq.q}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-text-secondary shrink-0 ml-2 mt-0.5 sm:mt-0" />
                      ) : (
                        <ChevronDown size={16} className="text-text-secondary shrink-0 ml-2 mt-0.5 sm:mt-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 sm:px-6 pb-5 pt-2 text-xs text-text-secondary font-medium leading-relaxed bg-slate-50/20 border-t border-slate-50 animate-fade-in text-left">
                        <p className="max-w-3xl pl-0 sm:pl-[76px]">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Global Keyboard Shortcuts Section */}
        <section
          id="shortcuts-guide"
          className="bg-accent-primary text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm border border-accent-dark/20 text-left transition-all"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <Keyboard size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold font-poppins">Global Power-User Shortcuts</h3>
                <p className="text-white/80 text-[11px] font-medium">Turbocharge your daily operations workflow with key combinations.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/15 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20 self-start md:self-auto">
              <Sparkles size={11} />
              <span>Shell Enabled</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-poppins text-left opacity-90">Navigation Hotkeys</h4>
              <div className="space-y-3">
                {[
                  { key: 'Ctrl + 1', desc: 'Jump to Dashboard Overview' },
                  { key: 'Ctrl + 2', desc: 'Open incoming Orders Feed' },
                  { key: 'Ctrl + 3', desc: 'Switch to Menu Catalog & Catalog Editor' },
                  { key: 'Ctrl + 4', desc: 'Open Analytics & Sales Reports' },
                  { key: 'Ctrl + 5', desc: 'Navigate to Registered Customers' },
                  { key: 'Ctrl + 6', desc: 'Open System Configuration & Settings' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2 border-b border-white/10 last:border-0 text-left">
                    <span className="text-xs text-white/90 font-medium leading-tight">{item.desc}</span>
                    <kbd className="font-mono bg-white/20 border border-white/25 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide text-white whitespace-nowrap shrink-0 self-start sm:self-auto">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:border-l md:border-white/15 md:pl-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-poppins text-left opacity-90">Action Commands & Palette</h4>
              <div className="space-y-3">
                {[
                  { key: 'Ctrl + K', desc: 'Launch Command Search / Action Palette' },
                  { key: 'Arrow Up/Down', desc: 'Navigate through commands list' },
                  { key: 'Enter ↵', desc: 'Confirm & execute selected action' },
                  { key: 'Escape', desc: 'Close dialog modal or clear input search' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2 border-b border-white/10 last:border-0 text-left">
                    <span className="text-xs text-white/90 font-medium leading-tight">{item.desc}</span>
                    <kbd className="font-mono bg-white/20 border border-white/25 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide text-white whitespace-nowrap shrink-0 self-start sm:self-auto">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>

              {/* Pro Tip Callout */}
              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 mt-6 text-left">
                <span className="text-[10px] font-bold uppercase text-white block mb-1">💡 Operations Pro-Tip:</span>
                <p className="text-[11px] leading-relaxed text-white/85 font-medium">
                  Press <kbd className="font-mono bg-white/20 border border-white/20 px-1 py-0.2 rounded text-[9px] text-white">Ctrl + K</kbd> and type &quot;Add Product&quot;. It will automatically switch views to Menu, open the Add Item form, and set focus, allowing you to build items instantly without cursor clicks!
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* New Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border-subtle text-left space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent-tint-bg text-accent-primary flex items-center justify-center border border-accent-light/30">
                  <Headphones size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary font-poppins">Contact Support Desk</h3>
                  <p className="text-[11px] text-text-secondary">Send an operational query or bug report to support admins.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTicketModal(false)}
                icon={<X size={16} />}
                className="w-8 h-8 rounded-full border border-border-subtle hover:bg-slate-100 flex items-center justify-center text-text-secondary min-h-0 px-0"
              />
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <InputField
                label="Subject / Topic"
                type="text"
                required
                placeholder="e.g., Payment Gateway setup assistance needed"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Urgency Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((sev) => (
                    <Button
                      key={sev}
                      type="button"
                      variant="ghost"
                      onClick={() => setTicketSeverity(sev)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border min-h-0 h-auto ${ticketSeverity === sev
                        ? 'bg-accent-primary text-white border-accent-primary shadow-xs'
                        : 'bg-slate-50 text-text-secondary border-border-subtle hover:bg-slate-100'
                        }`}
                    >
                      {sev}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue or question in detail..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-border-subtle rounded-xl text-xs font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 h-10 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={!isSubmitting && <Send size={14} />}
                  className="px-5 h-10 text-xs font-bold text-white bg-accent-primary hover:bg-accent-dark rounded-xl shadow-button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
