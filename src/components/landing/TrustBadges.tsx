import { Shield, Lock, Server, CheckCircle, Award, Globe } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "GDPR Uyumlu",
      description: "Avrupa veri koruma standartları",
    },
    {
      icon: Lock,
      title: "256-bit SSL",
      description: "Şifreli veri transferi",
    },
    {
      icon: Server,
      title: "EU Data Center",
      description: "Avrupa'da barındırılan veriler",
    },
    {
      icon: CheckCircle,
      title: "SOC 2 Type II",
      description: "Güvenlik denetimi onaylı",
    },
  ];

  const partners = [
    { name: "Google", logo: "G" },
    { name: "TikTok", logo: "T" },
    { name: "Meta", logo: "M" },
    { name: "OpenAI", logo: "O" },
  ];

  return (
    <section className="container mx-auto px-6 py-12 border-t border-border">
      <div className="max-w-5xl mx-auto">
        {/* Security Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <badge.icon className="w-6 h-6 text-green-600" />
              </div>
              <div className="font-medium text-foreground text-sm mb-1">
                {badge.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {badge.description}
              </div>
            </div>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="border-t border-border pt-8">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Resmi API Entegrasyonları
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-lg">
                  {partner.logo}
                </div>
                <span className="hidden md:block font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/20">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Google Cloud Partner
            </span>
            <span className="text-xs text-muted-foreground">|</span>
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              180+ Ülkede Kullanımda
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
