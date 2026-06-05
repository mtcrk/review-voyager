/**
 * Post-build prerender: serves dist/ with `vite preview`, then visits each
 * public route with puppeteer and writes the resulting HTML to disk.
 *
 * Non-fatal: if puppeteer fails to launch (e.g. Chromium not available),
 * the script logs a warning and exits 0 so the SPA build still ships.
 */
import { spawn } from "child_process";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import waitOn from "wait-on";
import { getAllPrerenderRoutes } from "./routes.mjs";

const PORT = 4173;
const ORIGIN = `http://localhost:${PORT}`;
const DIST = resolve("dist");
const CONCURRENCY = 4;
const ROUTE_TIMEOUT_MS = 25_000;
const READY_EXTRA_MS = 400;

if (!existsSync(DIST)) {
  console.error("[prerender] dist/ not found — skipping");
  process.exit(0);
}

let puppeteer;
try {
  ({ default: puppeteer } = await import("puppeteer"));
} catch (e) {
  console.warn("[prerender] puppeteer import failed, skipping prerender:", e.message);
  process.exit(0);
}

const routes = getAllPrerenderRoutes({ includeEn: true });
routes.push("/__prerender_404__"); // for 404.html
console.log(`[prerender] ${routes.length} routes to render`);

// Start vite preview
const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production" },
});
preview.stdout.on("data", () => {});
preview.stderr.on("data", (d) => process.stderr.write(`[preview] ${d}`));

const cleanup = () => {
  try { preview.kill("SIGTERM"); } catch {}
};
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

try {
  await waitOn({ resources: [`tcp:${PORT}`], timeout: 30_000 });
} catch (e) {
  console.error("[prerender] vite preview never came up:", e.message);
  cleanup();
  process.exit(0);
}

let browser;
try {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
} catch (e) {
  console.warn("[prerender] puppeteer launch failed, skipping prerender:", e.message);
  cleanup();
  process.exit(0);
}

const writeRouteHtml = (routePath, html) => {
  let outPath;
  if (routePath === "/__prerender_404__") {
    outPath = join(DIST, "404.html");
  } else if (routePath === "/" || routePath === "/en") {
    outPath = join(DIST, routePath === "/" ? "index.html" : "en/index.html");
  } else {
    outPath = join(DIST, routePath.replace(/^\//, ""), "index.html");
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf-8");
};

async function renderOne(routePath) {
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      // Block analytics + third-party telemetry to speed up render
      if (
        url.includes("google-analytics") ||
        url.includes("googletagmanager") ||
        url.includes("doubleclick") ||
        url.includes("hotjar")
      ) {
        return req.abort();
      }
      req.continue();
    });

    const target = `${ORIGIN}${routePath === "/__prerender_404__" ? "/__prerender_404__" : routePath}`;
    await page.goto(target, { waitUntil: "networkidle0", timeout: ROUTE_TIMEOUT_MS });
    // Wait for the SPA to signal it has mounted (set in src/main.tsx).
    await page
      .waitForFunction(() => document.documentElement.dataset.prerenderReady === "1", {
        timeout: 10_000,
      })
      .catch(() => {});
    // react-helmet-async batches DOM mutations via requestAnimationFrame.
    // Headless tabs that are idle / backgrounded throttle rAF, so we explicitly
    // pump several frames before snapshotting so <title>/<meta>/JSON-LD commit.
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          let frames = 0;
          const pump = () => {
            if (++frames >= 8) resolve(undefined);
            else requestAnimationFrame(pump);
          };
          requestAnimationFrame(pump);
        }),
    );
    await new Promise((r) => setTimeout(r, READY_EXTRA_MS));

    // Inline Helmet head mutations are already in document.head at this point.
    const html = await page.content();
    writeRouteHtml(routePath, html);
    return { routePath, ok: true };
  } catch (e) {
    return { routePath, ok: false, err: e.message };
  } finally {
    await page.close().catch(() => {});
  }
}

const queue = [...routes];
const results = [];
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const r = queue.shift();
    const res = await renderOne(r);
    results.push(res);
    const pct = Math.round((results.length / routes.length) * 100);
    if (res.ok) console.log(`[prerender] ${pct}% ✓ ${res.routePath}`);
    else console.warn(`[prerender] ${pct}% ✗ ${res.routePath} — ${res.err}`);
  }
});
await Promise.all(workers);

await browser.close();
cleanup();

const ok = results.filter((r) => r.ok).length;
const fail = results.length - ok;
console.log(`[prerender] done: ${ok} ok, ${fail} failed`);
process.exit(0);