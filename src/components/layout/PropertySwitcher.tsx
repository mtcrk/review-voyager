import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusiness } from "@/contexts/BusinessContext";

/** Grup / çoklu tesis kullanıcıları için üst bar tesis seçici. Tek tesiste hiç görünmez. */
export function PropertySwitcher() {
  const { businesses, activeBusiness, setActiveBusiness } = useBusiness();

  if (businesses.length < 2) return null;

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={activeBusiness?.id ?? undefined}
        onValueChange={(id) => {
          const biz = businesses.find((b) => b.id === id);
          if (biz) setActiveBusiness(biz);
        }}
      >
        <SelectTrigger className="h-9 w-[220px] sm:w-[280px] text-sm">
          <SelectValue placeholder="Tesis seçin" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
