import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Rakip Seçimi", to: "/intelligence" },
  { label: "Karşılaştırma", to: "/intelligence/karsilastirma" },
];

export function IntelligenceTabs() {
  const { pathname } = useLocation();
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/60 border">
      {tabs.map((t) => {
        const active = pathname === t.to;
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </NavLink>
        );
      })}
    </div>
  );
}