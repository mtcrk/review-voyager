import { Play, Building2, KeyRound, Download, Sparkles, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function ProductVideo() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      icon: Building2,
      time: "0:00",
      title: t('landing.video.step1', 'Business Login'),
      description: t('landing.video.step1Desc', 'Sign up and enter your business details'),
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: KeyRound,
      time: "0:06",
      title: t('landing.video.step2', 'Secure OAuth'),
      description: t('landing.video.step2Desc', 'Authorize via Google\'s official OAuth 2.0 flow'),
      color: "text-amber-600 bg-amber-100",
    },
    {
      icon: Download,
      time: "0:12",
      title: t('landing.video.step3', 'Review Fetch'),
      description: t('landing.video.step3Desc', 'Reviews are automatically pulled from Google Business Profile'),
      color: "text-green-600 bg-green-100",
    },
    {
      icon: Sparkles,
      time: "0:18",
      title: t('landing.video.step4', 'AI Suggestion'),
      description: t('landing.video.step4Desc', 'AI analyzes sentiment and generates a professional reply'),
      color: "text-purple-600 bg-purple-100",
    },
    {
      icon: CheckCircle,
      time: "0:25",
      title: t('landing.video.step5', 'Manual Approval'),
      description: t('landing.video.step5Desc', 'You review, edit if needed, and approve before posting'),
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Play className="w-4 h-4" />
          {t('landing.video.badge', 'Product Demo')}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {t('landing.video.title', 'From Review to Reply in 30 Seconds')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('landing.video.subtitle', 'See how VoyageRespond works — from login to approved reply')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Demo Flow Visualization */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-6 shadow-lg">
            <div className="space-y-1">
              {demoSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-300 ${
                    activeStep === index
                      ? "bg-primary/5 border border-primary/20 shadow-sm"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{step.time}</span>
                      <span className="font-semibold text-foreground text-sm">{step.title}</span>
                    </div>
                    {activeStep === index && (
                      <p className="text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-300">
                        {step.description}
                      </p>
                    )}
                  </div>
                  {index < demoSteps.length - 1 && activeStep !== index && (
                    <div className="absolute left-[2.85rem] mt-10 w-px h-4 bg-border" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Preview */}
          <div className="rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-primary/5 via-background to-blue-500/5 shadow-lg">
            <div className="p-6">
              {/* Mock Browser Chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 bg-muted rounded h-5 ml-3 flex items-center px-3">
                  <span className="text-[10px] text-muted-foreground font-mono">voyagerespond.com/dashboard</span>
                </div>
              </div>

              {/* Step-specific mock UI */}
              <div className="bg-card rounded-lg border border-border p-5 min-h-[280px] flex flex-col justify-center">
                {activeStep === 0 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h4 className="font-semibold text-foreground">Create Your Account</h4>
                    <div className="space-y-2">
                      <div className="h-9 bg-muted rounded-md border border-border" />
                      <div className="h-9 bg-muted rounded-md border border-border" />
                      <div className="h-9 bg-primary/20 rounded-md border border-primary/30 flex items-center justify-center text-sm text-primary font-medium">Sign Up</div>
                    </div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <KeyRound className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Connect Google Business Profile</span>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                      <div className="text-2xl mb-2">🔐</div>
                      <p className="text-xs text-muted-foreground">Secure OAuth 2.0 authorization<br />Your credentials never touch our servers</p>
                    </div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <h4 className="font-semibold text-foreground text-sm">Fetching Reviews...</h4>
                    {[5, 4, 3].map((stars) => (
                      <div key={stars} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border">
                        <div className="flex">
                          {Array.from({ length: stars }).map((_, i) => (
                            <span key={i} className="text-amber-400 text-xs">★</span>
                          ))}
                        </div>
                        <div className="flex-1 h-3 bg-muted rounded" />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground text-center">24 reviews synced</p>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
                        <span className="text-muted-foreground text-xs">★</span>
                      </div>
                      <p className="text-xs text-foreground">"Good food but service was slow..."</p>
                    </div>
                    <div className="flex justify-center">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-primary font-medium mb-1">AI-Generated Reply:</p>
                      <p className="text-xs text-foreground">"Thank you for your feedback! We're glad you enjoyed the food. We're improving our service speed..."</p>
                    </div>
                  </div>
                )}
                {activeStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Review & Approve</span>
                      </div>
                      <p className="text-xs text-green-700">You have full control. Edit the reply or approve as-is.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-9 bg-muted rounded-md border border-border flex items-center justify-center text-xs text-muted-foreground">Edit Reply</div>
                      <div className="flex-1 h-9 bg-green-600 rounded-md flex items-center justify-center text-xs text-white font-medium">✓ Approve & Post</div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">No automated posting — every reply requires your approval</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="flex items-center justify-between mt-8 px-4">
          {demoSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-3 h-3 rounded-full transition-all ${
                activeStep === index ? "bg-primary scale-125" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
              }`} />
              <span className={`text-[10px] font-medium transition-colors hidden md:block ${
                activeStep === index ? "text-primary" : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
