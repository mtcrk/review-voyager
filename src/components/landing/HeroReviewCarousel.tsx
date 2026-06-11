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
  ctaLabel: string;
};

const EXAMPLES: Example[] = [
  {
    platform: { label: "Google", logo: "G", bg: "bg-white", fg: "text-[#4285F4]" },
    accent: "#5B9DFF",
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
    ctaLabel: "Onayla & Gönder",
  },
  {
    platform: { label: "Booking.com", logo: "B", bg: "bg-[#1E6BFF]", fg: "text-white" },
    accent: "#1E6BFF",
    reviewerInitials: "MS",
    reviewerName: "Maria S.",
    timeAgo: "5 hours ago",
    ratingNode: (
      <span className="px-1.5 py-0.5 rounded bg-[#1E6BFF] text-white text-[10px] font-bold">9.2</span>
    ),
    reviewText:
      "Wonderful stay! The staff was incredibly helpful and the breakfast was amazing.",
    tones: ["Profesyonel ton", "İngilizce"],
    language: "English",
    replyText:
      "Dear Maria, thank you so much for your kind words! We're delighted you enjoyed our breakfast and hospitality. We look forward to welcoming you again.",
    sentTo: "Sent to Booking.com",
    ctaLabel: "Approve & Send",
  },
  {
    platform: { label: "Google", logo: "G", bg: "bg-white", fg: "text-[#4285F4]" },
    accent: "#5B9DFF",
    reviewerInitials: "SK",
    reviewerName: "Selin K.",
    timeAgo: "1 gün önce",
    ratingNode: (
      <div className="flex gap-0.5">
        {[1, 2].map((i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {[3, 4, 5].map((i) => (
          <Star key={i} className="w-3 h-3 text-white/20" />
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
    ctaLabel: "Onayla & Gönder",
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
    ctaLabel: "Approve & Send",
  },
];

type Phase = "incoming" | "thinking" | "typing" | "approved" | "exit";
const PHASE_ORDER: Phase[] = ["incoming", "thinking", "typing", "approved", "exit"];
const PHASE_DUR: Record<Phase, number> = {
  incoming: 900,
  thinking: 1100,
  typing: 3500,
  approved: 1500,
  exit: 900,
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

function DeckCard({ offset, accent }: { offset: 1 | 2; accent: string }) {
  const scale = offset === 1 ? 0.96 : 0.92;
  const y = offset === 1 ? 12 : 24;
  const opacity = offset === 1 ? 0.4 : 0.2;
  return (
    <div
      aria-hidden
      className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-2xl overflow-hidden pointer-events-none transition-all duration-700 ease-out"
      style={{ transform: `translateY(${y}px) scale(${scale})`, opacity, zIndex: offset === 1 ? 1 : 0 }}
    >
      <div className="h-[2px] transition-colors duration-700" style={{ backgroundColor: accent }} />
      <div className="p-5 space-y-3">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="h-16 rounded-lg bg-white/[0.06]" />
        <div className="h-20 rounded-lg bg-white/[0.05]" />
      </div>
    </div>
  );
}

export function HeroReviewCarousel() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("incoming");
  const [typed, setTyped] = useState("");
  const [paused, setPaused] = useState(false);
  const [count, setCount] = useState(12);

  const phaseTimer = useRef<number | null>(null);
  const phaseStart = useRef<number>(Date.now());
  const phaseRemaining = useRef<number>(PHASE_DUR.incoming);

  const active = EXAMPLES[index];
  const next1 = EXAMPLES[(index + 1) % EXAMPLES.length];
  const next2 = EXAMPLES[(index + 2) % EXAMPLES.length];

  // Phase scheduler
  useEffect(() => {
    if (paused) return;

    if (reduced) {
      // No phase machine — just rotate cards calmly
      const t = window.setTimeout(() => {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setCount((c) => c + 1);
      }, 3500);
      return () => window.clearTimeout(t);
    }

    phaseStart.current = Date.now();
    const dur = phaseRemaining.current;

    phaseTimer.current = window.setTimeout(() => {
      if (phase === "approved") setCount((c) => c + 1);

      if (phase === "exit") {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setTyped("");
        setPhase("incoming");
        phaseRemaining.current = PHASE_DUR.incoming;
      } else {
        const nextPhase = PHASE_ORDER[PHASE_ORDER.indexOf(phase) + 1];
        setPhase(nextPhase);
        phaseRemaining.current = PHASE_DUR[nextPhase];
      }
    }, dur);

    return () => {
      if (phaseTimer.current) {
        window.clearTimeout(phaseTimer.current);
        const elapsed = Date.now() - phaseStart.current;
        phaseRemaining.current = Math.max(0, phaseRemaining.current - elapsed);
      }
    };
  }, [phase, index, paused, reduced]);

  // Typewriter
  useEffect(() => {
    if (reduced) {
      setTyped(active.replyText);
      return;
    }
    if (phase === "incoming" || phase === "thinking") {
      setTyped("");
      return;
    }
    if (phase === "approved" || phase === "exit") {
      setTyped(active.replyText);
      return;
    }
    // typing phase
    if (paused) return;
    const full = active.replyText;
    const tickMs = Math.max(22, PHASE_DUR.typing / full.length);
    let i = typed.length;
    const id = window.setInterval(() => {
      i = Math.min(full.length, i + 1);
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, tickMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, paused, reduced]);

  const showReplyContent = phase === "typing" || phase === "approved" || phase === "exit";
  const showApproved = phase === "approved" || phase === "exit";

  return (
    <div
      className="relative mt-10 md:mt-12 max-w-2xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 -z-10 blur-3xl opacity-80 motion-reduce:opacity-40"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 50%, rgba(122,90,248,0.35), transparent 70%)",
        }}
      />

      {/* Live counter chip */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs shadow-sm">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-400/20">
            <Check className="w-2.5 h-2.5 text-green-400" />
          </span>
          <span
            key={count}
            className="font-semibold tabular-nums text-white animate-vr-count"
          >
            {count}
          </span>
          <span className="text-white/60">yorum yanıtlandı</span>
        </div>
      </div>

      {/* Deck container — fixed height to prevent layout shift */}
      <div className="relative" style={{ minHeight: 500 }}>
        <DeckCard offset={2} accent={next2.accent} />
        <DeckCard offset={1} accent={next1.accent} />

        {/* Front card */}
        <div
          key={index}
          className={`relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(122,90,248,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] ${
            reduced ? "" : "animate-vr-incoming"
          } ${phase === "exit" && !reduced ? "animate-vr-exit" : ""}`}
        >
          {/* Platform accent line */}
          <div
            className="h-[2px] transition-colors duration-700"
            style={{ backgroundColor: active.accent }}
          />

          <div className="p-5 sm:p-6 space-y-4 min-h-[460px]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-h-[20px]">
                <span className="text-xs font-semibold text-white">Yorum Detayları</span>
                {phase === "incoming" && !reduced && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A78BFA]/15 text-[#C4B5FD] text-[10px] font-medium border border-[#A78BFA]/30 animate-vr-pulse-soft">
                    <Sparkles className="w-3 h-3" /> Yeni yorum
                  </span>
                )}
                {showApproved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/15 text-green-300 text-[10px] font-medium border border-green-400/30 animate-vr-fade-up">
                    <Check className="w-3 h-3" /> Yanıtlandı
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/60">
                <span
                  className={`inline-flex items-center justify-center h-4 w-4 rounded text-[8px] font-bold ${active.platform.bg} ${active.platform.fg}`}
                >
                  {active.platform.logo}
                </span>
                {active.platform.label}
              </div>
            </div>

            {/* Review */}
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#A78BFA]/20 flex items-center justify-center text-[10px] font-semibold text-[#C4B5FD]">
                    {active.reviewerInitials}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white leading-tight">{active.reviewerName}</div>
                    <div className="text-[10px] text-white/55">{active.timeAgo}</div>
                  </div>
                </div>
                {active.ratingNode}
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{active.reviewText}</p>
            </div>

            {/* AI Reply area — fixed min-height */}
            <div
              className="relative rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/[0.08] p-3 space-y-2 min-h-[180px] flex flex-col"
              style={{ boxShadow: "0 0 30px -8px rgba(122,90,248,0.25) inset" }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Sparkles
                    className={`w-3 h-3 text-[#C4B5FD] ${
                      phase === "thinking" && !reduced ? "animate-vr-glow" : ""
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-[#C4B5FD]">AI Önerilen Yanıt</span>
                  {phase === "thinking" && !reduced ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#C4B5FD] text-[9px] font-medium animate-vr-fade-up">
                      {active.tones[0]} seçildi
                    </span>
                  ) : (
                    showReplyContent &&
                    active.tones.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#C4B5FD] text-[9px] font-medium">
                        {t}
                      </span>
                    ))
                  )}
                </div>
                <span className="text-[10px] text-white/55">{active.language}</span>
              </div>

              <div className="flex-1">
                {phase === "incoming" && !reduced && (
                  <div className="text-[11px] text-white/50 italic">Yorum inceleniyor…</div>
                )}
                {phase === "thinking" && !reduced && (
                  <div className="flex items-center gap-2 text-[11px] text-white/70">
                    <span className="inline-flex gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] animate-vr-dot" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] animate-vr-dot" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] animate-vr-dot" style={{ animationDelay: "300ms" }} />
                    </span>
                    <span>AI yanıt oluşturuyor...</span>
                  </div>
                )}
                {(showReplyContent || reduced) && (
                  <p className="text-xs text-white/90 leading-relaxed">
                    {typed}
                    {phase === "typing" && !reduced && (
                      <span className="inline-block w-[2px] h-3 bg-[#C4B5FD] align-[-2px] ml-0.5 animate-vr-cursor" />
                    )}
                  </p>
                )}
              </div>

              {/* Footer row — fixed min-height for layout stability */}
              <div className="flex items-center justify-between pt-2 min-h-[28px]">
                <div className="flex items-center">
                  {showApproved && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-green-300 font-medium animate-vr-fade-up">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-400/20 animate-vr-check-pop">
                        <Check className="w-2.5 h-2.5 text-green-300" />
                      </span>
                      {active.sentTo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {phase === "typing" && !reduced && (
                    <span className="text-[10px] text-white/55 italic">yazıyor…</span>
                  )}
                  {(showApproved || reduced) && (
                    <>
                      <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white/70 border border-white/10">Düzenle</span>
                      <span
                        className={`px-2 py-1 rounded-md gradient-primary text-white text-[10px] font-medium ${
                          phase === "approved" && !reduced ? "animate-vr-click" : ""
                        }`}
                        style={{ boxShadow: "0 4px 16px -4px rgba(122,90,248,0.6)" }}
                      >
                        {showApproved ? active.ctaLabel : active.ctaLabel}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vr-incoming {
          0% { opacity: 0; transform: translateY(-18px) scale(0.97); }
          60% { opacity: 1; transform: translateY(3px) scale(1.005); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vr-exit {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(-48px) scale(0.98); }
        }
        @keyframes vr-fade-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes vr-cursor {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes vr-check-pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes vr-click {
          0%, 100% { transform: scale(1); }
          40% { transform: scale(0.94); }
          70% { transform: scale(1.02); }
        }
        @keyframes vr-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes vr-glow {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes vr-pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes vr-count {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-vr-incoming { animation: vr-incoming 700ms cubic-bezier(0.34, 1.4, 0.5, 1) both; }
        .animate-vr-exit { animation: vr-exit 700ms cubic-bezier(0.4, 0, 0.6, 1) both; }
        .animate-vr-fade-up { animation: vr-fade-up 400ms ease-out both; }
        .animate-vr-cursor { animation: vr-cursor 900ms steps(1, end) infinite; }
        .animate-vr-check-pop { animation: vr-check-pop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .animate-vr-click { animation: vr-click 350ms ease-out both; animation-delay: 400ms; }
        .animate-vr-dot { animation: vr-dot 1.2s ease-in-out infinite; display: inline-block; }
        .animate-vr-glow { animation: vr-glow 1.4s ease-in-out infinite; }
        .animate-vr-pulse-soft { animation: vr-pulse-soft 1.6s ease-in-out infinite; }
        .animate-vr-count { animation: vr-count 350ms ease-out both; display: inline-block; }
        @media (prefers-reduced-motion: reduce) {
          .animate-vr-incoming,
          .animate-vr-exit,
          .animate-vr-fade-up,
          .animate-vr-cursor,
          .animate-vr-check-pop,
          .animate-vr-click,
          .animate-vr-dot,
          .animate-vr-glow,
          .animate-vr-pulse-soft,
          .animate-vr-count { animation: none !important; }
        }
      `}</style>
    </div>
  );
}