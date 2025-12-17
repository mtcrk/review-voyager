import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowRight,
  Check,
  Bell,
  Mail,
  MessageCircle,
  Globe,
  Headphones,
  ShoppingCart,
} from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

const OtherAutomations = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const upcomingChannels = [
    {
      icon: Mail,
      title: "Email",
      description: "Automated email responses and follow-ups.",
    },
    {
      icon: MessageCircle,
      title: "Facebook Messenger",
      description: "Chatbot and auto-reply for Messenger.",
    },
    {
      icon: Globe,
      title: "Website Chat",
      description: "Live chat widget with AI assistance.",
    },
    {
      icon: Headphones,
      title: "Support Tickets",
      description: "Integration with help desk platforms.",
    },
    {
      icon: ShoppingCart,
      title: "E-commerce",
      description: "Order updates and customer support.",
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
              <Button className="gradient-primary text-white" onClick={() => navigate("/onboarding")}>
                Get Started
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
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Expanding Soon
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            More channels.
            <br />
            <span className="text-primary">Coming soon.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're expanding to more platforms. Tell us which channels matter most to you.
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
                  Stay Updated
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Be first to know when new channels launch.
              </p>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">You're on the list!</span>
              </div>
              <p className="text-green-600 text-sm">
                We'll keep you updated on new channel launches.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Channels */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            On our roadmap
          </h2>
          <p className="text-muted-foreground text-lg">
            These channels are in development. Vote for your favorites!
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {upcomingChannels.map((channel, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                <channel.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{channel.title}</h3>
              <p className="text-muted-foreground text-sm">{channel.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available Now */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-2xl p-8 md:p-12">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Available right now
          </h2>
          <p className="text-muted-foreground mb-6">
            Start automating today with our current integrations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate("/automations/instagram-sales")}>
              Instagram Automation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/automations/google-reviews")}>
              Google Reviews (Early Access)
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

export default OtherAutomations;
