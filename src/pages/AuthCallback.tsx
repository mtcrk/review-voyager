import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '@/lib/analytics';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState(t('auth.authCallback.verifying'));

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setMessage(t('auth.authCallback.error'));
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          try {
            if (sessionStorage.getItem('signup_intent') === 'true') {
              trackEvent('sign_up', { method: 'google' });
              sessionStorage.removeItem('signup_intent');
            }
          } catch {}
          setMessage(t('auth.authCallback.success'));
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setMessage(t('auth.authCallback.noSession'));
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        setMessage(t('auth.authCallback.error'));
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
            {t('auth.authCallback.title')}
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
