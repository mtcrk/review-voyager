import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Beaker } from "lucide-react";
import { TIKTOK_CONFIG } from "@/lib/tiktokConfig";

interface TikTokDemoModeToggleProps {
  isDemoMode: boolean;
  onToggle: () => void;
}

export function TikTokDemoModeToggle({ isDemoMode, onToggle }: TikTokDemoModeToggleProps) {
  if (!TIKTOK_CONFIG.canUseDemo) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
      <Beaker className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="demo-mode" className="text-sm cursor-pointer flex items-center gap-2">
        Demo Mod
        {isDemoMode && (
          <Badge variant="secondary" className="text-xs">Aktif</Badge>
        )}
      </Label>
      <Switch
        id="demo-mode"
        checked={isDemoMode}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
