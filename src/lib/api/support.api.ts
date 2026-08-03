import { SupportTicket } from '@/types/support';
import { PLATFORM_PREFIX } from '@/lib/constants';

const KEY = `${PLATFORM_PREFIX}_support_tickets`;

// Gap Note: The backend currently lacks a dedicated Support Ticket module.
// Super Admin ticketing features remain local/mocked until the backend is updated.

const defaultTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    tenantId: 'indolj-main',
    tenantName: 'Indolj Fine Dining',
    subject: 'Requesting custom payment gateway integration',
    description: 'We would like to connect a custom local credit card processor to our checkout flow. Please advise if this is possible on the current plan.',
    severity: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    replies: [
      {
        id: 'reply-1',
        sender: 'tenant',
        senderName: 'Manager Indolj',
        message: 'Hello, our customers are asking for online payments. Let us know how we can set it up.',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'ticket-2',
    tenantId: 'tenant-pizza',
    tenantName: 'Mamma Mia Pizzeria',
    subject: 'Urgent: Image upload failing on Menu catalog',
    description: 'When we try to upload a JPG image for our new Pepperoni Special, the crop tool freezes. Is there a size limit we should be aware of?',
    severity: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    replies: [
      {
        id: 'reply-2',
        sender: 'tenant',
        senderName: 'Chef Mamma Mia',
        message: 'This is blocking our menu update for tonight\'s special event.',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 'reply-3',
        sender: 'super-admin',
        senderName: 'SaaS Platform Admin',
        message: 'Hello! Yes, there is a 2MB file limit on crop canvas. We are looking into increasing this threshold.',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ]
  }
];

export const supportApi = {
  getTickets: (): SupportTicket[] => {
    const data = localStorage.getItem(KEY);
    if (!data) {
      localStorage.setItem(KEY, JSON.stringify(defaultTickets));
      return defaultTickets;
    }
    try {
      return JSON.parse(data) as SupportTicket[];
    } catch {
      return defaultTickets;
    }
  },

  saveTickets: (tickets: SupportTicket[]) => {
    localStorage.setItem(KEY, JSON.stringify(tickets));
  },

  createTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'replies'>): SupportTicket => {
    const tickets = supportApi.getTickets();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: new Date().toISOString(),
      replies: []
    };
    tickets.push(newTicket);
    supportApi.saveTickets(tickets);
    return newTicket;
  },

  addReply: (ticketId: string, message: string, sender: 'super-admin' | 'tenant', senderName: string): SupportTicket => {
    const tickets = supportApi.getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) throw new Error('Ticket not found');

    const newReply = {
      id: `reply-${Date.now()}`,
      sender,
      senderName,
      message,
      createdAt: new Date().toISOString()
    };

    tickets[idx].replies.push(newReply);
    // If replied by admin, make it pending tenant, if replied by tenant make it open or pending admin
    if (sender === 'super-admin') {
      tickets[idx].status = 'pending';
    } else {
      tickets[idx].status = 'open';
    }

    supportApi.saveTickets(tickets);
    return tickets[idx];
  },

  updateStatus: (ticketId: string, status: SupportTicket['status']): SupportTicket => {
    const tickets = supportApi.getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) throw new Error('Ticket not found');

    tickets[idx].status = status;
    supportApi.saveTickets(tickets);
    return tickets[idx];
  }
};
