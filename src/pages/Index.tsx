import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, BarChart3 } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Voyagerespond" className="h-10 w-10" />
              <span className="text-xl font-semibold text-foreground">Voyagerespond</span>
            </div>
            <Button onClick={() => navigate("/dashboard")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-foreground leading-tight">
            Transform Your Google Reviews into Growth
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            AI-powered review management that helps you respond faster, analyze deeper, 
            and build stronger customer relationships.
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
              Start Managing Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card shadow-card hover:shadow-soft transition-smooth"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to elevate your review management?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join businesses that are saving time and building better customer relationships 
            with AI-powered review responses.
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2024 Voyagerespond. Built with Lovable Cloud.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
