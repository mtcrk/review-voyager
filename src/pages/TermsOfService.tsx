import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sections = [
    'introduction',
    'definitions',
    'serviceDescription',
    'accountRules',
    'acceptableUse',
    'googleApi',
    'payments',
    'termination',
    'limitationOfLiability',
    'governingLaw',
    'contact',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('terms.backToHome')}
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t('terms.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('terms.lastUpdated')}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          {sections.map((section) => (
            <section key={section} className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t(`terms.sections.${section}.title`)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(`terms.sections.${section}.content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}