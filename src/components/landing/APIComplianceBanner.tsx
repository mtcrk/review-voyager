import { Shield, Lock, UserCheck, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function APIComplianceBanner() {
  const { t } = useTranslation();

  const compliancePoints = [
    {
      icon: Shield,
      title: t('landing.compliance.officialApi', 'Secure Platform Integrations'),
      description: t('landing.compliance.officialApiDesc', 'Connected via official APIs and verified data sources'),
    },
    {
      icon: Lock,
      title: t('landing.compliance.secureOAuth', 'Secure OAuth 2.0 Authorization'),
      description: t('landing.compliance.secureOAuthDesc', 'Businesses authorize via industry-standard OAuth flow'),
    },
    {
      icon: UserCheck,
      title: t('landing.compliance.noSpam', 'No Automated Posting'),
      description: t('landing.compliance.noSpamDesc', 'AI suggests — you review and approve every reply'),
    },
    {
      icon: CheckCircle,
      title: t('landing.compliance.dataProtection', 'Data Protection & Privacy'),
      description: t('landing.compliance.dataProtectionDesc', 'GDPR compliant, encrypted storage, no data reselling'),
    },
  ];

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            {t('landing.compliance.badge', 'API Compliance & Security')}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {t('landing.compliance.title', 'Built on Official APIs. Designed for Trust.')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.compliance.subtitle', 'VoyageRespond uses only official, verified API integrations. Your data stays secure, and every action requires your explicit approval.')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {compliancePoints.map((point, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-5 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <point.icon className="w-6 h-6 text-green-700" />
              </div>
              <div className="font-semibold text-foreground text-sm mb-1">
                {point.title}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {point.description}
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Statement */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('landing.compliance.statement', 'VoyageRespond\'s use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We do not store, share, or transfer user data beyond what is necessary to provide the service.')}
          </p>
        </div>
      </div>
    </section>
  );
}
