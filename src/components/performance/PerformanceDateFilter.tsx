import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";

const DEFAULT_PRESETS = [
  { label: "7 Gün", days: 7 },
  { label: "30 Gün", days: 30 },
  { label: "90 Gün", days: 90 },
  { label: "6 Ay", days: 180 },
];

interface Props {
  range: { from: Date; to: Date };
  onRangeChange: (range: { from: Date; to: Date }) => void;
  presets?: { label: string; days: number }[];
}

export function PerformanceDateFilter({ range, onRangeChange, presets: presetsProp }: Props) {
  const PRESETS = presetsProp ?? DEFAULT_PRESETS;
  const activeDays = Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));


  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.days}
          variant={activeDays === preset.days ? "default" : "outline"}
          size="sm"
          className={activeDays === preset.days ? "bg-[#6C50FF] hover:bg-[#5A42E0]" : ""}
          onClick={() => onRangeChange({ from: subDays(new Date(), preset.days), to: new Date() })}
        >
          {preset.label}
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {format(range.from, "dd MMM", { locale: tr })} – {format(range.to, "dd MMM yyyy", { locale: tr })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: range.from, to: range.to }}
            onSelect={(r) => {
              if (r?.from && r?.to) onRangeChange({ from: r.from, to: r.to });
              else if (r?.from) onRangeChange({ from: r.from, to: r.from });
            }}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
            locale={tr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
