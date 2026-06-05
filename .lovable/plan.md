
# Build-Time Prerender Planı (Vite SPA → Statik HTML kabukları)

## Sorun
78 public URL aynı `index.html` kabuğunu döndürüyor. JS execute etmeyen tüm crawler'lar (LinkedIn, WhatsApp, Slack/Facebook OG, GPTBot, ClaudeBot, PerplexityBot, CCBot, Bing, Yandex) her sayfayı identik görüyor. Sosyal paylaşımlar generic, AI cevapları boş.

## Karar: Hangi prerender çözümü?

Üç gerçek aday var; her birinin trade-off'u var:

### A) **Puppeteer post-build (önerilen)** — `@prerenderer/rollup-plugin` veya custom `vite preview + puppeteer` script
- **Artı**: Mevcut React Router, contexts, lazy import, react-helmet-async, AEOSection — **hiçbir koda dokunulmaz**. Build edilmiş gerçek SPA bir headless Chrome'da render edilir, sonuç HTML diske yazılır. SSR uyumsuzluğu yok (window/localStorage problemleri yok).
- **Eksi**: Chromium indirir (~150 MB build cache). 90 sayfa için ~3-4 dk build süresi. Lovable build ortamında puppeteer-core + @sparticuz/chromium veya `puppeteer` paketi ile çalışır.
- **Risk**: Build ortamı Chromium'a izin vermezse fallback gerekir.

### B) **vite-react-ssg** (SSR-based SSG)
- **Artı**: Build hızlı (~1 dk), Chromium yok, native React SSR.
- **Eksi**: `BrowserRouter` → onların `ViteReactSSG` entry'sine geçiş gerekiyor. `AuthProvider`, `BusinessProvider`, `supabase client` import zinciri **server tarafında çalıştırılınca** her `window`, `localStorage`, `document` referansı patlar. `react-helmet-async` zaten desteklenir ama her public route component'ini SSR-safe hale getirmek (typeof window guard'ları, dinamik import'lar) ciddi audit demek. Senin "mevcut routing yapısını bozma" kısıtınla çelişiyor.

### C) **react-snap** — eskimiş, puppeteer'ın eski versiyonuna kilitli, bakımsız. Eliyoruz.

**Öneri: A (Puppeteer post-build).** Kısıtlarına (routing'i bozma, SEO/AEOSection kalsın, build < 5 dk) tam uyuyor. Implementation custom script olacak — third-party plugin'lerin çoğu Vite 5 ile sorunlu.

## Mimari

```text
npm run build
  ├── vite build                    (mevcut, değişmiyor)
  ├── node scripts/prerender.mjs    (yeni)
  │     ├── vite preview --port 4173 (background)
  │     ├── puppeteer.launch()
  │     ├── her ROUTE için:
  │     │     page.goto(http://localhost:4173/route)
  │     │     waitForSelector('[data-prerender-ready]') veya networkidle
  │     │     html = await page.content()
  │     │     dist/route/index.html yaz
  │     └── teardown
  └── done
```

### Prerender edilecek route'lar (whitelist, kod içine gömülü)

Public + SEO ağırlıklı, auth gerektirmeyen:
- `/`, `/about`, `/contact`, `/demo`, `/pricing`, `/blog`, `/hub`
- `/google-yorum-cevap-ornekleri`, `/restoran-yorum-cevaplari`, `/otel-yorum-cevaplari`, `/yorum-yonetim-araclari`, `/online-itibar-yonetimi`, `/musteri-memnuniyeti`, `/restoran-musteri-memnuniyeti`
- `/platform/:slug` — `platformLandingData.ts`'den enumerate
- `/otel-yorum-yonetimi/:sehir` — `cityHotelData.ts`'den enumerate
- `/blog/:slug` — 3 blog cluster dosyasından enumerate (sitemap script'iyle aynı kaynak)
- `/automations/*`, `/privacy-policy`, `/terms-of-service`, `/login`, `/register`, `/forgot-password`, `/onboarding`
- `/en/*` mirror — Turkish set'in tamamı + `/en` prefix

### Prerender edilmeyecekler (mevcut SPA kalır, dist'e yazılmaz)
- `/dashboard`, `/reviews`, `/reviews/:id`, `/inbox`, `/auto-reply`, `/statistics`, `/report`, `/chat`, `/settings`, `/email`, `/performance`, `/rep-score`, `/google-accounts`, `/intelligence`, `/intelligence/karsilastirma`, `/locations`, `/locations/*`, `/youtube`, `/social-analytics`, `/tiktok-*`, `/channels/*`, `/auth/*`, `/admin/*`, `/share/:businessSlug`, `/story-kit`

Bunlara hit gelirse Cloudflare Pages mevcut SPA fallback'i (`/index.html`) yine devreye girer, davranış değişmez.

## Kod değişiklikleri (minimum)

1. **`package.json`** — `puppeteer` (devDependency), `wait-on` (vite preview hazır mı diye bekler).
   `"build": "vite build && node scripts/prerender.mjs"`.
2. **`scripts/prerender.mjs`** (yeni) — yukarıdaki akış. Route listesi sitemap script'inin enumerate fonksiyonlarını paylaşır (refactor: shared `scripts/routes.mjs`).
3. **`src/main.tsx`** (1 satır) — root render bittikten sonra `requestIdleCallback` içinde `document.documentElement.setAttribute('data-prerender-ready','1')`. Puppeteer bu attribute'u bekler. Production'da zararsız.
4. **`src/components/seo/SEO.tsx`** — değişiklik yok; `react-helmet-async` Helmet tag'larını DOM'a basıyor, `page.content()` bunları yakalar.
5. **`src/components/seo/AEOSection.tsx`** — değişiklik yok; JSON-LD `dangerouslySetInnerHTML` ile basılıyor, DOM'a düşüyor, prerender yakalar.
6. **Cloudflare Pages** — deploy adımı **değişmez**. `dist/` upload edilir. Statik HTML'ler önce sunulur, kalan path'ler `index.html` SPA fallback'ine düşer (mevcut davranış).
7. **404 / soft 404** — `dist/404.html` üretilir (puppeteer rastgele `/__nope` URL'sine gider, NotFound DOM yakalanır). Cloudflare Pages bunu otomatik kullanır.

## Doğrulama (Faz 3)

```bash
npm run build
npx serve dist
curl -s http://localhost:3000/otel-yorum-yonetimi/istanbul | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/blog/google-yorumlarim-nasil-yonetilir | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/platform/booking-yorumlari-icin-yapay-zeka | grep -o 'application/ld+json'
```

Her sayfa: unique `<title>`, unique `description`, canonical, og:*, FAQPage / Article JSON-LD HTML'de gömülü olmalı.

## Riskler ve açık sorular

1. **Puppeteer Lovable build ortamında çalışır mı?** Çalışmazsa fallback: `playwright` veya `vite-plugin-prerender-spa` (aynı puppeteer'a sarıyor ama plugin formatında).
2. **Build süresi**: Tek Chrome instance, route başına ~1-1.5sn paralel 4 tab → ~3 dk tahminim. Kısıt 5 dk, marjda.
3. **Auth context'ler public sayfalarda mount oluyor mu?** `App.tsx`'te AuthProvider/BusinessProvider en üstte; mount edilirler, supabase session probe yapar (network), prerender bunu bekler. `waitForFunction(() => document.documentElement.dataset.prerenderReady)` ile çözeriz — render bittikten sonra flag basarız, session geç gelse bile public içerik DOM'da hazır.
4. **Dinamik içerik (counter, demo verileri)** prerender anında "0" olarak HTML'e düşer. SEO için sorun değil, kullanıcı JS yüklenince güncel değer görür. AI Visibility Score için bu kabul edilebilir.
5. **Süre/cost**: Lovable build dakika kotası varsa kullanıcıya bildirilmeli.

## Fazlar

1. **Faz 1** — `puppeteer` + `wait-on` ekle, `scripts/prerender.mjs` yaz, `scripts/routes.mjs` shared module çıkar, `main.tsx`'e ready flag ekle, `package.json` build script güncelle.
2. **Faz 2** — Doğrulama: lokalde `npm run build`, `dist/` içinde `otel-yorum-yonetimi/istanbul/index.html` gibi dosyalar var mı kontrol, içlerinde unique title/meta/JSON-LD var mı `grep`'le.
3. **Faz 3** — Deploy (publish), production'da curl ile final doğrulama.
4. **Faz 4** — Build süresi > 5 dk çıkarsa: route concurrency artır, gereksiz network request'leri (Google Analytics, supabase ping) prerender sırasında abort et (`page.setRequestInterception`).

## Onay sonrası başlangıç noktası

İstersen "evet, devam et" yaz; ben Faz 1'i tek seferde uygulayıp lokal doğrulamayı yapayım.
