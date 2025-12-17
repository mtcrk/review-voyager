import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  ArrowRight,
  Check,
  Clock,
  Zap,
  Shield,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

const GoogleReviews = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const earlyAccessFeatures = [
    {
      icon: Zap,
      title: "AI-powered reply suggestions",
      description: "Get smart, personalized replies for every review in seconds.",
    },
    {
      icon: MessageSquare,
      title: "One-click responses",
      description: "Approve and post replies directly to Google with a single click.",
    },
    {
      icon: Shield,
      title: "Sentiment analysis",
      description: "Automatically detect and prioritize negative reviews.",
    },
    {
      icon: BarChart3,
      title: "Review analytics",
      description: "Track your rating trends and response performance.",
    },
  ];

  const whatYouGet = [
    "Priority access to new features",
    "Direct line to our product team",
    "Help shape the product roadmap",
    "Special early-access pricing",
    "Dedicated onboarding support",
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
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-6">
            <Clock className="w-4 h-4 mr-2" />
            Early Access
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Reply faster.
            <br />
            <span className="text-primary">Sound professional.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered Google review management. Never miss a review, always sound on-brand.
          </p>

          {/* Waitlist Form */}
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
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Be first in line when we launch. No spam, ever.
              </p>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">You're on the list!</span>
              </div>
              <p className="text-green-600 text-sm">
                We'll reach out soon with early access details.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What you'll get with early access
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to manage Google reviews efficiently.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {earlyAccessFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                From review to reply in seconds
              </h3>
              <p className="text-muted-foreground mb-6">
                Our AI analyzes the review sentiment, extracts key points, and generates
                a professional, on-brand response you can approve with one click.
              </p>
              <div className="space-y-3">
                {whatYouGet.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 space-y-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm text-muted-foreground">4/5</span>
                </div>
                <p className="text-foreground text-sm">
                  "Good food but the service was a bit slow. Would come back though!"
                </p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-primary mb-2 font-medium">AI-generated reply:</p>
                <p className="text-foreground text-sm">
                  "Thank you for your feedback! We're glad you enjoyed the food. We're working
                  on improving our service speed - your patience is appreciated. We hope to
                  serve you again soon! 🙏"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to transform your review management?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the waitlist and be first to know when we launch.
          </p>
          {!submitted && (
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
                  Join Waitlist
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
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

export default GoogleReviews;
