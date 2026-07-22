import { useEffect, useState } from "react";
import { AlertTriangle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserWarning {
  id: string;
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
}

export function UserWarningBanner() {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchWarnings() {
      const { data, error } = await supabase
        .from("user_warnings")
        .select("id, type, title, message, action_url, action_label")
        .eq("dismissed", false)
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (error) {
        console.error("Failed to fetch user warnings:", error);
        setLoading(false);
        return;
      }
      const typed = (data || []).map((w: any) => ({
        id: w.id,
        type: w.type as "info" | "warning" | "error",
        title: w.title,
        message: w.message,
        action_url: w.action_url,
        action_label: w.action_label,
      }));
      setWarnings(typed);
      setLoading(false);
    }

    fetchWarnings();

    return () => {
      isMounted = false;
    };
  }, []);

  const dismissWarning = async (id: string) => {
    const { error } = await supabase
      .from("user_warnings")
      .update({ dismissed: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to dismiss warning:", error);
      return;
    }

    setWarnings((prev) => prev.filter((w) => w.id !== id));
  };

  if (loading || warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((warning) => (
        <div
          key={warning.id}
          className="bg-primary/10 border-b border-primary/20 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {warning.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {warning.message}
              </p>
              {warning.action_url && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-1 text-primary"
                  onClick={() => navigate(warning.action_url!)}
                >
                  {warning.action_label || "Git"}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            <button
              onClick={() => dismissWarning(warning.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
