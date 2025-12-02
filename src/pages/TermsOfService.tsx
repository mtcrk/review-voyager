import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
          {t('terms.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('terms.lastUpdated')}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg mb-8">{t('terms.intro')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.acceptance.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.acceptance.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.account.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.account.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.usage.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.usage.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.subscription.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.subscription.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.termination.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.termination.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.liability.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.liability.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.changes.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.changes.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('terms.sections.contact.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('terms.sections.contact.content')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
