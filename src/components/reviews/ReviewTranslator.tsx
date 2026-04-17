import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

interface ReviewTranslatorProps {
  text: string;
}

export const ReviewTranslator = ({ text }: ReviewTranslatorProps) => {
  const [target, setTarget] = useState("tr");
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    setTranslated(null);
    try {
      const { data, error } = await supabase.functions.invoke("translate-text", {
        body: { text, target },
      });
      if (error) throw error;
      if (!data?.translated) throw new Error("empty translation");
      setTranslated(data.translated);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Çeviri başarısız",
        description: "Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end w-full">
      <div className="flex items-center gap-2">
        <Select value={target} onValueChange={(v) => { setTarget(v); setTranslated(null); }}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code} className="text-xs">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          <span className="ml-1">Çevir</span>
        </Button>
      </div>
      {translated && (
        <div className="w-full rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground leading-relaxed">
          {translated}
        </div>
      )}
    </div>
  );
};
