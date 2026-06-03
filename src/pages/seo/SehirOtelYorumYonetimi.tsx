import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, MapPin, Star, Hotel, TrendingUp, CheckCircle2, Globe } from "lucide-react";
import { useEffect } from "react";
import SEO from "@/components/seo/SEO";
import AEOSection from "@/components/seo/AEOSection";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { cityHotelData, getCityHotelData } from "@/lib/cityHotelData";

const SehirOtelYorumYonetimi = () => {
  const { sehir } = useParams<{ sehir: string }>();
  const navigate = useNavigate();
  const city = sehir ? getCityHotelData(sehir) : undefined;

  useEffect(() => {
    if (sehir && !city) navigate("/otel-yorum-cevaplari", { replace: true });
  }, [sehir, city, navigate]);

  if (!city) return null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${city.name} Otel Yorum Yönetimi`,
      provider: { "@type": "Organization", name: "VoyageRespond", url: "https://voyagerespond.com" },
      areaServed: { "@type": "City", name: city.name },
      description: city.seoDescription,
      serviceType: "Hotel Reputation Management",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://voyagerespond.com/" },
        { "@type": "ListItem", position: 2, name: "Otel Yorum Cevapları", item: "https://voyagerespond.com/otel-yorum-cevaplari" },
        { "@type": "ListItem", position: 3, name: `${city.name} Otel Yorum Yönetimi`, item: `https://voyagerespond.com/otel-yorum-yonetimi/${city.slug}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0F0820 0%,#1A0F38 100%)" }}>
      <SEO
        title={city.seoTitle}
        description={city.seoDescription}
        canonical={`/otel-yorum-yonetimi/${city.slug}`}
        jsonLd={jsonLd}
      />

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={voyageRespondLogo} alt="VoyageRespond" className="h-8" />
          </Link>
          <button
            onClick={() => navigate("/onboarding")}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#7C3AED" }}
          >
            3 Ay Ücretsiz Dene
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 mb-4">
            <MapPin className="w-3 h-3" /> {city.region} Bölgesi
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {city.name} Otel Yorum Yönetimi
          </h1>
          <p className="text-base sm:text-lg text-purple-200 max-w-2xl mx-auto">
            {city.description}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <StatCard icon={<Hotel className="w-5 h-5" />} value={city.hotelCount} label="Otel Sayısı" />
          <StatCard icon={<Star className="w-5 h-5" />} value={city.avgRating.toFixed(1)} label="Ort. Puan" />
          <StatCard icon={<Globe className="w-5 h-5" />} value={`${city.topPlatforms.length}+`} label="Aktif Platform" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} value="3 Ay" label="Ücretsiz Deneme" />
        </div>

        {/* Platforms */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            {city.nameLocative} En Çok Kullanılan Yorum Platformları
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {city.topPlatforms.map((p) => (
              <div key={p} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-white font-semibold">{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            {city.nameLocative} Yorum Yönetiminde Dikkat Edilmesi Gerekenler
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {city.highlights.map((h, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/90">{h}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Competitors / category leaders */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {city.nameLocative} Yorum Yönetiminde Lider Oteller
          </h2>
          <p className="text-sm text-purple-200 mb-6">
            Aşağıdaki oteller {city.name}'da yorum yanıtlamada öne çıkan örneklerdir. Onlar gibi olmak için günlük yorum hacmini AI ile yönetmek şart.
          </p>
          <div className="space-y-2">
            {city.competitors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs font-bold text-purple-400 w-6">#{i + 1}</span>
                <span className="text-white font-medium">{c}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-white/10 p-6 sm:p-10 text-center mb-12" style={{ backgroundColor: "#1A0F38" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {city.name} Otelinizin Yorumlarını Bugün Yönetmeye Başlayın
          </h2>
          <p className="text-sm sm:text-base text-purple-200 max-w-xl mx-auto mb-6">
            Google, Booking, TripAdvisor ve diğer platformlardaki tüm yorumları tek panelden, AI destekli çok dilli yanıtlarla yönetin.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: "#7C3AED" }}
          >
            3 Ay Ücretsiz Başla <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* AEO / FAQ */}
        <AEOSection
          title={`${city.name} Otel Yorum Yönetimi — Sıkça Sorulan Sorular`}
          faqs={[
            {
              question: `${city.name}'da otelimin Google yorumlarına nasıl yanıt verebilirim?`,
              answer: `${city.name}'daki otelinizin Google yorumlarına Google Business Profile üzerinden manuel veya VoyageRespond gibi bir AI platform üzerinden otomatik yanıt verebilirsiniz. Günlük yorum hacmi 10+ ise AI önerilir.`,
            },
            {
              question: `${city.name}'da kaç otel var?`,
              answer: `${city.name} bölgesinde yaklaşık ${city.hotelCount} aktif otel bulunmaktadır. Bunların büyük çoğunluğu Google, Booking.com ve TripAdvisor üzerinde aktif olarak yorum almaktadır.`,
            },
            {
              question: `${city.name} otelleri için en kritik yorum platformu hangisi?`,
              answer: `${city.name}'da öncelik sırası: ${city.topPlatforms.join(", ")}. Bölgenin misafir profili ve rezervasyon kanallarına göre değişebilir.`,
            },
            {
              question: `${city.nameLocative} otel yorum yönetimi için VoyageRespond nasıl yardımcı olur?`,
              answer: `VoyageRespond, ${city.name}'daki otelinizin tüm platformlardan gelen yorumlarını tek panele toplar, AI ile çok dilli yanıt üretir, sentimenti analiz eder ve sıralama trendlerini takip eder. İlk 3 ay ücretsiz.`,
            },
          ]}
        />

        {/* Other cities */}
        <section className="mt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Diğer Şehirler</h2>
          <div className="flex flex-wrap gap-2">
            {cityHotelData
              .filter((c) => c.slug !== city.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/otel-yorum-yonetimi/${c.slug}`}
                  className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-purple-200 hover:bg-white/10 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 mb-2">
      {icon}
    </div>
    <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-purple-300 mt-1">{label}</p>
  </div>
);

export default SehirOtelYorumYonetimi;