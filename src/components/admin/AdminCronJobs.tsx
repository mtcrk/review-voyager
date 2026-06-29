import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Play, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  command: string;
  active: boolean;
}

interface TriggerResult {
  ok: boolean;
  status: number;
  duration_ms: number;
  response: any;
}

// Map cron jobs to the edge function name we should manually trigger
const FUNCTION_MAP: Record<string, { fn: string; query?: string; label: string }> = {
  "google-reviews-auto-sync": { fn: "google-business-reviews", label: "Google Yorumları Çek" },
  "auto-fetch-apify-only-daily-06": {
    fn: "auto-fetch-reviews",
    query: "platforms=tripadvisor,hotelscom,expedia,trustpilot",
    label: "OTA Yorumları Çek",
  },
  "auto-fetch-booking-daily-03": {
    fn: "auto-fetch-reviews",
    query: "platforms=booking",
    label: "Booking.com Yorumları Çek",
  },
  "weekly-report-daily-tr-11": { fn: "weekly-report", label: "Haftalık Rapor Gönder" },
};

// Translate cron expression to Turkish
function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return expr;
  const [min, hour, dom, mon, dow] = parts;

  // every N minutes
  if (min.startsWith("*/") && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
    return `Her ${min.slice(2)} dakikada bir`;
  }
  // every N hours
  if (min === "0" && hour.startsWith("*/") && dom === "*" && mon === "*" && dow === "*") {
    return `Her ${hour.slice(2)} saatte bir`;
  }
  // daily at HH:MM (UTC)
  if (min !== "*" && hour !== "*" && !hour.includes("*") && dom === "*" && mon === "*" && dow === "*") {
    const h = parseInt(hour, 10);
    const m = parseInt(min, 10);
    // Convert UTC -> Turkey (UTC+3)
    const trH = (h + 3) % 24;
    return `Her gün TSİ ${String(trH).padStart(2, "0")}:${String(m).padStart(2, "0")} (UTC ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")})`;
  }
  return expr;
}

export function AdminCronJobs() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Record<string, TriggerResult>>({});

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ jobs: CronJob[] }>(
        "admin-cron-jobs?action=list",
        { method: "GET" }
      );
      if (error) throw error;
      setJobs(data?.jobs ?? []);
    } catch (e: any) {
      toast({ title: "Hata", description: e?.message ?? "Cron jobs alınamadı", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const triggerJob = async (jobname: string) => {
    const map = FUNCTION_MAP[jobname];
    if (!map) {
      toast({
        title: "Tetiklenemiyor",
        description: "Bu cron için manuel tetikleme tanımlanmamış.",
        variant: "destructive",
      });
      return;
    }
    setTriggering(jobname);
    try {
      const { data, error } = await supabase.functions.invoke<TriggerResult>(
        "admin-cron-jobs?action=trigger",
        {
          method: "POST",
          body: { function_name: map.fn, query_string: map.query ?? "" },
        }
      );
      if (error) throw error;
      setLastResult((prev) => ({ ...prev, [jobname]: data! }));
      toast({
        title: data?.ok ? "Tetiklendi ✓" : "Hata",
        description: `${map.label} — ${data?.duration_ms}ms (HTTP ${data?.status})`,
        variant: data?.ok ? "default" : "destructive",
      });
    } catch (e: any) {
      toast({ title: "Tetiklenemedi", description: e?.message, variant: "destructive" });
    } finally {
      setTriggering(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zamanlanmış İşler ({jobs.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Otomatik çalışan tüm cron joblar. Manuel tetikleme için ▶ butonuna bas.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Adı</TableHead>
                <TableHead>Zamanlama</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Manuel Çağrı</TableHead>
                <TableHead className="text-right">Tetikle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const map = FUNCTION_MAP[job.jobname];
                const result = lastResult[job.jobname];
                return (
                  <TableRow key={job.jobid}>
                    <TableCell>
                      <div className="font-medium">{job.jobname}</div>
                      {map && (
                        <div className="text-xs text-muted-foreground">→ {map.fn}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{describeCron(job.schedule)}</div>
                      <div className="text-xs text-muted-foreground font-mono">{job.schedule}</div>
                    </TableCell>
                    <TableCell>
                      {job.active ? (
                        <Badge variant="secondary">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {result ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          {result.ok ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span>HTTP {result.status} • {result.duration_ms}ms</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {map ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerJob(job.jobname)}
                          disabled={triggering === job.jobname}
                        >
                          {triggering === job.jobname ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Play className="h-3.5 w-3.5 mr-1" />
                          )}
                          Çalıştır
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Cron job bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
