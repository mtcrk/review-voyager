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

      // Additive: grup yöneticisi ise gruba bağlı diğer tesisler de listeye eklenir.
      let merged: Business[] = data || [];
      try {
        const { data: groupRows } = await supabase
          .from('business_group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('role', 'group_admin');
        const groupIds = (groupRows || []).map((g: any) => g.group_id);
        if (groupIds.length > 0) {
          const { data: groupBiz } = await supabase
            .from('businesses')
            .select('*')
            .in('group_id', groupIds);
          const seen = new Set(merged.map((b) => b.id));
          (groupBiz || []).forEach((b: any) => {
            if (!seen.has(b.id)) {
              seen.add(b.id);
              merged.push(b as Business);
            }
          });
        }
      } catch (e) {
        console.error('group businesses fetch failed', e);
      }

      setBusinesses(merged);

      if (merged.length > 0) {
        // Update activeBusiness with fresh data, or restore stored / first selection
        const storedId = typeof window !== 'undefined' ? sessionStorage.getItem('vr_active_business_id') : null;
        const currentId = activeBusiness?.id ?? storedId;
        const updated = currentId ? merged.find((b) => b.id === currentId) : null;
        setActiveBusinessState(updated || merged[0]);
      } else {
        setActiveBusinessState(null);
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
