import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewTranslatorProps {
  text: string;
}

// Quick heuristic: if text already looks Turkish, skip translation.
const looksTurkish = (s: string) => {
  if (/[çğıöşüÇĞİÖŞÜ]/.test(s)) return true;
  const turkishWords = /\b(ve|bir|çok|için|ama|değil|var|yok|teşekkür|güzel|kötü|otel|oda|hizmet|personel|kahvaltı)\b/i;
  return turkishWords.test(s);
};

export const ReviewTranslator = ({ text }: ReviewTranslatorProps) => {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setTranslated(null);
    setError(false);
    if (!text || looksTurkish(text)) return;

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke("translate-text", {
          body: { text, target: "tr" },
        });
        if (cancelled) return;
        if (invokeError || !data?.translated) {
          setError(true);
        } else {
          setTranslated(data.translated);
        }
      } catch (e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!text || looksTurkish(text)) return null;

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Türkçeye çevriliyor...
      </div>
    );
  }

  if (error || !translated) return null;

  return (
    <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
      <span className="font-medium text-primary">[Çeviri] </span>
      {translated}
    </p>
  );
};
