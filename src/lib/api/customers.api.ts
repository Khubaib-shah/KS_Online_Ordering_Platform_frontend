import { CustomerProfile } from '../../types/customer';
import { apiClient } from '../api-client';

const mapBackendCustomerToFrontend = (backendCustomer: any): CustomerProfile => {
  return {
    id: backendCustomer.id,
    name: backendCustomer.name,
    avatarUrl: backendCustomer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendCustomer.name)}&background=random`,
    phone: backendCustomer.phone || '',
    email: backendCustomer.email || '',
    joinedDate: backendCustomer.createdAt,
    isReturning: backendCustomer.totalOrders > 1,
    totalSpent: Number(backendCustomer.totalSpent) || 0,
    totalOrders: backendCustomer.totalOrders || 0,
    avgOrderValue: backendCustomer.totalOrders > 0 
      ? (Number(backendCustomer.totalSpent) / backendCustomer.totalOrders) 
      : 0,
    lastOrderDate: backendCustomer.updatedAt, // fallback
    addresses: [], // Not returned by backend yet
    notes: [] // Backend does not support customer notes yet
  };
};

export const customersApi = {
  getCustomers: async (): Promise<CustomerProfile[]> => {
    // Backend uses pagination, fetch large limit for UI
    const res = await apiClient.get('/customers?limit=1000');
    return Array.isArray(res) ? res.map(mapBackendCustomerToFrontend) : [];
  },

  getCustomer: async (id: string): Promise<CustomerProfile | undefined> => {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      return mapBackendCustomerToFrontend(res);
    } catch (e) {
      console.error("Failed to fetch customer", e);
      return undefined;
    }
  },

  addCustomerNote: async (customerId: string, author: string, text: string): Promise<CustomerProfile> => {
    // Backend doesn't support customer notes yet.
    // For now, we simulate a mock action or throw an error indicating it's unsupported.
    console.warn("Backend does not support customer notes yet. Stubbing local return.");
    const customer = await customersApi.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');
    
    // We fake the update in memory since we can't persist it
    customer.notes.unshift({
      id: `note-${Date.now()}`,
      author,
      timestamp: new Date().toISOString(),
      text
    });
    return customer;
  }
};
