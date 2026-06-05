import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

createRoot(document.getElementById("root")!).render(<App />);

// Signal to puppeteer prerenderer that the app has mounted, the lazy route chunk
// has resolved, AND react-helmet-async has finished mutating <title>/<meta>.
// Strategy: watch the document <head> for mutations; once it has been quiet for
// 500ms, declare the page ready for snapshotting.
if (typeof window !== "undefined") {
  let timer: number | undefined;
  const QUIET_MS = 500;
  const MAX_MS = 8000;
  const start = Date.now();

  const markReady = () => {
    obs.disconnect();
    document.documentElement.setAttribute("data-prerender-ready", "1");
  };

  const schedule = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (Date.now() - start > MAX_MS) return markReady();
      markReady();
    }, QUIET_MS);
  };

  const obs = new MutationObserver(schedule);
  obs.observe(document.head, { childList: true, subtree: true, characterData: true });

  // Kick off the initial timer in case nothing mutates after mount.
  schedule();

  // Hard ceiling: never wait longer than MAX_MS.
  window.setTimeout(markReady, MAX_MS);
}
