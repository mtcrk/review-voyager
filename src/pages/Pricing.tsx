import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  MessageSquare,
  Star,
  Phone,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
} from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/seo/SEO";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? 19 : 15,
      description: "Platform access with 1 automation of your choice.",
      highlighted: false,
      features: [
        { text: "Core platform access", included: true },
        { text: "1 automation (Instagram or Google)", included: true },
        { text: "500 messages/month", included: true },
        { text: "Basic analytics", included: true },
        { text: "Email support", included: true },
        { text: "Multiple automations", included: false },
        { text: "Team access", included: false },
        { text: "Advanced analytics", included: false },
      ],
      automationIcons: [MessageSquare, Star],
      automationText: "Choose 1: Instagram or Google",
      cta: "Start Free Trial",
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? 49 : 39,
      description: "Combine up to 2 automations with full analytics.",
      highlighted: true,
      features: [
        { text: "Core platform access", included: true },
        { text: "Up to 2 automations", included: true },
        { text: "Unlimited messages", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Priority support", included: true },
        { text: "Instagram + Google together", included: true },
        { text: "Team access", included: false },
        { text: "Custom integrations", included: false },
      ],
      automationIcons: [MessageSquare, Star],
      automationText: "Instagram + Google",
      cta: "Start Free Trial",
    },
    {
      name: "Agency",
      price: billingCycle === "monthly" ? 99 : 79,
      description: "All automations + team access for growing businesses.",
      highlighted: false,
      features: [
        { text: "Core platform access", included: true },
        { text: "All automations included", included: true },
        { text: "Unlimited messages", included: true },
        { text: "Full analytics suite", included: true },
        { text: "Dedicated support", included: true },
        { text: "All channels access", included: true },
        { text: "Up to 5 team members", included: true },
        { text: "Custom integrations", included: true },
      ],
      automationIcons: [MessageSquare, Star, Phone],
      automationText: "All automations",
      cta: "Contact Sales",
    },
  ];

  const addons = [
    {
      name: "Instagram Sales",
      price: 29,
      description: "Comment → DM automation for Instagram.",
      status: "available" as const,
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      features: ["Comment keyword triggers", "Multi-step DM sequences", "Lead capture forms"],
    },
    {
      name: "Google Reviews",
      price: 29,
      description: "AI-powered review management.",
      status: "available" as const,
      icon: Star,
      color: "from-blue-500 to-cyan-500",
      features: ["AI reply suggestions", "Sentiment analysis", "Review alerts"],
    },
    {
      name: "WhatsApp",
      price: 39,
      description: "WhatsApp Business automation.",
      status: "coming-soon" as const,
      icon: Phone,
      color: "from-gray-400 to-gray-500",
      features: ["Auto-responder", "Quick replies", "Message templates"],
    },
  ];

  const getStatusBadge = (status: "available" | "early-access" | "coming-soon") => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Available
          </span>
        );
      case "early-access":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Early Access
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Lock className="w-3 h-3 mr-1" />
            Coming Soon
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Fiyatlandırma | VoyageRespond"
        description="VoyageRespond fiyatlandırması: platform + otomasyonlar. Starter, Pro ve Enterprise planları. Tek otomasyonla başlayın, ihtiyacınız büyüdükçe ekleyin."
        canonical="/pricing"
      />
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/hub")}>
                Automation Hub
              </Button>
              {user ? (
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              ) : (
                <Button className="gradient-primary text-white" onClick={() => navigate("/onboarding")}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          Pay for the platform.<br />
          <span className="text-primary">Activate the automations you need.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start with one channel. Add more as you grow. No commitments.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg mb-12">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === "yearly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly <span className="text-primary ml-1">-20%</span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-xl border bg-card transition-all ${
                plan.highlighted
                  ? "border-primary shadow-xl scale-105"
                  : "border-border shadow-card hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white gradient-primary rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              {/* Included automations visual */}
              <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Included automations:</p>
                <div className="flex items-center gap-2 mb-2">
                  {plan.automationIcons.map((Icon, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-foreground font-medium">{plan.automationText}</p>
              </div>

              <Button
                className={`w-full mb-6 ${
                  plan.highlighted ? "gradient-primary text-white" : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => navigate("/onboarding")}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-foreground" : "text-muted-foreground/60"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add-ons */}
      <section className="container mx-auto px-4 sm:px-6 py-16 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Automation Add-ons</h2>
          <p className="text-muted-foreground text-lg">
            Enable additional channels as your business grows.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {addons.map((addon, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border bg-card ${
                addon.status === "coming-soon" ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${addon.color}`}>
                  <addon.icon className="w-6 h-6 text-white" />
                </div>
                {getStatusBadge(addon.status)}
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{addon.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
              <div className="mb-4">
                <span className="text-2xl font-bold text-foreground">${addon.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <div className="space-y-2 mb-4">
                {addon.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={addon.status === "coming-soon"}
                onClick={() => navigate("/onboarding")}
              >
                {addon.status === "coming-soon"
                  ? "Coming Soon"
                  : "Add to Plan"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center bg-card border border-border rounded-2xl p-8 md:p-12">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Not sure which plan is right for you?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start with one automation. Add more anytime as your needs grow.
          </p>
          <Button
            size="lg"
            className="gradient-primary text-white"
            onClick={() => navigate("/onboarding")}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">
              Privacy Policy
            </button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;