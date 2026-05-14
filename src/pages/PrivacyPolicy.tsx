import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/seo/SEO';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sections = [
    'introduction',
    'informationWeCollect',
    'howWeUseInformation',
    'googleBusinessData',
    'dataSharing',
    'dataRetention',
    'security',
    'userRights',
    'internationalTransfers',
    'changes',
    'contact',
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Gizlilik Politikası | VoyageRespond"
        description="VoyageRespond gizlilik politikası: kişisel verilerinizi nasıl topladığımız, kullandığımız, sakladığımız ve koruduğumuz hakkında detaylı bilgi."
        canonical="https://voyagerespond.com/privacy-policy"
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('privacy.backToHome')}
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t('privacy.title')}
        </h1>
        <p className="text-muted-foreground mb-8">{t('privacy.lastUpdated')}</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          {sections.map((section) => (
            <section key={section} className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t(`privacy.sections.${section}.title`)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(`privacy.sections.${section}.content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}