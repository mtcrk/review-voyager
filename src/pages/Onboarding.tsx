import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, MessageSquare, Star, Phone, Sparkles, Lock, Clock, Square, CheckSquare } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

type Step = 1 | 2 | 3 | 4;

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface ChannelOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: "available" | "early-access" | "coming-soon";
}

interface AutomationOption {
  id: string;
  title: string;
  description: string;
  channel: string;
  status: "available" | "early-access" | "coming-soon";
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<string>("");

  const goals: GoalOption[] = [
    {
      id: "instagram-sales",
      title: "Get more sales from Instagram DMs",
      description: "Turn comments into conversations that convert",
      icon: MessageSquare,
    },
    {
      id: "google-reviews",
      title: "Manage & reply to Google reviews faster",
      description: "AI-powered responses that save hours",
      icon: Star,
    },
    {
      id: "centralize",
      title: "Centralize customer conversations",
      description: "One inbox for all your channels",
      icon: Sparkles,
    },
  ];

  const channels: ChannelOption[] = [
    {
      id: "instagram",
      title: "Instagram Sales",
      description: "Comment → DM automation, AI-powered replies, product sales",
      icon: MessageSquare,
      status: "available",
    },
    {
      id: "google-reviews",
      title: "Google Reviews",
      description: "AI review replies, sentiment analysis, reputation management",
      icon: Star,
      status: "available",
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Business messaging automation",
      icon: Phone,
      status: "coming-soon",
    },
  ];

  const automations: AutomationOption[] = [
    {
      id: "comment-to-dm",
      title: "Comment → DM auto reply",
      description: "Automatically send a DM when someone comments a keyword",
      channel: "instagram",
      status: "available",
    },
    {
      id: "dm-faq",
      title: "DM FAQ assistant",
      description: "AI answers common questions in your DMs",
      channel: "instagram",
      status: "available",
    },
    {
      id: "review-reply",
      title: "AI review reply suggestions",
      description: "Get smart reply suggestions for every review",
      channel: "google-reviews",
      status: "available",
    },
    {
      id: "sentiment-analysis",
      title: "Review sentiment analysis",
      description: "Automatically categorize reviews by sentiment",
      channel: "google-reviews",
      status: "available",
    },
  ];

  const getStatusBadge = (status: "available" | "early-access" | "coming-soon") => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Available
          </span>
        );
      case "early-access":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Early Access
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Lock className="w-3 h-3 mr-1" />
            Coming Soon
          </span>
        );
    }
  };

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedGoal;
      case 2:
        return selectedChannels.length > 0;
      case 3:
        return !!selectedAutomation;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
    } else {
      navigate(`/hub?selected=${selectedAutomation}`);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    } else {
      navigate("/");
    }
  };

  const filteredAutomations = automations.filter(
    (a) => selectedChannels.includes(a.channel) || selectedChannels.length === 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1.5 rounded-full transition-all ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Step 1: Choose your goal */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                What's your main goal?
              </h1>
              <p className="text-muted-foreground text-lg">
                We'll help you get there faster.
              </p>
            </div>

            <div className="grid gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-6 rounded-xl border text-left transition-all hover:shadow-md ${
                    selectedGoal === goal.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedGoal === goal.id ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <goal.icon
                        className={`w-6 h-6 ${
                          selectedGoal === goal.id ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">{goal.title}</h3>
                      <p className="text-muted-foreground mt-1">{goal.description}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedGoal === goal.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedGoal === goal.id && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose your automations - CHECKBOX STYLE */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Which automations do you want to use?
              </h1>
              <p className="text-muted-foreground text-lg">
                Select one or more channels to automate.
              </p>
            </div>

            <div className="grid gap-4">
              {channels.map((channel) => {
                const isSelected = selectedChannels.includes(channel.id);
                const isDisabled = channel.status === "coming-soon";
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => !isDisabled && toggleChannel(channel.id)}
                    disabled={isDisabled}
                    className={`p-6 rounded-xl border text-left transition-all ${
                      isDisabled
                        ? "opacity-60 cursor-not-allowed bg-muted/50"
                        : isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox Icon */}
                      <div className="mt-1">
                        {isSelected ? (
                          <CheckSquare className="w-6 h-6 text-primary" />
                        ) : (
                          <Square className={`w-6 h-6 ${isDisabled ? "text-muted-foreground/40" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      
                      <div
                        className={`p-3 rounded-lg ${
                          isSelected ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <channel.icon
                          className={`w-6 h-6 ${
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground text-lg">{channel.title}</h3>
                          {getStatusBadge(channel.status)}
                        </div>
                        <p className="text-muted-foreground">{channel.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Helper text */}
            <p className="text-center text-muted-foreground text-sm">
              You can start with one and add more anytime.
            </p>
          </div>
        )}

        {/* Step 3: Pick your first automation */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Pick your first automation
              </h1>
              <p className="text-muted-foreground text-lg">
                You can add more automations later.
              </p>
            </div>

            <div className="grid gap-4">
              {filteredAutomations.map((automation) => (
                <button
                  key={automation.id}
                  onClick={() =>
                    automation.status !== "coming-soon" && setSelectedAutomation(automation.id)
                  }
                  disabled={automation.status === "coming-soon"}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    automation.status === "coming-soon"
                      ? "opacity-60 cursor-not-allowed bg-muted/50"
                      : selectedAutomation === automation.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground text-lg">
                          {automation.title}
                        </h3>
                        {getStatusBadge(automation.status)}
                      </div>
                      <p className="text-muted-foreground">{automation.description}</p>
                      <span className="text-xs text-primary mt-2 inline-block">
                        {channels.find((c) => c.id === automation.channel)?.title}
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                        selectedAutomation === automation.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedAutomation === automation.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Create account */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                You're all set!
              </h1>
              <p className="text-muted-foreground text-lg">
                Let's take you to the Automation Hub.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-foreground">Ready to automate</h3>
                <p className="text-muted-foreground">
                  Your selected automations are ready to be configured.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedChannels.map((ch) => (
                  <span
                    key={ch}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {channels.find((c) => c.id === ch)?.title}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                You can add more channels or automations anytime from the Hub.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 gradient-primary text-white"
          >
            {step === 4 ? "Continue to Hub" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;