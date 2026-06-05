import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

createRoot(document.getElementById("root")!).render(<App />);

// Signal to puppeteer prerenderer that the app has mounted and Helmet has committed.
// Delay a tick so react-helmet-async effects flush before the headless browser snapshots.
if (typeof window !== "undefined") {
  const markReady = () => {
    setTimeout(() => {
      document.documentElement.setAttribute("data-prerender-ready", "1");
    }, 300);
  };
  const ric = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));
  ric(markReady);
}
