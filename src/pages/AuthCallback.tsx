import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Hesabın doğrulanıyor...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setMessage('Doğrulama sırasında bir hata oluştu.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          setMessage('Hesabın başarıyla doğrulandı! Yönlendiriliyorsun...');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setMessage('Oturum bulunamadı. Giriş sayfasına yönlendiriliyorsun...');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        setMessage('Bir hata oluştu. Giriş sayfasına yönlendiriliyorsun...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Doğrulama
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
