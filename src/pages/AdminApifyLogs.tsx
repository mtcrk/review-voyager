import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Mail, MailX } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ADMIN_EMAIL = "metecorukbasari@gmail.com";

interface ApifyLog {
  id: string;
  created_at: string;
  business_id: string;
  business_name: string;
  business_city: string | null;
  platform: string;
  status: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  skip_reason: string | null;
  last_run_at: string | null;
  error_message: string | null;
  admin_email_sent: boolean;
  admin_email_to: string | null;
}

interface OverviewResp {
  window_days: number;
  admin_email: string;
  totals: {
    total_runs: number;
    success: number;
    skipped: number;
    failed: number;
    total_inserted: number;
    total_updated: number;
    total_fetched: number;
  };
  by_platform: Record<string, { runs: number; inserted: number; updated: number; skipped_runs: number }>;
  by_business: Array<{ business_id: string; name: string; runs: number; inserted: number; updated: number }>;
  logs: ApifyLog[];
}

export default function AdminApifyLogs() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OverviewResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("7");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resp, error } = await supabase.functions.invoke<OverviewResp>(
        `admin-apify-overview?days=${days}`,
        { method: "GET" }
      );
      if (error) throw error;
      setData(resp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, days]);

  const filteredLogs = useMemo(() => {
    if (!data) return [];
    return data.logs.filter((l) => {
      if (platformFilter !== "all" && l.platform !== platformFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      return true;
    });
  }, [data, platformFilter, statusFilter]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login?redirect=/admin/apify-logs" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const platforms = data ? Object.keys(data.by_platform).sort() : [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Apify Aktivite Paneli</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Yalnızca {ADMIN_EMAIL} erişebilir. Apify ne zaman, hangi işletme için, hangi platforma çalıştı, kaç yorum geldi, admin'e mail atıldı mı?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Son 24 saat</SelectItem>
                <SelectItem value="3">Son 3 gün</SelectItem>
                <SelectItem value="7">Son 7 gün</SelectItem>
                <SelectItem value="30">Son 30 gün</SelectItem>
                <SelectItem value="90">Son 90 gün</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {loading && !data && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard label="Toplam Run" value={data.totals.total_runs} />
              <SummaryCard label="Başarılı" value={data.totals.success} tone="success" />
              <SummaryCard label="Skip (cooldown)" value={data.totals.skipped} tone="muted" />
              <SummaryCard label="Hatalı" value={data.totals.failed} tone="error" />
              <SummaryCard label="Çekilen Toplam" value={data.totals.total_fetched} />
              <SummaryCard label="Yeni Eklenen" value={data.totals.total_inserted} tone="success" />
              <SummaryCard label="Güncellenen" value={data.totals.total_updated} />
              <SummaryCard label="Admin Mail" value={data.totals.success} tone="info" />
            </div>

            {/* Platform breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-base">Platform Dağılımı</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-right">Run</TableHead>
                      <TableHead className="text-right">Skip</TableHead>
                      <TableHead className="text-right">Yeni Eklenen</TableHead>
                      <TableHead className="text-right">Güncellenen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.by_platform).sort().map(([p, v]) => (
                      <TableRow key={p}>
                        <TableCell className="font-medium capitalize">{p}</TableCell>
                        <TableCell className="text-right">{v.runs}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{v.skipped_runs}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{v.inserted}</TableCell>
                        <TableCell className="text-right">{v.updated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Business breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-base">İşletme Bazlı Dağılım</CardTitle></CardHeader>
              <CardContent className="max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşletme</TableHead>
                      <TableHead className="text-right">Run</TableHead>
                      <TableHead className="text-right">Yeni Eklenen</TableHead>
                      <TableHead className="text-right">Güncellenen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.by_business.map((b) => (
                      <TableRow key={b.business_id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="text-right">{b.runs}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{b.inserted}</TableCell>
                        <TableCell className="text-right">{b.updated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detailed log table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base">Detaylı Log ({filteredLogs.length})</CardTitle>
                  <div className="flex gap-2">
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm platformlar</SelectItem>
                        {platforms.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm durumlar</SelectItem>
                        <SelectItem value="success">Başarılı</SelectItem>
                        <SelectItem value="skipped">Skip</SelectItem>
                        <SelectItem value="error">Hata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Tarih</TableHead>
                      <TableHead>İşletme</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Çekilen</TableHead>
                      <TableHead className="text-right">Yeni</TableHead>
                      <TableHead className="text-right">Güncel</TableHead>
                      <TableHead>Admin Mail</TableHead>
                      <TableHead>Detay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {format(new Date(l.created_at), "dd MMM HH:mm", { locale: tr })}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{l.business_name}</div>
                          {l.business_city && <div className="text-xs text-muted-foreground">{l.business_city}</div>}
                        </TableCell>
                        <TableCell className="capitalize">{l.platform}</TableCell>
                        <TableCell>
                          {l.status === "success" && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Başarılı</Badge>}
                          {l.status === "skipped" && <Badge variant="secondary">Skip</Badge>}
                          {l.status !== "success" && l.status !== "skipped" && <Badge variant="destructive">{l.status}</Badge>}
                        </TableCell>
                        <TableCell className="text-right">{l.fetched || "-"}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{l.inserted || "-"}</TableCell>
                        <TableCell className="text-right">{l.updated || "-"}</TableCell>
                        <TableCell>
                          {l.admin_email_sent ? (
                            <div className="flex items-center gap-1 text-xs text-green-700">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[140px]">{l.admin_email_to}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MailX className="h-3.5 w-3.5" />
                              <span>Yok</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                          {l.skip_reason && <span>{l.skip_reason}</span>}
                          {l.error_message && <span className="text-destructive">{l.error_message}</span>}
                          {l.last_run_at && (
                            <div className="text-[11px] mt-0.5">
                              Önceki: {format(new Date(l.last_run_at), "dd MMM HH:mm", { locale: tr })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Bu filtrelere uyan kayıt yok.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: "success" | "error" | "muted" | "info" }) {
  const toneClass =
    tone === "success" ? "text-green-600" :
    tone === "error" ? "text-destructive" :
    tone === "muted" ? "text-muted-foreground" :
    tone === "info" ? "text-primary" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold mt-1 ${toneClass}`}>{value.toLocaleString("tr-TR")}</div>
      </CardContent>
    </Card>
  );
}
