import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusiness: (business: Business) => void;
  loading: boolean;
  refetchBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType>({
  businesses: [],
  activeBusiness: null,
  setActiveBusiness: () => {},
  loading: true,
  refetchBusinesses: async () => {},
});

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within BusinessProvider');
  }
  return context;
};

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setActiveBusiness(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBusinesses(data || []);
      
      if (data && data.length > 0) {
        // Update activeBusiness with fresh data, or set first if none selected
        const currentId = activeBusiness?.id;
        const updated = currentId ? data.find(b => b.id === currentId) : null;
        setActiveBusiness(updated || data[0]);
      } else {
        setActiveBusiness(null);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const refetchBusinesses = async () => {
    await fetchBusinesses();
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user?.id]);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        setActiveBusiness,
        loading,
        refetchBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}
