import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

createRoot(document.getElementById("root")!).render(<App />);

// Signal to puppeteer prerenderer that the app has mounted.
const markReady = () => {
  document.documentElement.setAttribute("data-prerender-ready", "1");
};
if (typeof window !== "undefined") {
  const ric = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 200));
  ric(markReady);
}
