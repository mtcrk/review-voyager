import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ArrowRight,
  Check,
  Zap,
  DollarSign,
  Calendar,
  HelpCircle,
} from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

const InstagramSales = () => {

  const useCases = [
    {
      icon: DollarSign,
      title: "Price request automation",
      description:
        "When someone comments 'price' or 'how much', automatically send them a DM with your pricing.",
    },
    {
      icon: Calendar,
      title: "Appointment booking",
      description:
        "Turn interested commenters into booked appointments with automated DM sequences.",
    },
    {
      icon: HelpCircle,
      title: "Product link + FAQ",
      description:
        "Share product links and answer common questions automatically in DMs.",
    },
  ];

  const features = [
    "Keyword-triggered DM automation",
    "AI-powered response suggestions",
    "Customizable message templates",
    "Multi-language support",
    "Analytics and conversion tracking",
    "Works with Instagram Business accounts",
  ];

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
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4 mr-2" />
            Instagram Automation
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Turn Comments into DMs.
            <br />
            <span className="text-primary">Turn DMs into Sales.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automate your Instagram engagement. When someone shows interest, instantly
            continue the conversation in their DMs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="gradient-primary text-white px-8"
              asChild
            >
              <Link to="/demo/">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/hub">View All Automations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-primary">How it works</span>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Comment → DM in seconds
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">User comments "price" on your post</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        VoyageRespond detects the keyword
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Automatic DM sent with pricing & next steps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted rounded-xl p-6">
                <div className="space-y-3">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">@customer commented:</p>
                    <p className="font-medium text-foreground">"How much for this? 💰"</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm text-primary mb-1">Auto DM sent:</p>
                    <p className="font-medium text-foreground">
                      "Hi! Thanks for your interest! 🙌 This item is $49. Want me to send you the direct link?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Perfect for these use cases
          </h2>
          <p className="text-muted-foreground text-lg">
            Turn every interaction into an opportunity.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <useCase.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{useCase.title}</h3>
              <p className="text-muted-foreground">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">What's included</h2>
            <p className="text-muted-foreground">Everything you need to automate Instagram sales.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to automate your Instagram?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start converting comments into customers today.
          </p>
          <Button
            size="lg"
            className="gradient-primary text-white px-8"
            asChild
          >
            <Link to="/demo/">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
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

export default InstagramSales;
