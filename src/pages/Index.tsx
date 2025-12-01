import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, BarChart3, Check } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg" style={{ backgroundColor: '#FFFFFF', borderBottomColor: '#E2E8F0' }}>
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo - Left */}
            <button 
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="flex items-center gap-2 pl-3 pt-1 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: '#1F2937', letterSpacing: '0.02em' }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>

            {/* Navigation Links - Center */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => scrollToSection("features")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                Pricing
              </button>
              <a
                href="#"
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                Docs
              </a>
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {user ? 'Dashboard' : 'Login'}
              </button>
            </div>

            {/* CTA Button - Right */}
            <div className="hidden md:block">
              <button 
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#7A5AF8' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7A5AF8'}
              >
                Get Started
              </button>
            </div>

            {/* Mobile CTA */}
            <div className="md:hidden">
              <button 
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: '#7A5AF8' }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-40 pb-36 md:pt-44 md:pb-40 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 gradient-hero-overlay"></div>
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="text-center max-w-3xl mx-auto space-y-10 relative z-10">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight tracking-tight">
            Transform Your Google Reviews into Growth
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            AI-powered review management that helps you respond faster, analyze deeper, 
            and build stronger customer relationships.
          </p>
          <div className="pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/register")} 
              className="relative overflow-hidden gradient-primary text-white shadow-lg text-lg px-12 py-7 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">Start Managing Reviews</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-features"></div>
        <div className="container mx-auto px-6 relative z-10">
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
              className="relative p-8 rounded-xl border border-border bg-card shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden"
            >
              <div className="absolute inset-0 gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-pricing"></div>
        <div className="container mx-auto px-6 relative z-10">
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
              className={`relative p-8 rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-primary shadow-xl scale-105 gradient-card"
                  : "border-border shadow-card hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-white gradient-primary rounded-full shadow-md">
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
                className={`w-full mb-6 ${plan.highlighted ? 'gradient-primary hover:opacity-90 text-white shadow-md' : ''}`}
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
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="border border-primary/20 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 gradient-hero opacity-80"></div>
          <div className="absolute inset-0 gradient-hero-overlay"></div>
          <div className="absolute inset-0 gradient-mesh opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to elevate your customer relationships?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join businesses that are saving time and building better customer relationships 
              with AI-powered review responses.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/register")} 
              className="relative overflow-hidden gradient-primary text-white shadow-lg text-lg px-10 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">Get Started Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2025 VoyageRespond</span>
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
