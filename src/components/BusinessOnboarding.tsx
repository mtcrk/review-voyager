import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BusinessOnboardingProps {
  open: boolean;
  onBusinessCreated: () => void;
}

export function BusinessOnboarding({ open, onBusinessCreated }: BusinessOnboardingProps) {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessName,
          place_id: placeId,
        });

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'İşletmeniz eklendi!',
      });

      onBusinessCreated();
      setBusinessName('');
      setPlaceId('');
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'İşletme oluşturulamadı',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>VoyageRespond'a Hoş Geldiniz</DialogTitle>
          <DialogDescription>
            İşletme bilgilerinizi ekleyerek başlayalım
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">İşletme Adı</Label>
            <Input
              id="businessName"
              placeholder="İşletme Adım"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeId">Google Place ID</Label>
            <Input
              id="placeId"
              placeholder="ChIJ..."
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Opsiyonel: Google İşletme Profili'nden Google Place ID'nizi bulabilirsiniz
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Oluşturuluyor...' : 'İşletme Oluştur'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
