import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/seo/SEO";

export default function CancellationPolicy() {
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
        title="İptal & İade Koşulları | VoyageRespond"
        description="VoyageRespond abonelik iptal ve iade koşulları."
        canonical="https://voyagerespond.com/iptal-iade-kosullari"
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Cayma Hakkı / İptal &amp; İade Koşulları
        </h1>
        <p className="text-muted-foreground mb-8">Son güncelleme: 05.08.2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Section title="1. Abonelik İptali Nasıl Yapılır?">
            <p>
              Aboneliğinizi istediğiniz zaman VoyageRespond paneli üzerinden
              <strong> Abonelik</strong> menüsünden tek tıkla iptal
              edebilirsiniz. Alternatif olarak admin@voyagerespond.com adresine yazılı
              talebinizi iletebilirsiniz.
            </p>
          </Section>

          <Section title="2. İptal Ne Zaman Geçerli Olur?">
            <p>
              İptal talebi anında sisteme işlenir. Mevcut abonelik dönemi sonuna kadar hizmete
              erişiminiz devam eder ve dönem sonunda otomatik yenileme durdurulur. Sonraki
              tahsilat yapılmaz.
            </p>
          </Section>

          <Section title="3. İade Koşulları">
            <p>
              VoyageRespond, ödeme onayının ardından elektronik ortamda derhâl ifa edilen dijital
              bir hizmettir. Bu nedenle kullanılmakta olan abonelik dönemine ait ücretler iade
              edilmez. Abonelik istediğiniz zaman iptal edilebilir; iptal hâlinde dönem sonuna
              kadar hizmete erişim devam eder ve sonraki dönem için tahsilat yapılmaz.
            </p>
            <p>
              Mükerrer veya hatalı tahsilat söz konusu olduğunda, ilgili tutar bir iade talebine
              bağlı olmaksızın ödemenin yapıldığı karta iade edilir.
            </p>
          </Section>

          <Section title="4. Hatalı Tahsilat İadeleri">
            <p>
              Mükerrer veya hatalı tahsilatlarda iade, ödemenin yapıldığı karta yapılır. Tutarın
              kart hesabına yansıma süresi bankadan bankaya değişiklik gösterebilir.
            </p>
          </Section>

          <Section title="5. İletişim">
            <p>
              İptal veya iade süreciyle ilgili her türlü sorunuz için: admin@voyagerespond.com
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}