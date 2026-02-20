import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Star, Sparkles, Lock, Clock, Square, CheckSquare, Globe, Hotel, UtensilsCrossed, MessageSquare } from "lucide-react";
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
      id: "review-management",
      title: "Yorumları yönet ve hızlıca yanıtla",
      description: "AI destekli yanıtlarla saatler kazanın",
      icon: Star,
    },
    {
      id: "multi-platform",
      title: "Tüm platformlardaki yorumları tek yerden yönet",
      description: "Google, Booking, TripAdvisor — hepsi bir arada ve daha fazlası",
      icon: Globe,
    },
    {
      id: "reputation",
      title: "Online itibarımı güçlendir",
      description: "AI görünürlük skoru ve rakip analizi ile büyüyün",
      icon: Sparkles,
    },
  ];

  const channels: ChannelOption[] = [
    {
      id: "google-reviews",
      title: "Google Yorumları",
      description: "AI yanıt önerileri, duygu analizi, itibar yönetimi",
      icon: Star,
      status: "available",
    },
    {
      id: "booking",
      title: "Booking.com",
      description: "Otel yorumlarını çek, analiz et ve yanıtla",
      icon: Hotel,
      status: "available",
    },
    {
      id: "tripadvisor",
      title: "TripAdvisor",
      description: "Restoran ve otel yorumlarını tek panelden yönet",
      icon: UtensilsCrossed,
      status: "available",
    },
    {
      id: "trustpilot",
      title: "Trustpilot",
      description: "Avrupa pazarı güvenilirlik yorumlarını takip et",
      icon: Globe,
      status: "available",
    },
    {
      id: "instagram",
      title: "Instagram",
      description: "Yorum → DM otomasyonu, AI yanıtlar, satış",
      icon: MessageSquare,
      status: "early-access",
    },
  ];

  const automations: AutomationOption[] = [
    {
      id: "review-reply",
      title: "AI yanıt önerileri",
      description: "Her yorum için akıllı yanıt önerileri alın",
      channel: "google-reviews",
      status: "available",
    },
    {
      id: "sentiment-analysis",
      title: "Duygu analizi",
      description: "Yorumları otomatik olarak duyguya göre kategorize edin",
      channel: "google-reviews",
      status: "available",
    },
    {
      id: "booking-sync",
      title: "Booking.com yorum senkronizasyonu",
      description: "Booking yorumlarını otomatik çekin ve analiz edin",
      channel: "booking",
      status: "available",
    },
    {
      id: "tripadvisor-sync",
      title: "TripAdvisor yorum senkronizasyonu",
      description: "TripAdvisor yorumlarını otomatik çekin",
      channel: "tripadvisor",
      status: "available",
    },
    {
      id: "trustpilot-sync",
      title: "Trustpilot yorum takibi",
      description: "Trustpilot yorumlarını otomatik çekin",
      channel: "trustpilot",
      status: "available",
    },
    {
      id: "comment-to-dm",
      title: "Yorum → DM otomatik yanıt",
      description: "Biri anahtar kelime yazdığında otomatik DM gönderin",
      channel: "instagram",
      status: "early-access",
    },
  ];

  const getStatusBadge = (status: "available" | "early-access" | "coming-soon") => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Check className="w-3 h-3 mr-1" />
            Aktif
          </span>
        );
      case "early-access":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Erken Erişim
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            <Lock className="w-3 h-3 mr-1" />
            Yakında
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
      case 1: return true; // showcase step, always proceed
      case 2: return selectedChannels.length > 0;
      case 3: return !!selectedAutomation;
      case 4: return true;
      default: return false;
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
              <span className="text-lg text-foreground">
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
        {/* Step 1: Hedefinizi seçin */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                VoyageRespond ile neler yapabilirsiniz?
              </h1>
              <p className="text-muted-foreground text-lg">
                Tek platformdan tüm yorum süreçlerinizi yönetin.
              </p>
            </div>

            <div className="grid gap-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-6 rounded-xl border border-border bg-card text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <goal.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">{goal.title}</h3>
                      <p className="text-muted-foreground mt-1">{goal.description}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-muted-foreground text-sm">
              Tüm bu özellikler planınıza dahildir. Hadi başlayalım!
            </p>
          </div>
        )}

        {/* Step 2: Platformlarınızı seçin */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Hangi platformları kullanmak istiyorsunuz?
              </h1>
              <p className="text-muted-foreground text-lg">
                Bir veya daha fazla kanal seçin.
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
                            isSelected ? "text-primary" : "text-muted-foreground"
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

            <p className="text-center text-muted-foreground text-sm">
              Bir taneyle başlayıp istediğiniz zaman daha fazla ekleyebilirsiniz.
            </p>
          </div>
        )}

        {/* Step 3: İlk otomasyonunuzu seçin */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                İlk otomasyonunuzu seçin
              </h1>
              <p className="text-muted-foreground text-lg">
                Daha sonra istediğiniz kadar otomasyon ekleyebilirsiniz.
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
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Hazırsınız */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Her şey hazır!
              </h1>
              <p className="text-muted-foreground text-lg">
                Sizi Otomasyon Merkezi'ne yönlendirelim.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-foreground">Otomasyona hazır</h3>
                <p className="text-muted-foreground">
                  Seçtiğiniz otomasyonlar yapılandırılmaya hazır.
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
                İstediğiniz zaman Hub'dan daha fazla kanal veya otomasyon ekleyebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 gradient-primary text-white"
          >
            {step === 4 ? "Hub'a Devam Et" : "İleri"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
