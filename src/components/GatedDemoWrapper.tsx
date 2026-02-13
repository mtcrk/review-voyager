import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface GatedDemoWrapperProps {
  children: React.ReactNode;
  onInteract?: () => void;
}

export function GatedDemoWrapper({ children, onInteract }: GatedDemoWrapperProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleInteraction = (e: React.MouseEvent) => {
    // Prevent action if not authenticated
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      navigate('/register?redirect=/demo');
    } else if (onInteract) {
      onInteract();
    }
  };

  if (!user) {
    return (
      <div onClick={handleInteraction} className="relative cursor-pointer opacity-75 hover:opacity-90 transition-opacity">
        {children}
        {/* Overlay with signup prompt */}
        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-sm z-40">
          <div className="bg-card border border-border rounded-lg p-6 text-center max-w-sm mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('demo.gated.title', 'Demoyu Denemek İçin Kayıt Olun')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('demo.gated.description', 'Tüm özellikleri test etmek için ücretsiz bir hesap oluşturun')}
            </p>
            <Button
              onClick={() => navigate('/register?redirect=/demo')}
              className="w-full"
            >
              {t('demo.gated.signup', 'Ücretsiz Kayıt Ol')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render normally
  return <>{children}</>;
}
