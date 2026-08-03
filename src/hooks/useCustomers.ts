import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomerProfile } from '../types/customer';
import { customersApi } from '../lib/api/customers.api';

export function useCustomers(selectedCustomerId?: string) {
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getCustomers,
  });

  const customer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : undefined;

  const addNote = async (text: string, author: string = 'Owner') => {
    if (!selectedCustomerId) return;
    try {
      const updatedProfile = await customersApi.addCustomerNote(selectedCustomerId, author, text);
      queryClient.setQueryData(['customers'], (old: CustomerProfile[] | undefined) => 
        old ? old.map(c => c.id === selectedCustomerId ? updatedProfile : c) : []
      );
      return updatedProfile;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    customers,
    customer,
    isLoading,
    error,
    refetch,
    addNote
  };
}
