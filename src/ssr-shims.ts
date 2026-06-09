// Must be imported FIRST in src/main.tsx so SSR builds don't crash when
// modules touch `window`/`localStorage` at import time (e.g. supabase client).
if (typeof globalThis.window === "undefined") {
  const noopStorage: Storage = {
    length: 0,
    clear: () => {},
    getItem: () => null,
    key: () => null,
    removeItem: () => {},
    setItem: () => {},
  };
  (globalThis as any).window = globalThis;
  (globalThis as any).localStorage = noopStorage;
  (globalThis as any).sessionStorage = noopStorage;
  (globalThis as any).document = (globalThis as any).document ?? {
    cookie: "",
    documentElement: { dataset: {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} } },
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
  };
  (globalThis as any).navigator = (globalThis as any).navigator ?? { userAgent: "ssr", language: "tr-TR", languages: ["tr-TR"] };
  (globalThis as any).location = (globalThis as any).location ?? { href: "", origin: "", pathname: "/", search: "", hash: "" };
  (globalThis as any).matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} });
}
export {};
