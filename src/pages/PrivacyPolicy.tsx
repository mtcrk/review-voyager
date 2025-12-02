import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t('privacy.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('privacy.lastUpdated')}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg mb-8">{t('privacy.intro')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('privacy.sections.collection.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacy.sections.collection.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('privacy.sections.usage.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacy.sections.usage.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('privacy.sections.sharing.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacy.sections.sharing.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('privacy.sections.security.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacy.sections.security.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('privacy.sections.rights.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacy.sections.rights.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('privacy.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacy.sections.contact.content')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
