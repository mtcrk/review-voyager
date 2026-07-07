import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { EmailGateModal } from '@/components/EmailGateModal';

interface GatedDemoWrapperProps {
  children: React.ReactNode;
  onInteract?: () => void;
}

export function GatedDemoWrapper({ children, onInteract }: GatedDemoWrapperProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState<boolean>(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_unlocked') === 'true'
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUnlocked(localStorage.getItem('demo_unlocked') === 'true');
  }, []);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!user && !unlocked) {
      e.preventDefault();
      e.stopPropagation();
      setModalOpen(true);
    } else if (onInteract) {
      onInteract();
    }
  };

  if (!user && !unlocked) {
    return (
      <>
        <div onClick={handleInteraction} className="relative cursor-pointer opacity-75 hover:opacity-90 transition-opacity">
          {children}
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-sm z-40">
            <div className="bg-card border border-border rounded-lg p-6 text-center max-w-sm mx-auto">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('demo.gated.title', 'Demoyu denemek için e-postanı bırak')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('demo.gated.description', '30 saniyede aç, kredi kartı yok.')}
              </p>
              <Button onClick={() => setModalOpen(true)} className="w-full">
                {t('demo.gated.signup', 'Hemen Göster')}
              </Button>
            </div>
          </div>
        </div>
        <EmailGateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onUnlock={() => setUnlocked(true)}
          source="demo"
        />
      </>
    );
  }

  return <>{children}</>;
}
