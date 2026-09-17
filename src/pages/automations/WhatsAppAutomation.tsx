import { useState } from "react";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, Check, Lock, Bell, MessageSquare, Zap, Users } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

const WhatsAppAutomation = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const plannedFeatures = [
    {
      icon: MessageSquare,
      title: "Auto-Responder",
      description: "Automatic replies for common questions and after-hours messages.",
    },
    {
      icon: Zap,
      title: "Quick Replies",
      description: "Pre-saved templates for faster response times.",
    },
    {
      icon: Users,
      title: "Team Inbox",
      description: "Multiple team members managing one WhatsApp number.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get alerted for priority messages and escalations.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/hub">Automation Hub</Link>
              </Button>
              <Button className="gradient-primary text-white" asChild>
                <Link to="/demo/">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
            <Lock className="w-4 h-4 mr-2" />
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            WhatsApp Automation
            <br />
            <span className="text-primary">is on the way.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automate your WhatsApp Business conversations. Fast responses, happy customers.
          </p>

          {/* Notify Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="gradient-primary text-white">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                We'll let you know as soon as it's ready.
              </p>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">You're on the list!</span>
              </div>
              <p className="text-green-600 text-sm">
                We'll notify you when WhatsApp automation launches.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Planned Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What we're building
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features to streamline your WhatsApp communications.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plannedFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border bg-card/50"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meanwhile */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-2xl p-8 md:p-12">
          <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            In the meantime...
          </h2>
          <p className="text-muted-foreground mb-6">
            Check out our available automations for Instagram and Google Reviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild>
              <Link to="/automations/instagram-sales/">
                Instagram Automation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/automations/google-reviews/">Google Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <Link to="/privacy-policy/" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span className="hidden md:block">•</span>
            <Link to="/terms-of-service/" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WhatsAppAutomation;
