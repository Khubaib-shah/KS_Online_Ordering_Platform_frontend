export interface SupportTicketReply {
  id: string;
  sender: 'super-admin' | 'tenant';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
  replies: SupportTicketReply[];
}
