import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, BarChart3, Check } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const features = [
    {
      icon: MessageSquare,
      title: "Smart Review Management",
      description: "Manage all your Google Business reviews in one clean, organized dashboard",
    },
    {
      icon: Zap,
      title: "AI-Powered Replies",
      description: "Generate professional responses instantly with customizable tone and language",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      description: "Track sentiment trends, reply rates, and key insights from your reviews",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? 19 : 15,
      description: "Perfect for single location businesses",
      features: [
        "1 location",
        "200 reviews/month",
        "Dashboard access",
        "AI reply generation",
        "Manual approve & copy",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? 49 : 39,
      description: "For growing businesses",
      features: [
        "3 locations",
        "Unlimited reviews",
        "Auto Reply",
        "Google API reply send",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Agency",
      price: billingCycle === "monthly" ? 99 : 79,
      description: "Scale with your agency",
      features: [
        "Unlimited locations",
        "Team access",
        "Advanced analytics",
        "White-label option",
        "Dedicated support",
      ],
      highlighted: false,
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Voyagerespond" className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">Voyagerespond</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </a>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <Button onClick={() => navigate("/dashboard")}>Get Started</Button>
            </div>
            <div className="md:hidden">
              <Button onClick={() => navigate("/dashboard")} size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            Transform Your Google Reviews into Growth
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            AI-powered review management that helps you respond faster, analyze deeper, 
            and build stronger customer relationships.
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-10 py-6">
              Start Managing Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to manage reviews
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you respond to every review efficiently
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl border border-border bg-card shadow-card hover:shadow-soft transition-smooth"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the plan that fits your business
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-smooth ${
                billingCycle === "monthly"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-smooth ${
                billingCycle === "yearly"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly <span className="text-primary ml-1">(save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-xl border bg-card transition-smooth ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "border-border shadow-card hover:shadow-soft"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "mo"}</span>
              </div>
              <Button
                className="w-full mb-6"
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => navigate("/dashboard")}
              >
                Get Started
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to elevate your customer relationships?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join businesses that are saving time and building better customer relationships 
            with AI-powered review responses.
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-10">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2025 Voyagerespond</span>
            <span className="hidden md:block">•</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <span className="hidden md:block">•</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <span className="hidden md:block">•</span>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
