import { useEffect, useRef, useState } from "react";
import { Check, Sparkles, Star } from "lucide-react";

type Example = {
  platform: { label: string; logo: string; bg: string; fg: string };
  accent: string;
  reviewerInitials: string;
  reviewerName: string;
  timeAgo: string;
  ratingNode: React.ReactNode;
  reviewText: string;
  tones: string[];
  language: string;
  replyText: string;
  sentTo: string;
};

const EXAMPLES: Example[] = [
  {
    platform: { label: "Google", logo: "G", bg: "bg-white border border-border", fg: "text-[#4285F4]" },
    accent: "#4285F4",
    reviewerInitials: "AY",
    reviewerName: "Ahmet Y.",
    timeAgo: "2 saat önce",
    ratingNode: (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    ),
    reviewText:
      "Harika bir deneyimdi! Ekibin ilgisi ve hizmet kalitesi mükemmeldi. Kesinlikle tekrar geleceğim.",
    tones: ["Samimi ton"],
    language: "Türkçe",
    replyText:
      "Ahmet Bey, güzel yorumunuz için çok teşekkür ederiz! Ekibimizin ilgisinden ve deneyiminizden memnun kalmanız bizim için çok değerli. Sizi tekrar ağırlamak için sabırsızlanıyoruz. 🙏",
    sentTo: "Google'a gönderildi",
  },
  {
    platform: { label: "Booking.com", logo: "B", bg: "bg-[#003580]", fg: "text-white" },
    accent: "#003580",
    reviewerInitials: "MS",
    reviewerName: "Maria S.",
    timeAgo: "5 hours ago",
    ratingNode: (
      <span className="px-1.5 py-0.5 rounded bg-[#003580] text-white text-[10px] font-bold">9.2</span>
    ),
    reviewText:
      "Wonderful stay! The staff was incredibly helpful and the breakfast was amazing.",
    tones: ["Profesyonel ton", "İngilizce"],
    language: "English",
    replyText:
      "Dear Maria, thank you so much for your kind words! We're delighted you enjoyed our breakfast and hospitality. We look forward to welcoming you again.",
    sentTo: "Sent to Booking.com",
  },
  {
    platform: { label: "Google", logo: "G", bg: "bg-white border border-border", fg: "text-[#4285F4]" },
    accent: "#4285F4",
    reviewerInitials: "SK",
    reviewerName: "Selin K.",
    timeAgo: "1 gün önce",
    ratingNode: (
      <div className="flex gap-0.5">
        {[1, 2].map((i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {[3, 4, 5].map((i) => (
          <Star key={i} className="w-3 h-3 text-muted-foreground/30" />
        ))}
      </div>
    ),
    reviewText:
      "Rezervasyonumda sorun yaşadım, beklemek zorunda kaldım.",
    tones: ["Özür & çözüm tonu"],
    language: "Türkçe",
    replyText:
      "Selin Hanım, yaşadığınız aksaklık için içtenlikle özür dileriz. Konuyu hemen inceledik ve rezervasyon sürecimizi iyileştirdik. Size telafi için ulaşmak isteriz, bizimle iletişime geçebilir misiniz?",
    sentTo: "Google'a gönderildi",
  },
  {
    platform: { label: "TripAdvisor", logo: "T", bg: "bg-[#00AF87]", fg: "text-white" },
    accent: "#00AF87",
    reviewerInitials: "JR",
    reviewerName: "James R.",
    timeAgo: "3 days ago",
    ratingNode: (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="w-3 h-3 rounded-full bg-[#00AF87]" />
        ))}
      </div>
    ),
    reviewText:
      "Best dinner we had on our trip. The seafood was incredibly fresh!",
    tones: ["Sıcak ton", "İngilizce"],
    language: "English",
    replyText:
      "Thank you James! Our chef will be thrilled to hear this. We can't wait to serve you again on your next visit!",
    sentTo: "Sent to TripAdvisor",
  },
];

const AUTOPLAY_MS = 5500;
const TRANSITION_MS = 600;

export function HeroReviewCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const enterTimer = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % EXAMPLES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused]);

  // Trigger staggered "entered" state after slide finishes sliding into place
  useEffect(() => {
    setEntered(false);
    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    enterTimer.current = window.setTimeout(() => setEntered(true), TRANSITION_MS);
    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
    };
  }, [index]);

  const active = EXAMPLES[index];

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setIndex((i) => {
        if (delta < 0) return (i + 1) % EXAMPLES.length;
        return (i - 1 + EXAMPLES.length) % EXAMPLES.length;
      });
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative mt-10 md:mt-12 max-w-2xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 blur-3xl opacity-40 motion-reduce:opacity-20"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, hsl(var(--primary) / 0.18), transparent 70%)",
        }}
      />

      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/10 bg-card">
        {/* Platform accent line — smoothly transitions color between slides */}
        <div
          aria-hidden
          className="h-[2px] w-full transition-colors duration-700 ease-out"
          style={{ backgroundColor: active.accent }}
        />

        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70"></div>
          </div>
          <div className="flex-1 mx-3">
            <div className="h-5 rounded-md bg-muted/60 max-w-xs mx-auto flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground font-mono">voyagerespond.com/dashboard</span>
            </div>
          </div>
        </div>

        {/* Track viewport */}
        <div
          className="overflow-hidden bg-gradient-to-br from-background to-muted/20"
          aria-roledescription="carousel"
          aria-label="VoyageRespond AI yanıt örnekleri"
        >
          <div
            className="flex motion-reduce:!transition-none"
            style={{
              transform: `translate3d(-${index * 100}%, 0, 0)`,
              transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
              willChange: "transform",
            }}
          >
            {EXAMPLES.map((ex, i) => {
              const isActive = i === index;
              const stagger = isActive && entered;
              return (
                <div
                  key={i}
                  className="w-full flex-shrink-0 p-4 sm:p-5 text-left space-y-4 min-h-[440px] sm:min-h-[420px]"
                  aria-hidden={!isActive}
                  aria-roledescription="slide"
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between transition-all duration-500 ease-out motion-reduce:!transition-none"
                    style={{
                      opacity: stagger ? 1 : 0,
                      transform: stagger ? "translateY(0)" : "translateY(6px)",
                      transitionDelay: stagger ? "60ms" : "0ms",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">Yorum Detayları</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-medium border border-green-500/20">
                        <Check className="w-3 h-3" /> Yanıtlandı
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className={`inline-flex items-center justify-center h-4 w-4 rounded text-[8px] font-bold ${ex.platform.bg} ${ex.platform.fg}`}>
                        {ex.platform.logo}
                      </span>
                      {ex.platform.label}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                          {ex.reviewerInitials}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground leading-tight">{ex.reviewerName}</div>
                          <div className="text-[10px] text-muted-foreground">{ex.timeAgo}</div>
                        </div>
                      </div>
                      {ex.ratingNode}
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{ex.reviewText}</p>
                  </div>

                  {/* AI Reply */}
                  <div
                    className="rounded-lg border border-primary/25 bg-primary/[0.03] p-3 space-y-2 transition-all duration-500 ease-out motion-reduce:!transition-none"
                    style={{
                      opacity: stagger ? 1 : 0,
                      transform: stagger ? "translateY(0)" : "translateY(8px)",
                      transitionDelay: stagger ? "140ms" : "0ms",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-semibold text-primary">AI Önerilen Yanıt</span>
                        {ex.tones.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{ex.language}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{ex.replyText}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-medium">
                        <Check className="w-3 h-3" /> {ex.sentTo}
                      </span>
                      <div className="flex gap-1.5">
                        <span className="px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground">Düzenle</span>
                        <span className="px-2 py-1 rounded-md gradient-primary text-white text-[10px] font-medium">Onaylandı</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dots — active dot is a progress bar */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {EXAMPLES.map((_, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Örnek ${i + 1}`}
              aria-current={isActive}
              className={`h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
                isActive
                  ? "w-8 bg-muted-foreground/20"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            >
              {isActive && (
                <span
                  key={`${index}-${paused ? "p" : "r"}`}
                  className="block h-full bg-primary motion-reduce:!animation-none"
                  style={{
                    animation: `vr-dot-progress ${AUTOPLAY_MS}ms linear forwards`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes vr-dot-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-vr-carousel-track] { transition: none !important; }
        }
      `}</style>
    </div>
  );
}