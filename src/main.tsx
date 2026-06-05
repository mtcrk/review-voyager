import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

createRoot(document.getElementById("root")!).render(<App />);

// Signal to puppeteer prerenderer that the app has mounted.
// The prerenderer still waits a fixed READY_EXTRA_MS after this flag flips so
// react-helmet-async effects (title, meta, JSON-LD) commit to the DOM.
if (typeof window !== "undefined") {
  const markReady = () => {
    document.documentElement.setAttribute("data-prerender-ready", "1");
  };
  const ric = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 50));
  ric(markReady);
}
