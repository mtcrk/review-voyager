import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GoogleBusiness {
  account_id: string;
  location_id: string;
  name: string;
  place_id?: string;
}

export default function GoogleBusinessCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchBusinesses } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<GoogleBusiness[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Hata',
        description: 'Google Business bağlantısı iptal edildi',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    if (!code) {
      navigate('/dashboard');
      return;
    }

    exchangeCode(code);
  }, [searchParams]);

  const exchangeCode = async (code: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('google-business-auth', {
        body: { action: 'exchange', code },
      });

      if (response.error) throw response.error;

      setBusinesses(response.data.businesses || []);
      setRefreshToken(response.data.refresh_token);
      
      // Auto-select all businesses
      const allIds = new Set<string>(response.data.businesses.map((b: GoogleBusiness) => b.location_id));
      setSelectedBusinesses(allIds);
    } catch (error: any) {
      console.error('Exchange error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'İşletmeler getirilemedi',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (locationId: string) => {
    setSelectedBusinesses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (selectedBusinesses.size === 0) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen en az bir işletme seçin',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const selectedBizList = businesses.filter(b => selectedBusinesses.has(b.location_id));

      const { error } = await supabase.functions.invoke('google-business-auth', {
        body: {
          action: 'save',
          businesses: selectedBizList,
          refresh_token: refreshToken,
        },
      });

      if (error) throw error;

      // Auto-fetch business info (coordinates, address, etc.) for each saved business
      try {
        const { data: userBusinesses } = await supabase
          .from("businesses")
          .select("id, google_connected, google_location_id")
          .eq("google_connected", true);

        if (userBusinesses) {
          await Promise.allSettled(
            userBusinesses
              .filter(b => b.google_location_id)
              .map(b =>
                supabase.functions.invoke("google-business-info", {
                  body: { business_id: b.id },
                })
              )
          );
        }
      } catch (infoError) {
        console.warn("Auto-fetch business info failed:", infoError);
      }

      await refetchBusinesses();

      toast({
        title: 'Başarılı',
        description: `${selectedBusinesses.size} işletme eklendi`,
      });

      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'İşletmeler kaydedilemedi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>İşletmelerinizi Seçin</CardTitle>
          <CardDescription>
            Google Business Profile hesabınızdan {businesses.length} işletme bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {businesses.map((business) => (
              <div
                key={business.location_id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  id={business.location_id}
                  checked={selectedBusinesses.has(business.location_id)}
                  onCheckedChange={() => handleToggle(business.location_id)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={business.location_id}
                    className="text-base font-medium cursor-pointer"
                  >
                    {business.name}
                  </Label>
                  {business.place_id && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Place ID: {business.place_id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={saving}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || selectedBusinesses.size === 0}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                `${selectedBusinesses.size} İşletme Ekle`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
