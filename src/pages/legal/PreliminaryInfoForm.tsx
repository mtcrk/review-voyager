import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/seo/SEO";

type Props = {
  planLabel?: string;
  totalAmount?: number;
  currency?: string;
};

export default function PreliminaryInfoForm({
  planLabel,
  totalAmount,
  currency = "TL",
}: Props) {
  const navigate = useNavigate();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );

  const priceLine =
    typeof totalAmount === "number"
      ? `${totalAmount.toLocaleString("tr-TR")} ${currency} / ay (KDV dahil)`
      : "[Ödeme ekranında hesaplanan güncel tutar / ay (KDV dahil)]";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Ön Bilgilendirme Formu | VoyageRespond"
        description="Mesafeli Sözleşmeler Yönetmeliği kapsamında ödeme öncesi ön bilgilendirme formu."
        canonical="https://voyagerespond.com/on-bilgilendirme-formu"
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-4">Ön Bilgilendirme Formu</h1>
        <p className="text-muted-foreground mb-8">Son güncelleme: 05.08.2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Section title="1. Hizmet Sağlayıcı Bilgileri">
            <p>
              Hizmet Sağlayıcı: VoyageRespond<br />
              Adres: Bilkent, Çankaya, Ankara<br />
              E-posta: admin@voyagerespond.com<br />
              Telefon: +90 537 267 53 14
            </p>
          </Section>

          <Section title="2. Hizmetin Temel Nitelikleri">
            <p>
              VoyageRespond, işletmelerin çevrimiçi yorumlarını toplayan, yapay zekâ destekli
              yanıt üreten ve itibar raporlaması sunan bulut tabanlı (SaaS) bir abonelik
              hizmetidir. Seçilen pakete göre entegre edilen platformlar ve modüller ödeme
              öncesi ürün sayfasında belirtilir.
            </p>
            {planLabel && (
              <p>
                <strong>Seçilen Plan:</strong> {planLabel}
              </p>
            )}
          </Section>

          <Section title="3. Tüm Vergiler Dahil Toplam Fiyat">
            <p>
              <strong>{priceLine}</strong>
            </p>
            <p>
              Abonelik aksi belirtilmedikçe her ay aynı gün otomatik olarak yenilenir ve
              kayıtlı karttan tahsil edilir. Fiyatlarda yapılacak değişiklikler yürürlüğe
              girmeden önce Abone'ye e-posta ile bildirilir.
            </p>
          </Section>

          <Section title="4. Ödeme Şekli">
            <p>
              Ödemeler, PayTR Ödeme ve Elektronik Para Hizmetleri A.Ş. altyapısı üzerinden
              kredi/banka kartı ile alınır. Kart bilgileri Hizmet Sağlayıcı sunucularında
              saklanmaz. Aylık yenilemeler kayıtlı kart üzerinden otomatik olarak tahsil edilir.
            </p>
          </Section>

          <Section title="5. Teslimat / İfa">
            <p>
              Hizmet dijitaldir ve ödeme onayının ardından derhâl aktive edilir.
            </p>
          </Section>

          <Section title="6. Cayma Hakkı ve İstisnaları">
            <p>
              Hizmet, ödeme onayının ardından elektronik ortamda derhâl ifa edilmeye başlanan
              dijital bir hizmettir. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
              Sözleşmeler Yönetmeliği'nin ilgili hükümleri uyarınca, elektronik ortamda anında ifa
              edilen hizmetler ile cayma hakkı süresi sona ermeden tüketicinin onayı ile ifasına
              başlanan hizmetlere ilişkin sözleşmelerde cayma hakkı kullanılamaz. Abone, ödeme
              ekranında bu Sözleşmeyi onaylayarak hizmetin derhâl ifasını talep ettiğini ve cayma
              hakkının bulunmadığını kabul eder.
            </p>
            <p>
              Abonelik, panel üzerinden her zaman iptal edilebilir. İptal hâlinde içinde bulunulan
              abonelik döneminin sonuna kadar hizmete erişim devam eder ve sonraki dönem için
              tahsilat yapılmaz. Ayrıntılar için{" "}
              <a href="/iptal-iade-kosullari" className="underline">İptal &amp; İade Koşulları</a>{" "}
              sayfasına bakınız.
            </p>
          </Section>

          <Section title="7. Şikâyet ve Uyuşmazlık Başvuruları">
            <p>
              Hizmete ilişkin şikâyetlerinizi admin@voyagerespond.com adresine
              iletebilirsiniz. Uyuşmazlıklarda parasal sınırlar dahilinde Tüketici Hakem
              Heyetleri ve Tüketici Mahkemeleri yetkilidir.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}