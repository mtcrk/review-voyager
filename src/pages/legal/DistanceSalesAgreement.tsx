import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/seo/SEO";
import DraftBanner from "./DraftBanner";

export default function DistanceSalesAgreement() {
  const navigate = useNavigate();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Mesafeli Satış Sözleşmesi | VoyageRespond"
        description="VoyageRespond SaaS abonelik hizmeti için mesafeli satış sözleşmesi taslağı."
        canonical="https://voyagerespond.com/mesafeli-satis-sozlesmesi"
        noindex
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-4">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-muted-foreground mb-8">Son güncelleme: [GG.AA.YYYY]</p>

        <DraftBanner />

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Section title="1. Taraflar">
            <p>
              İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), aşağıda bilgileri yer alan taraflar
              arasında elektronik ortamda akdedilmiştir.
            </p>
            <p>
              <strong>Hizmet Sağlayıcı:</strong> VoyageRespond<br />
              Adres: [ADRES]<br />
              E-posta: [E-POSTA]<br />
              Telefon: [TELEFON]
            </p>
            <p>
              <strong>Abone (Alıcı):</strong> Hizmete kayıt sırasında beyan edilen ad, soyad,
              e-posta ve fatura bilgileri geçerlidir.
            </p>
          </Section>

          <Section title="2. Sözleşmenin Konusu">
            <p>
              İşbu Sözleşmenin konusu, Hizmet Sağlayıcı tarafından sunulan "VoyageRespond" adlı
              bulut tabanlı işletme itibar ve yorum yönetimi yazılımına (SaaS) Abone tarafından
              aylık aboneliksatın alınması ve bu hizmetin ifasına ilişkin tarafların hak ve
              yükümlülüklerinin belirlenmesidir.
            </p>
          </Section>

          <Section title="3. Hizmetin Temel Nitelikleri">
            <p>
              Hizmet; işletmenin çevrimiçi platformlardaki yorumlarının toplanması, yapay zekâ
              destekli yanıt üretilmesi, raporlanması ve ilgili entegrasyonların sunulmasını içerir.
              Seçilen pakete göre sunulan modüller ve limitler [ÜRÜN DOKÜMANI/URL] adresinde
              tanımlıdır.
            </p>
          </Section>

          <Section title="4. Ücret ve Ödeme Şekli">
            <p>
              Abonelik ücreti, Abone tarafından ödeme sırasında seçilen plana ve lokasyon sayısına
              göre hesaplanır ve tüm vergiler dahil olarak ödeme ekranında gösterilir.
            </p>
            <p>
              Ödemeler, PayTR Ödeme ve Elektronik Para Hizmetleri A.Ş. altyapısı üzerinden kredi/banka
              kartı ile alınır. Kart bilgileri Hizmet Sağlayıcı sunucularında saklanmaz; PayTR'nin
              PCI-DSS uyumlu altyapısında tokenize edilerek muhafaza edilir.
            </p>
            <p>
              Abonelik, aksi yazılı olarak iptal edilmedikçe her ay aynı gün otomatik olarak
              yenilenir ve kayıtlı karttan tahsil edilir.
            </p>
          </Section>

          <Section title="5. Teslimat / İfa Şekli">
            <p>
              Hizmet dijitaldir. Ödemenin onaylanmasının ardından Abone hesabı aktive edilir ve
              hizmete erişim derhâl sağlanır.
            </p>
          </Section>

          <Section title="6. Tarafların Hak ve Yükümlülükleri">
            <p>
              <strong>Hizmet Sağlayıcı:</strong> Hizmeti işbu Sözleşme ve ürün dokümantasyonuna
              uygun olarak sunmakla, makul teknik desteği sağlamakla ve verileri geçerli mevzuata
              (KVKK) uygun işlemekle yükümlüdür.
            </p>
            <p>
              <strong>Abone:</strong> Doğru ve güncel bilgi vermek, hesabının güvenliğini korumak,
              hizmeti hukuka ve platform kullanım koşullarına uygun kullanmakla yükümlüdür.
            </p>
          </Section>

          <Section title="7. Cayma Hakkı">
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
              uyarınca, elektronik ortamda anında ifa edilen dijital içerik/hizmetlerde
              tüketicinin onayı ile ifaya başlanması hâlinde cayma hakkı kullanılamayabilir.
              [KESİN HÜKÜM HUKUK DANIŞMANI TARAFINDAN NETLEŞTİRİLECEK.]
            </p>
            <p>
              Cayma hakkının kullanılabildiği durumlarda ve abonelik iptal koşullarına ilişkin
              ayrıntılar için <a href="/iptal-iade-kosullari" className="underline">İptal &amp; İade
              Koşulları</a> sayfasına bakınız.
            </p>
          </Section>

          <Section title="8. Mücbir Sebep">
            <p>
              Tarafların kontrolü dışında gelişen ve makul önlemlere rağmen önlenemeyen olaylar
              (doğal afet, savaş, salgın, kamu otoritesi kararları, geniş çaplı altyapı arızaları
              vb.) mücbir sebep sayılır ve bu süre boyunca yükümlülüklerin ifası askıya alınır.
            </p>
          </Section>

          <Section title="9. Uyuşmazlıkların Çözümü">
            <p>
              İşbu Sözleşmeden doğan uyuşmazlıklarda [ŞEHİR] Tüketici Hakem Heyetleri ve [ŞEHİR]
              Tüketici Mahkemeleri yetkilidir. Parasal sınırın üzerindeki uyuşmazlıklarda [ŞEHİR]
              Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </Section>

          <Section title="10. Yürürlük">
            <p>
              Abone, ödeme sayfasında bu Sözleşmeyi ve Ön Bilgilendirme Formunu elektronik ortamda
              onayladığında Sözleşme yürürlüğe girer.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}