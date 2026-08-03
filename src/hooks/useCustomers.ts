import { useState, useEffect, useCallback } from 'react';
import { CustomerProfile } from '../types/customer';
import { customersApi } from '../lib/api/customers.api';

export function useCustomers(selectedCustomerId?: string) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [customer, setCustomer] = useState<CustomerProfile | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await customersApi.getCustomers();
      setCustomers(data);
      if (selectedCustomerId) {
        const profile = data.find(c => c.id === selectedCustomerId);
        setCustomer(profile);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addNote = async (text: string, author: string = 'Owner') => {
    if (!selectedCustomerId) return;
    try {
      const updatedProfile = await customersApi.addCustomerNote(selectedCustomerId, author, text);
      setCustomer(updatedProfile);
      setCustomers(prev => prev.map(c => c.id === selectedCustomerId ? updatedProfile : c));
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
    refetch: fetchCustomers,
    addNote
  };
}
