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
  const [showManualForm, setShowManualForm] = useState(false);

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

  const handleGoogleConnect = () => {
    toast({
      title: 'Yakında geliyor 🚀',
      description: 'Google Business hesabını doğrudan bağlama özelliği şu an Google\'ın ek izin sürecine takıldığı için devre dışı. Şimdilik işletmeni manuel ekleyerek yorumlarını yönetebilirsin.',
      duration: 7000,
    });
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
        
        {!showManualForm ? (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleGoogleConnect}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Business ile Bağlan
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">veya</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowManualForm(true)}
            >
              Manuel Olarak Ekle
            </Button>
          </div>
        ) : (
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setShowManualForm(false)}
                disabled={loading}
              >
                Geri
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'İşletme Oluştur'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
