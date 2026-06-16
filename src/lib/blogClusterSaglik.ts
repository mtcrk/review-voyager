import type { BlogPost } from "./blogPosts";

const UPDATED = "2026-06-16";
const AUTHOR = "VoyageRespond Sağlık Ekibi";

export const saglikClusterPosts: BlogPost[] = [
  {
    slug: "doktor-yorumlari-nasil-yonetilir",
    title: "Doktor Yorumları Nasıl Yönetilir? Hekimler için 2026 Rehberi",
    metaTitle: "Doktor Yorumları Nasıl Yönetilir? 2026 Hekim Rehberi",
    metaDescription:
      "Doktor yorumları nerede çıkar, hasta yorumuna KVKK'ya uygun nasıl yanıt verilir, sahte yorumla nasıl mücadele edilir? Hekimler için 2026 pratik rehber.",
    description:
      "Google, Doktorsitesi ve Doktortakvimi'nde çıkan doktor yorumlarını KVKK ve sağlık reklamı yasasına uygun yönetmenin tam rehberi. Olumsuz yoruma profesyonel yanıt örnekleri ve yapay zeka destekli yanıt akışı.",
    ogTitle: "Doktor Yorumları Nasıl Yönetilir? | 2026 Rehberi",
    ogDescription:
      "KVKK uyumlu hasta yorumu yanıtları, sahte yorumla mücadele ve AI destekli yanıt akışı — hekimler için pratik rehber.",
    author: AUTHOR,
    publishedAt: "2026-06-16",
    updatedAt: UPDATED,
    category: "Sağlık & Klinik",
    readTime: "13 dk",
    keywords: [
      "doktor yorumları",
      "doktor google yorum",
      "hekim yorum yönetimi",
      "hasta yorumlarına yanıt",
      "kvkk hasta yorumu",
      "sahte doktor yorumu şikayet",
    ],
    faqs: [
      {
        question: "Hastamın Google yorumuna nasıl cevap veririm KVKK'yı ihlal etmeden?",
        answer:
          "Yanıtta hastanın adı dışında hiçbir sağlık bilgisini (tanı, tedavi, ilaç, prosedür, randevu tarihi) tekrar etmeyin. Yorumda hasta kendi tanısını paylaşmış olsa bile siz teyit etmeyin — bu, KVKK'nın özel nitelikli kişisel veri (sağlık verisi) işleme yasağına girer. Genel bir teşekkür veya 'Geri bildiriminiz için teşekkür ederiz, sizi muayenehanemizde ağırlamaktan memnuniyet duyarız' gibi nötr bir cümle kullanın. Detaylı görüşme için hastayı telefon ya da klinik e-postasına yönlendirin.",
      },
      {
        question: "Sahte ya da haksız bir doktor yorumunu nasıl şikayet ederim?",
        answer:
          "Google Business Profile üzerinden yorumu 'Uygunsuz olarak işaretle' seçeneğiyle bildirin; kategori olarak 'Yanıltıcı', 'Çıkar çatışması' veya 'Spam' uygundur. Yorum gerçek değilse (örneğin hastanız değilse) bu kanıtı (randevu sisteminizde adın bulunmadığı) ekran görüntüsüyle ek olarak Google form üzerinden gönderin. Hakaret veya iftira içeriyorsa ayrıca Cumhuriyet Savcılığı'na suç duyurusu ve Sulh Hukuk Mahkemesi'nde içerik kaldırma talebi mümkündür (avukat işidir).",
      },
      {
        question: "Olumlu bir hasta yorumunu reklamımda kullanabilir miyim?",
        answer:
          "Hayır. 1219 sayılı Tababet ve Şuabatı Sanatlarının Tarzı İcrasına Dair Kanun ve Sağlık Bakanlığı'nın 'Sağlığın Teşviki ve Geliştirilmesine Yönelik Yönetmelik' uyarınca hasta deneyimlerinin reklam ya da tanıtım amacıyla kullanılması yasaktır. Yorumlar Google'da kendi başına kalabilir, ancak bunları broşür, reklam, sosyal medya kreatifi veya web sitesi 'müşteri yorumu' alanı olarak yeniden yayınlayamazsınız.",
      },
      {
        question: "VoyageRespond yorumları sildirebilir mi?",
        answer:
          "Hayır. VoyageRespond bir yorum yönetim aracıdır — yorum silmez ve sildiremez. Yorumları tek panelde toplar, AI ile yanıt taslakları üretir, duygu analizi yapar ve sahte/şüpheli yorumları sizin tespit edip Google'a şikayet etmenizi kolaylaştırır. Silme yetkisi tek başına Google'dadır.",
      },
      {
        question: "Doktor yorumları SEO için önemli mi?",
        answer:
          "Evet. Google Yerel Algoritması (Local Pack) yıldız ortalamasını ve yorum sayısını sıralama sinyali olarak kullanır. 'X uzmanı [şehir]' aramalarında ilk üçe giren hekimlerin yorum sayısı, ilk 10'a giren rakiplerinkinden ortalama 2-3 kat daha fazladır. Yanıtlanan yorumlar ise yanıtlanmayanlara göre Google tarafından daha 'aktif işletme' sinyali olarak değerlendirilir.",
      },
    ],
    content: `
Doktor yorumları nasıl yönetilir? Bu rehberde Google, Doktorsitesi ve Doktortakvimi'nde çıkan hasta yorumlarını **KVKK ve 1219 sayılı kanunu ihlal etmeden** nasıl yönetebileceğinizi, olumsuz yoruma nasıl profesyonel cevap yazılacağını, sahte yorumlarla nasıl mücadele edeceğinizi ve yapay zekanın bu süreçte hekime nasıl zaman kazandırdığını adım adım göreceksiniz.

Türkiye'de hekimlik mesleğinin reklam yasağı sebebiyle yorum yönetimi diğer sektörlerden farklı çalışır. **Yorum silmek değil, yorum yönetmek esastır** — bu rehber tam olarak o sınırların içinde kalır.

## Hastalar Doktor Seçerken Nereye Bakıyor?

Software Advice'ın global araştırmasına göre hastaların **%84'ü** yeni bir hekim seçmeden önce online yorumlara bakıyor; **%77'si** ise Google'ı ilk tercih ediyor. Türkiye'de Doktortakvimi ve Doktorsitesi gibi sektöre özel dizinler bu davranışı tamamlıyor.

Pratikte hasta şu sırayı takip ediyor:

1. Google'da "**[branş] [şehir]**" araması (örn. "kardiyolog ankara")
2. Çıkan ilk 3 Local Pack sonucuna bakma — yıldız ve yorum sayısı kritik
3. Bir hekime tıklayıp **olumsuz yorumları** okuma (önce kötüye bakılır)
4. Hekimin yorumlara **nasıl yanıt verdiğine** bakma
5. Doktortakvimi/Doktorsitesi'nde **çapraz doğrulama**

Yani yıldız sayınızdan önce **olumsuz yoruma verdiğiniz yanıtın kalitesi** karar verdiriyor. BrightLocal verilerine göre kullanıcıların %88'i olumsuz yoruma profesyonel cevap veren işletmelere daha çok güveniyor.

## Doktor Yorumları Nerelerde Çıkar?

Türkiye'de bir hekim hakkında yorum yazılabilecek başlıca platformlar:

- **Google Business Profile** — en yüksek görünürlük, Local Pack için kritik
- **Doktortakvimi** — randevu sonrası otomatik yorum talebi gönderir
- **Doktorsitesi** — branş bazlı arama sonuçlarında yüksek görünüm
- **Eniyihekim, Sağlık Asistanı** — sektör dizinleri
- **Şikayetvar** — özellikle olumsuz deneyimler buraya da düşer
- **Sosyal medya** — Instagram yorumları, X (Twitter) bahsetmeleri, Facebook
- **Ekşi Sözlük** — markalı arama yapan herkes görür

Tek bir hekim için 5-6 farklı kanalı düzenli takip etmek elle yapıldığında haftada en az 2-3 saat alır. Bu yüzden çoklu kanalı tek panele toplayan [yorum yönetim araçları](/yorum-yonetim-araclari) hekim pratiğinde fark yaratır.

## KVKK ve 1219 Sayılı Kanun: Yanıt Verirken Sınırlar

Bu bölüm rehberin en önemli kısmı — diğer sektör yanıt şablonlarını **olduğu gibi sağlığa uygulamak yasal risk** doğurur.

### Hangi Veriler "Özel Nitelikli Kişisel Veri" Sayılır?

KVKK md. 6'ya göre sağlık verileri (tanı, tedavi, ilaç, prosedür, randevu, hatta hastane ziyaret bilgisi) **özel nitelikli kişisel veri**dir. Açık rıza olmadan işlenmesi, paylaşılması veya doğrulanması yasaktır.

Pratikte bu, Google yorumuna yanıt yazarken şu demek:

- ❌ "**Estetik burun ameliyatınız** sonrası yaşadıklarınız için üzgünüm" — yanıtta prosedürü doğruladınız, KVKK ihlali.
- ❌ "Geçen **Salı günkü randevunuzda** sorun yaşadığınız için üzgünüz" — randevu tarihini doğruladınız, KVKK ihlali.
- ❌ "**Diyabet tedavisi** sürecinde verdiğimiz reçeteden memnun kalmamanız üzücü" — tanı + tedaviyi doğruladınız, ciddi KVKK ihlali.
- ✅ "Geri bildiriminiz için teşekkür ederiz. Yaşadıklarınızı detaylı dinlemek isteriz; lütfen muayenehanemize 0XXX numarasından ulaşın."

Yorumda hasta zaten kendi tanısını yazmış olsa bile **siz teyit etmeyin**. Karşı taraf kendi sağlık verisini açıkladı diye sizin yanıtta tekrar etme yetkiniz oluşmaz.

### 1219 Sayılı Kanun: Hekimlik Reklam Yasağı

Tababet ve Şuabatı Sanatlarının Tarzı İcrasına Dair Kanun ile Sağlık Bakanlığı'nın yönetmelikleri hekimlerin **reklam yapmasını yasaklar**. Yorum yanıtınız da reklam unsuru taşıyamaz:

- ❌ "**Türkiye'nin en iyi** plastik cerrahı olarak..."
- ❌ "**%99 başarı oranıyla** yaptığımız operasyonlarda..."
- ❌ "**Önümüzdeki ay %20 indirimli** kontrol için bizi arayın"
- ✅ "Geri bildiriminizi paylaştığınız için teşekkür ederiz."

Yorum yanıtlarınız yalnızca **bilgilendirici ve nezaketen** olabilir; tanıtım, fiyat, indirim, karşılaştırma, üstünlük iddiası taşıyamaz.

### Tabip Odası ve Disiplin Riski

Türk Tabipler Birliği'nin disiplin yönetmeliği, "**reklam niteliği taşıyan davranışlar**" için para cezası ve geçici meslekten men gibi yaptırımlar öngörür. Sosyal medyada agresif yanıt, hasta bilgisi sızdıran cevap veya tanıtım amaçlı yorum yanıtı şikayet konusu olabilir.

## Yorum Yönetimi vs Yorum Sildirme — Dürüst Fark

İnternette "doktor yorumu sildirme servisi" diye gezen pek çok teklif yasal olarak **gerçek değildir**. Google, yorumun ancak Topluluk Kurallarını ihlal ettiği kanıtlanırsa siler — para karşılığı silme yetkisi hiçbir üçüncü tarafa devretmez.

| Yorum Yönetimi (yasal) | Yorum Sildirme Vaadi (riskli) |
|---|---|
| Tüm yorumları tek panele toplar | "Para karşılığı sildiririz" der |
| AI ile yanıt taslağı üretir | Sahte pozitif yorum üretir (yasak) |
| Sahte yorumu tespit edip Google'a şikayet sürecini kolaylaştırır | "Yorumları gizleriz" diye ücret alır |
| KVKK uyumlu yanıt akışı sunar | Hasta verisini izinsiz işleme riski |
| Yasal olarak tartışmasız | Tabip Odası ve KVKK'da risk |

**[VoyageRespond](/yorum-yonetim-araclari)** bir yorum **yönetim** aracıdır — silme servisi değildir. Sahte yorumu siz tespit edersiniz, biz Google'a şikayet sürecinde rehberlik ederiz; karar Google'a aittir.

## Olumsuz Yoruma Profesyonel Yanıt (5 Adım)

1. **24 saat içinde** yanıtlayın. Hızlı yanıt güveni artırır; sessizlik onaylama olarak okunur.
2. **Sakin kalın**, savunmacı dil kurmayın. "Siz yanlış anlamışsınız" türü cümleler durumu büyütür.
3. **Hissiyatı kabul edin**, olayı doğrulamadan. "Bu deneyim sizi üzdüyse üzgünüz."
4. **Offline'a taşıyın**. "Detaylı görüşmek için lütfen muayenehanemize 0XXX'dan ulaşın."
5. **Hiçbir sağlık bilgisini paylaşmayın**. Tanı, tedavi, randevu — hiçbiri yanıtta geçmesin.

### Yanıt Şablonu 1 — Bekleme Süresi Şikayeti

> Geri bildiriminiz için teşekkür ederiz. Kliniğimizde her hastamıza yeterli zaman ayırma önceliğimiz nedeniyle zaman zaman gecikmeler yaşanabiliyor; bu deneyim sizi üzdüğü için samimiyetle üzgünüz. İletişim akışımızı iyileştirmek üzere notunuzu ekibimize ilettik. Detaylı görüşmek için lütfen sekreterimize 0XXX XXX XX XX'den ulaşın.

### Yanıt Şablonu 2 — İletişim Şikayeti

> Yorumunuz için teşekkür ederiz. Hastalarımızla iletişimimiz bizim için çok önemli; yaşadığınız deneyim standardımızın altında ise bunu mutlaka duymak isteriz. Lütfen muayenehanemize 0XXX numarasından ulaşın, görüşme imkânımız olsun.

### Yanıt Şablonu 3 — Genel Memnuniyetsizlik

> Geri bildiriminizi paylaştığınız için teşekkür ederiz. Bizimle iletişime geçmenizi memnuniyetle bekliyoruz; iletişim bilgilerimiz: 0XXX. İyi günler dileriz.

### Yanıt Şablonu 4 — Olumlu Yorum

> Güzel sözleriniz için teşekkür ederiz. Sağlıklı günler dileriz.

Olumlu yorumlarda bile **kısalık** önemlidir — uzun, samimi, kişisel ayrıntılarla dolu yanıtlar 1219'un reklam yasağı kapsamına yaklaşır.

## Sahte Yorumla Mücadele

Bir hekimin başına gelebilecek en kötü senaryolardan biri **hiç görmediği bir hastadan** yorum almak — çoğunlukla rekabetçi bir mesai arkadaşı, eski bir çalışan ya da kişisel husumet kaynaklı.

Adım adım süreç:

1. **Kanıt toplayın**: hastane/randevu sisteminizde böyle bir hasta olmadığını gösteren ekran görüntüsü, hasta listesi.
2. **Google'a şikayet**: Google Business Profile → ilgili yorum → ⋮ → "Uygunsuz olarak işaretle" → Kategori: "Çıkar çatışması" veya "Yanıltıcı içerik".
3. **Form üzerinden eskalasyon**: 5-7 gün sonra hâlâ kaldırılmadıysa Google'ın resmi içerik kaldırma formunu doldurun; tabip odası kaydınızı, mesleki kimliğinizi ve kanıtınızı ekleyin.
4. **Hukuki yol**: Hakaret veya iftira içeriyorsa Sulh Ceza Hâkimliği'ne içerik kaldırma talebi (5651 sayılı kanun m.9), Cumhuriyet Savcılığı'na suç duyurusu. Bu süreç avukatla yürütülür.
5. **Yanıt boş bırakmayın**: Süreç devam ederken yorum altına nötr, profesyonel bir cevap yazın — "Sayın okuyucu, bu yorumun gerçekliği tarafımızca araştırılmaktadır. Klinik standartlarımız hakkında sorularınız için 0XXX." Bu, yorumu okuyan diğer potansiyel hastalara güven verir.

## Yapay Zeka ile Hekim Yorum Yönetimi

Bir hekim haftada 20-40 yoruma yanıt yazıyorsa bu **2-3 saatlik mesai** demek. AI destekli yorum yönetiminin değeri tam burada:

- **Duygu analizi**: Hangi yorum acil, hangisi standart — saniyede sınıflandırma
- **8 ton seçeneği**: Resmi, empatik, kısa — markaya uygun seçim
- **KVKK güvenli yanıt çerçevesi**: AI hasta verisi tekrar etmez, nötr kalır
- **Onay akışı**: AI taslak üretir, hekim 1 tıkla onaylar — taslak otomatik Google'a düşer
- **Çoklu kanal**: Google + Booking + Doktortakvimi tek panelden
- **Duygu trend raporu**: "Bu ay 'bekleme' kelimesi 7 yorumda geçti" gibi operasyonel ipuçları

VoyageRespond'un AI yanıt motoru, sağlık sektörünün regülasyon hassasiyetine göre **nötr, bilgilendirici ton**la çalışır. Reklam ifadesi, tanı doğrulaması ve hasta bilgisi tekrarı çıktıda yer almaz — siz onaylamadan hiçbir şey gönderilmez.

## Pratik Çıkarımlar

1. Doktor yorumları SEO için Local Pack'te kritik — yıldız sayısı kadar **yanıt oranı** da değerli.
2. Yanıtlarınızda **hiçbir sağlık bilgisini doğrulamayın** — KVKK md. 6 hassasiyeti her cümleyi gözden geçirin.
3. **Reklam yapmayın**, üstünlük iddiası kurmayın, indirim teklif etmeyin — 1219 ve TTB disiplin riski.
4. **Yorum sildirme servislerine güvenmeyin** — gerçek değiller, risk size kalır.
5. **Sahte yoruma resmi süreçle gidin**: Google form + 5651 m.9 + savcılık.
6. AI destekli yanıt akışı, hem KVKK'ya hem hekim mesaisine en uygun çözüm — taslak üretir, hekim onaylar.

## İlgili Rehberler

- [Sağlık Kuruluşları için Online İtibar Yönetimi](/saglik-itibar-yonetimi) — sektörel hub rehberi
- [Diş Hekimi & Diş Kliniği Yorum Yönetimi](/dis-hekimi-yorum-yonetimi) — branş özel rehber
- [Estetik Klinik Yorum Yönetimi](/estetik-klinik-yorum-yonetimi) — estetik & güzellik özel rehber
- [Sahte Sağlık Yorumu Nasıl Şikayet Edilir?](/blog/sahte-saglik-yorumu-sikayet) — Google + yasal yol
- [Yorum Yönetim Araçları Karşılaştırması](/yorum-yonetim-araclari) — Türkiye'deki platformlar
- [Google Yorumları için Yapay Zeka](/platform/google-yorumlari-icin-yapay-zeka) — AI yanıt motorunun çalışma şekli

## Sonuç

Doktor yorumları, modern hekimlik pratiğinin görünmez ama belirleyici bir parçası. KVKK ve 1219'un çizdiği sınırlar içinde profesyonel, hızlı ve nötr yanıt vermek **hem yasal riski sıfırlar hem Google Local Pack sıralamanızı yükseltir**. Bu süreci AI ile birleştirdiğinizde haftada kazanılan 2-3 saatlik mesai sizi asıl işinize — hastaya — döndürür.

**[VoyageRespond ile sağlık kuruluşunuzun yorum yönetimini KVKK uyumlu şekilde otomatikleştirin → /onboarding](/onboarding)**
    `,
  },
  {
    slug: "sahte-saglik-yorumu-sikayet",
    title: "Sahte Sağlık Yorumu Nasıl Şikayet Edilir? (Google + Yasal Yol)",
    metaTitle: "Sahte Sağlık Yorumu Şikayet: Google + Yasal Yol (2026)",
    metaDescription:
      "Sahte ya da haksız doktor / klinik yorumunu Google'a şikayet etme ve 5651 sayılı kanunla içerik kaldırma adımları. Hekimler ve sağlık kuruluşları için 2026 rehberi.",
    description:
      "Sahte sağlık yorumlarını Google'a şikayet etme adımları, 5651 sayılı kanun ile içerik kaldırma süreci ve haksız yorum karşısında profesyonel iletişim taktikleri.",
    ogTitle: "Sahte Sağlık Yorumu Şikayet | Google + Yasal Yol",
    ogDescription:
      "Doktor ve klinik yorumlarında sahte içeriği tespit, Google şikayeti, 5651 m.9 başvurusu — adım adım uygulanabilir rehber.",
    author: AUTHOR,
    publishedAt: "2026-06-16",
    updatedAt: UPDATED,
    category: "Sağlık & Klinik",
    readTime: "10 dk",
    keywords: [
      "sahte google yorum şikayet",
      "haksız doktor yorumu",
      "sahte klinik yorumu kaldırma",
      "5651 içerik kaldırma",
      "google yorum silme",
    ],
    faqs: [
      {
        question: "Sahte bir yorumu Google ne kadar sürede siler?",
        answer:
          "Google Topluluk Kurallarını açıkça ihlal eden yorumlar 24-72 saatte kaldırılabilir. Çıkar çatışması veya 'gerçek olmayan deneyim' iddiası gerektiren durumlarda süreç 5-15 gün sürebilir. Şikayetiniz reddedilirse Google'ın 'Yorum yönetim aracı' web formundan eskalasyon mümkündür.",
      },
      {
        question: "Para karşılığı yorum sildiren servisler güvenli mi?",
        answer:
          "Hayır. Google, yorumu yalnızca kendi politikalarına aykırı bulursa siler ve bu yetkiyi hiçbir üçüncü tarafa devretmez. 'Garantili silme' vaat eden servisler ya sahte pozitif yorum üreterek kuralları ihlal eder (Google ceza verir) ya da gerçek bir iş yapmadan ücret alır. VoyageRespond gibi yasal yorum yönetim araçları silmez — yönetir, raporlar ve resmi şikayet sürecinde rehberlik eder.",
      },
      {
        question: "5651 sayılı kanunla içerik kaldırma süreci nasıl işliyor?",
        answer:
          "5651 sayılı kanunun 9. maddesi uyarınca, içerik kişilik haklarınızı ihlal ediyorsa Sulh Ceza Hâkimliği'ne içerik kaldırma talebiyle başvurabilirsiniz. Hâkimlik 24 saat içinde karar verir, kabul edilirse Google içeriği 4 saat içinde kaldırmakla yükümlüdür. Süreç bir avukat aracılığıyla yürütülür ve ortalama 1-2 hafta sürer.",
      },
      {
        question: "Hakaret içeren bir yoruma savcılığa suç duyurusunda bulunabilir miyim?",
        answer:
          "Evet. TCK md. 125 (hakaret) ve md. 267 (iftira) kapsamında Cumhuriyet Savcılığı'na suç duyurusunda bulunabilirsiniz. Yorum sahibinin kimliği IP üzerinden tespit edilebilir; bu süreç savcılık talebiyle başlatılır ve ortalama 2-6 ay sürer.",
      },
    ],
    content: `
Sahte sağlık yorumu nasıl şikayet edilir? Bu rehberde haksız ya da gerçek olmayan bir doktor/klinik yorumunu **Google'a şikayet etme adımlarını**, başarılı olunmazsa **5651 sayılı kanunla içerik kaldırma yolunu** ve hakaret içeren yorumlar için **savcılık başvurusunu** adım adım göreceksiniz.

Önce dürüst bir uyarı: **VoyageRespond yorum sildirmez.** Hiçbir yorum yönetim aracı sildiremez, çünkü silme yetkisi yalnızca Google'da (ya da mahkemededir). Biz haksız yorumu tespit edip Google'a şikayet sürecinde rehberlik eder, **profesyonel cevap taslağı üreterek** yoruma yanıt vermenizi kolaylaştırırız.

## Hangi Yorum "Sahte" Sayılır?

Google'ın silme kriterleri kesindir:

- **Sahtelik** — hizmet almadığı halde yorum yazan kişi
- **Çıkar çatışması** — rakip işletme, eski çalışan, kişisel husumet
- **Spam** — bot, tekrar eden içerik, ilgisiz konu
- **Yanıltıcı içerik** — ürün/hizmeti yanlış tanıtan
- **Hakaret, küfür, taciz** — Topluluk Kurallarını ihlal eden dil
- **Kişisel bilgi paylaşımı** — telefon, adres, T.C. kimlik gibi veri sızdıran

"Memnun değildim, kalitesiz" gibi öznel ama kanıt gerektirmeyen olumsuz yorumlar **silinmez** — bunlara cevap yazarsınız. Silme yalnızca yukarıdaki kategorilerden birine girerse mümkün.

## Adım 1 — Google Business Profile Üzerinden Şikayet

En hızlı yoldur, ücretsizdir, ortalama 24-72 saatte sonuç verir:

1. business.google.com → hesabınıza giriş
2. "**Yorumlar**" sekmesi → ilgili yorumu bulun
3. Yorumun yanındaki **⋮** (üç nokta) → "**Uygunsuz olarak işaretle**"
4. Kategori seçin:
   - "**Çıkar çatışması**" — rakip/eski çalışan şüphesi varsa
   - "**Yanıltıcı içerik**" — hizmet almadığı belli ise
   - "**Spam**" — bot/tekrar/ilgisiz
   - "**Saldırgan içerik**" — küfür/hakaret/taciz
5. **Kanıtınızı hazırlayın**: randevu sisteminizden hastanın olmadığını gösteren ekran, rakip iş ilişkisi belgesi vb.

## Adım 2 — Google'ın Resmi İçerik Kaldırma Formu

İlk şikayet 5-7 gün içinde sonuçlanmadıysa eskalasyon zamanı:

1. Google "**Yasal Sorunlar Hakkında Bildirim**" formunu açın (Google'da "google legal removal request" arayın)
2. "**Google Haritalar**" / "**Google Business Profile**" kategorisini seçin
3. Sorun türü: "**Sahte içerik**" veya "**Kişisel saldırı**"
4. Yorumun **doğrudan URL'sini** ekleyin
5. **Kanıtınızı** PDF olarak yükleyin:
   - Mesleki kimlik (tabip odası kartı)
   - Hasta listesinde kişinin olmadığını gösteren resmi belge (varsa)
   - Yorum sahibinin çıkar çatışması kanıtı
6. **24-72 saatte e-posta** ile sonuç gelir

## Adım 3 — 5651 Sayılı Kanun ile Yasal İçerik Kaldırma

Google reddederse veya sonuç beklenenden yavaş gelirse hukuki yol açıktır:

- **Yasal dayanak**: 5651 sayılı kanun m.9 — kişilik hakkı ihlali için içerik kaldırma talebi
- **Yetkili merci**: Sulh Ceza Hâkimliği
- **Karar süresi**: 24 saat içinde
- **Google'ın uyma süresi**: Karar tebliğinden sonra 4 saat
- **Pratik süreç**: Avukatla başvuru → ortalama 1-2 hafta toplam süre
- **Maliyet**: Avukatlık ücreti (genelde sabit fiyat çalışan ofisler var)

**5651 m.8/A** ise içerik suç teşkil ediyorsa (intihara yönlendirme, çocuk istismarı vb.) uygulanır — sağlık yorumları için genelde m.9 kullanılır.

## Adım 4 — Hakaret/İftira İçeriyorsa Savcılık

TCK md. 125 (hakaret) ve TCK md. 267 (iftira) kapsamında:

- **Cumhuriyet Savcılığı**'na **şikayet dilekçesi**
- Kimliği belirsiz hesap için savcılık **IP sorgusu** başlatır
- Yorum sahibi tespit edilirse **kamu davası** açılabilir
- Bu süreç 2-6 ay sürer; **tazminat davası** ayrıca medeni mahkemede açılır

Pratikte savcılık yolu, yorum kaldırmaktan çok **caydırıcı etki** içindir.

## Sahte Yorumla Mücadelede Yapılmaması Gerekenler

- ❌ **Sahte pozitif yorum sipariş etmek** — Google tespit edip işletmenize ceza verir; profil askıya alınabilir.
- ❌ **Yorum sahibine agresif yanıt yazmak** — durumu büyütür, ekran görüntüsü sosyal medyaya düşer.
- ❌ **"Sildiririm" diyen servislere para vermek** — hem yasal değil hem sonuç vermez.
- ❌ **Hasta bilgisi paylaşarak savunmaya geçmek** — KVKK md. 6 ihlali; cezası 1 milyon TL'ye kadar.
- ❌ **Yoruma cevap vermeden beklemek** — şikayet süreci 1-2 hafta sürer, bu sürede yorum diğer hastalar tarafından okunur.

## Süreç Boyunca Profesyonel Yanıt Yazın

Şikayet sonucu beklerken yoruma **nötr, kısa, profesyonel** bir cevap mutlaka yazın. Bu cevap, yorumu okuyan **diğer potansiyel hastalara** sizin profesyonel duruşunuzu gösterir:

> Sayın okuyucu, bu yorumun gerçekliği hakkında detaylı inceleme başlatılmıştır. Klinik standartlarımız ve hizmetlerimiz hakkında sorularınız için 0XXX numarasından bize ulaşabilirsiniz. Sağlıklı günler dileriz.

Bu cevap KVKK uyumludur (hiçbir sağlık bilgisi yok), 1219 uyumludur (reklam yok), defansif değildir, ve sürecin devam ettiğini şeffafça belirtir.

## VoyageRespond'un Bu Süreçteki Rolü

VoyageRespond bir **yorum yönetim** aracıdır — yorum silmez. Sahte yorum mücadelesinde size şu yolları açar:

- **Tek panelde yorum takibi**: Google, Booking, TripAdvisor, Hotels.com — yeni gelen yorum saniyeler içinde sizde
- **Duygu analizi**: 1 yıldızlı yorumu otomatik öncelikli liste tepesine taşır
- **AI yanıt taslağı**: Yukarıdaki gibi KVKK uyumlu, nötr şablon saniyeler içinde
- **Onay akışı**: Siz onaylarsanız Google'a otomatik post — manuel yazma süresi sıfır
- **Çoklu lokasyon**: Şubeleriniz varsa tek panelden hepsi
- **Email ile Review Request (Beta)**: Memnun hastalardan organik yorum talebi — sahte yorum kötü etkisini gerçek pozitif yorumla dengelemenin en yasal yolu

## Pratik Çıkarımlar

1. Önce **Google Business Profile** üzerinden uygunsuz olarak işaretleyin (24-72 saat)
2. Sonuç yoksa **Google Legal Removal** formunu doldurun (kanıt ekli)
3. Reddedilirse **5651 m.9** ile Sulh Ceza Hâkimliği'ne avukat aracılığıyla başvurun (1-2 hafta)
4. Hakaret varsa **TCK 125/267** kapsamında savcılığa suç duyurusu (caydırıcı etki)
5. Süreç boyunca yoruma **nötr, KVKK uyumlu cevap** yazın
6. "**Sildiririm**" diyen üçüncü tarafa para vermeyin — sonuç vermez, risk size kalır

## İlgili Rehberler

- [Sağlık Kuruluşları için Online İtibar Yönetimi](/saglik-itibar-yonetimi)
- [Doktor Yorumları Nasıl Yönetilir?](/blog/doktor-yorumlari-nasil-yonetilir)
- [Diş Hekimi Yorum Yönetimi](/dis-hekimi-yorum-yonetimi)
- [Yorum Yönetim Araçları Karşılaştırması](/yorum-yonetim-araclari)
- [Google Yorumları için Yapay Zeka](/platform/google-yorumlari-icin-yapay-zeka)

**[VoyageRespond ile yorumlarınızı KVKK uyumlu, profesyonel şekilde yönetin → /onboarding](/onboarding)**
    `,
  },
];