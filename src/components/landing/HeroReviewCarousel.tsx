import { useEffect, useState } from "react";
import { Check, Sparkles, Star } from "lucide-react";

type Example = {
  platform: { label: string; logo: string; bg: string; fg: string };
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

export function HeroReviewCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % EXAMPLES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  const ex = EXAMPLES[index];

  return (
    <div
      className="mt-10 md:mt-12 max-w-2xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/10 bg-card">
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

        {/* Body — animated key change triggers fade-in */}
        <div
          key={index}
          className="p-4 sm:p-5 text-left space-y-4 bg-gradient-to-br from-background to-muted/20 animate-fade-in"
        >
          <div className="flex items-center justify-between">
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
          <div className="rounded-lg border border-primary/25 bg-primary/[0.03] p-3 space-y-2">
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
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {EXAMPLES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Örnek ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}