import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Star, Users, Zap } from "lucide-react";

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

function MetricCard({ icon: Icon, value, label, suffix = "", color }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
        {formatNumber(displayValue)}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function LiveMetrics() {
  const { t } = useTranslation();

  const metrics = [
    {
      icon: MessageSquare,
      value: 47500,
      label: t('landing.metrics.aiReplies', 'AI Replies Generated'),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Star,
      value: 12800,
      label: t('landing.metrics.reviewsManaged', 'Reviews Managed'),
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: Users,
      value: 850,
      label: t('landing.metrics.activeBusinesses', 'Active Businesses'),
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Zap,
      value: 98,
      suffix: "%",
      label: t('landing.metrics.responseImprovement', 'Response Speed Improvement'),
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {t('landing.metrics.title', 'VoyageRespond by the Numbers')}
        </h2>
        <p className="text-muted-foreground">
          {t('landing.metrics.subtitle', 'Trusted by thousands of businesses')}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </section>
  );
}
