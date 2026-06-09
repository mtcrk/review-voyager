import { jsx } from "react/jsx-runtime";
import { useLocation, NavLink } from "react-router-dom";
import { y as cn } from "../main.mjs";
const tabs = [
  { label: "Rakip Seçimi", to: "/intelligence" },
  { label: "Karşılaştırma", to: "/intelligence/karsilastirma" }
];
function IntelligenceTabs() {
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-1 p-1 rounded-lg bg-muted/60 border", children: tabs.map((t) => {
    const active = pathname === t.to;
    return /* @__PURE__ */ jsx(
      NavLink,
      {
        to: t.to,
        className: cn(
          "px-3 py-1.5 text-sm rounded-md transition-colors",
          active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        ),
        children: t.label
      },
      t.to
    );
  }) });
}
export {
  IntelligenceTabs as I
};
