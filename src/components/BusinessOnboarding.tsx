import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Building2, MapPin, Globe, CheckCircle2, Loader2, Search, ExternalLink } from 'lucide-react';
import { getCompanyNameFromEmail } from '@/lib/emailValidation';
import { invokeAuthedFunction } from '@/lib/invokeAuthedFunction';

interface BusinessOnboardingProps {
  open: boolean;
  onBusinessCreated: () => void;
  onDismiss?: () => void;
}

interface PlaceDetails {
  name: string;
  address: string;
  placeId: string;
  rating?: number;
  totalReviews?: number;
  phone?: string;
  website?: string;
}

export function BusinessOnboarding({ open, onBusinessCreated, onDismiss }: BusinessOnboardingProps) {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [verificationError, setVerificationError] = useState('');

  // Extract Place ID from Google Maps URL
  const extractPlaceId = (url: string): string | null => {
    // Pattern: place_id: in URL
    const placeIdMatch = url.match(/place_id[=:]([A-Za-z0-9_-]+)/);
    if (placeIdMatch) return placeIdMatch[1];

    // Pattern: ChIJ... directly
    const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]+)/);
    if (chijMatch) return chijMatch[1];

    // Pattern: /place/.../@.../data=...!1s... (Google Maps share URL)
    const dataMatch = url.match(/!1s(0x[a-f0-9]+:[a-f0-9]+)/);
    if (dataMatch) return dataMatch[1];

    return null;
  };

  const handleMapsUrlChange = (url: string) => {
    setMapsUrl(url);
    setVerificationError('');
    setPlaceDetails(null);

    // Try to extract Place ID
    const extracted = extractPlaceId(url);
    if (extracted) {
      setPlaceId(extracted);
    }
  };

  const handlePlaceIdChange = (value: string) => {
    setPlaceId(value);
    setVerificationError('');
    setPlaceDetails(null);
  };

  // Suggest company name from email domain
  const suggestedName = user?.email ? getCompanyNameFromEmail(user.email) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessName || suggestedName,
          place_id: placeId || null,
        });

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'İşletmeniz eklendi!',
      });

      onBusinessCreated();
      resetForm();
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

  const resetForm = () => {
    setBusinessName('');
    setPlaceId('');
    setMapsUrl('');
    setPlaceDetails(null);
    setVerificationError('');
  };

  const handleGoogleConnect = async () => {
    setLoading(true);
    try {
      const response = await invokeAuthedFunction<{ authUrl?: string }>('google-business-auth', {
        body: { action: 'initiate' },
      });

      if (response?.authUrl) {
        window.location.href = response.authUrl;
      }
    } catch (error: any) {
      console.error('Google connect error:', error);
      toast({
        title: 'Bağlantı Hatası',
        description: error.message || 'Google hesabına bağlanılamadı',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && onDismiss) onDismiss(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            İşletmenizi Doğrulayın
          </DialogTitle>
          <DialogDescription>
            İşletme bilgilerinizi ekleyerek hesabınızı doğrulayın
          </DialogDescription>
        </DialogHeader>

        {/* User email badge */}
        {user?.email && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Giriş yapılan e-posta: </span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
          </div>
        )}
        
        {!showManualForm ? (
          <div className="space-y-4">
            {/* Google Connect */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleGoogleConnect}
              disabled={loading}
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
              <MapPin className="w-4 h-4 mr-2" />
              Manuel Olarak Ekle
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">İşletme Adı</Label>
              <Input
                id="businessName"
                placeholder={suggestedName || 'Otel / Restoran Adı'}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                disabled={loading}
              />
              {suggestedName && !businessName && (
                <p className="text-xs text-muted-foreground">
                  E-posta adresinizden önerilen: <button type="button" className="text-primary underline" onClick={() => setBusinessName(suggestedName)}>{suggestedName}</button>
                </p>
              )}
            </div>

            {/* Google Maps URL or Place ID */}
            <div className="space-y-3">
              <Label>Google Maps Bağlantısı veya Place ID</Label>
              
              <div className="space-y-2">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Google Maps URL yapıştırın..."
                    value={mapsUrl}
                    onChange={(e) => handleMapsUrlChange(e.target.value)}
                    disabled={loading || verifying}
                    className="pl-10"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-dashed" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">veya</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Google Place ID (ChIJ...)"
                    value={placeId}
                    onChange={(e) => handlePlaceIdChange(e.target.value)}
                    disabled={loading || verifying}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Help text */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Place ID nasıl bulunur?
                  </a>
                </p>
                <p>Google Maps'te işletmenizi arayın → paylaş → bağlantıyı buraya yapıştırın.</p>
              </div>

              {/* Verification error */}
              {verificationError && (
                <Alert variant="destructive">
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}

              {/* Place details preview */}
              {placeDetails && (
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{placeDetails.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {placeDetails.address}
                  </p>
                  {placeDetails.rating && (
                    <p className="text-sm text-muted-foreground">
                      ⭐ {placeDetails.rating} ({placeDetails.totalReviews} yorum)
                    </p>
                  )}
                </div>
              )}

              {/* Extracted Place ID indicator */}
              {placeId && !placeDetails && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Place ID algılandı: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{placeId.substring(0, 20)}...</code></span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => { setShowManualForm(false); resetForm(); }}
                disabled={loading}
              >
                Geri
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || verifying}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    İşletme Oluştur
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
