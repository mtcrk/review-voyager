import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Mail, MailX, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ADMIN_EMAIL = "metecorukbasari@gmail.com";
const PAGE_SIZE = 25;

interface OverviewResp {
  window_days: number;
  admin_email: string;
  apify: {
    totals: { total_runs: number; success: number; skipped: number; failed: number; total_inserted: number; total_updated: number; total_fetched: number };
    by_platform: Record<string, { runs: number; inserted: number; updated: number; skipped_runs: number }>;
    by_business: Array<{ business_id: string; name: string; runs: number; inserted: number; updated: number }>;
    logs: any[];
  };
  users: { total: number; list: any[] };
  reply_logs: { total: number; list: any[] };
  email_logs: { total: number; list: any[] };
  integrations: { total: number; by_provider: Record<string, { total: number; success: number; failed: number; skipped: number }>; list: any[] };
}

function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    pageItems: items.slice(start, start + PAGE_SIZE),
    totalPages,
    safePage,
    total: items.length,
  };
}

function Pager({
  page, totalPages, total, onPage,
}: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  if (total === 0) return null;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t text-xs text-muted-foreground flex-wrap">
      <div>{start.toLocaleString("tr-TR")}–{end.toLocaleString("tr-TR")} / {total.toLocaleString("tr-TR")}</div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onPage(1)} disabled={page <= 1}>«</Button>
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onPage(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="px-2">Sayfa {page} / {totalPages}</span>
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => onPage(totalPages)} disabled={page >= totalPages}>»</Button>
      </div>
    </div>
  );
}

export default function AdminApifyLogs() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<OverviewResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("7");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  // Pagination state per tab
  const [apifyPage, setApifyPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [repliesPage, setRepliesPage] = useState(1);
  const [emailsPage, setEmailsPage] = useState(1);
  const [integrationsPage, setIntegrationsPage] = useState(1);

  // Reset pages when filters/search change
  useEffect(() => { setApifyPage(1); }, [search, platformFilter, statusFilter, days]);
  useEffect(() => { setUsersPage(1); }, [search, days]);
  useEffect(() => { setRepliesPage(1); }, [search, days]);
  useEffect(() => { setEmailsPage(1); }, [search, days]);
  useEffect(() => { setIntegrationsPage(1); }, [search, providerFilter, days]);

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

  const filteredApifyLogs = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.apify.logs.filter((l) => {
      if (platformFilter !== "all" && l.platform !== platformFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (q && !`${l.business_name} ${l.platform}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, platformFilter, statusFilter, search]);

  const filteredIntegrations = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.integrations.list.filter((l: any) => {
      if (providerFilter !== "all" && l.provider !== providerFilter) return false;
      if (q && !`${l.business_name} ${l.provider} ${l.action}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, providerFilter, search]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    if (!q) return data.users.list;
    return data.users.list.filter((u: any) =>
      `${u.email} ${u.full_name}`.toLowerCase().includes(q)
    );
  }, [data, search]);

  const filteredReplies = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    if (!q) return data.reply_logs.list;
    return data.reply_logs.list.filter((r: any) =>
      `${r.business_name} ${r.user_email} ${r.reply_text}`.toLowerCase().includes(q)
    );
  }, [data, search]);

  const filteredEmails = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    if (!q) return data.email_logs.list;
    return data.email_logs.list.filter((e: any) =>
      `${e.recipient_email} ${e.subject} ${e.business_name}`.toLowerCase().includes(q)
    );
  }, [data, search]);

  // Paged slices
  const apifyPaged = useMemo(() => paginate(filteredApifyLogs, apifyPage), [filteredApifyLogs, apifyPage]);
  const usersPaged = useMemo(() => paginate(filteredUsers, usersPage), [filteredUsers, usersPage]);
  const repliesPaged = useMemo(() => paginate(filteredReplies, repliesPage), [filteredReplies, repliesPage]);
  const emailsPaged = useMemo(() => paginate(filteredEmails, emailsPage), [filteredEmails, emailsPage]);
  const integrationsPaged = useMemo(() => paginate(filteredIntegrations, integrationsPage), [filteredIntegrations, integrationsPage]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login?redirect=/admin/apify-logs" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const platforms = data ? Object.keys(data.apify.by_platform).sort() : [];
  const providers = data ? Object.keys(data.integrations.by_provider).sort() : [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Aktivite Paneli</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Yalnızca {ADMIN_EMAIL} erişebilir. Sistemdeki her aktiviteyi gör.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
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
          <Tabs defaultValue="apify" className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full max-w-3xl">
              <TabsTrigger value="apify">Apify ({data.apify.totals.total_runs})</TabsTrigger>
              <TabsTrigger value="users">Kullanıcılar ({data.users.total})</TabsTrigger>
              <TabsTrigger value="replies">Yanıtlar ({data.reply_logs.total})</TabsTrigger>
              <TabsTrigger value="emails">Mailler ({data.email_logs.total})</TabsTrigger>
              <TabsTrigger value="integrations">Tüm Logs ({data.integrations.total})</TabsTrigger>
              <TabsTrigger value="cron">Cron Joblar</TabsTrigger>
            </TabsList>

            <TabsContent value="cron">
              <AdminCronJobs />
            </TabsContent>


            {/* ============ APIFY ============ */}
            <TabsContent value="apify" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Toplam Run" value={data.apify.totals.total_runs} />
                <SummaryCard label="Başarılı" value={data.apify.totals.success} tone="success" />
                <SummaryCard label="Skip" value={data.apify.totals.skipped} tone="muted" />
                <SummaryCard label="Hatalı" value={data.apify.totals.failed} tone="error" />
                <SummaryCard label="Çekilen Toplam" value={data.apify.totals.total_fetched} />
                <SummaryCard label="Yeni Eklenen" value={data.apify.totals.total_inserted} tone="success" />
                <SummaryCard label="Güncellenen" value={data.apify.totals.total_updated} />
                <SummaryCard label="Admin Mail" value={data.apify.totals.success} tone="info" />
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Platform Dağılımı</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Run</TableHead>
                        <TableHead className="text-right">Skip</TableHead>
                        <TableHead className="text-right">Yeni</TableHead>
                        <TableHead className="text-right">Güncel</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(data.apify.by_platform).sort().map(([p, v]) => (
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

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-base">Detaylı Log ({filteredApifyLogs.length})</CardTitle>
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
                        <TableHead>Tarih</TableHead>
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
                      {apifyPaged.pageItems.map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {format(new Date(l.created_at), "dd MMM HH:mm", { locale: tr })}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{l.business_name}</div>
                            {l.business_city && <div className="text-xs text-muted-foreground">{l.business_city}</div>}
                          </TableCell>
                          <TableCell className="capitalize">{l.platform}</TableCell>
                          <TableCell><StatusBadge status={l.status} /></TableCell>
                          <TableCell className="text-right">{l.fetched || "-"}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">{l.inserted || "-"}</TableCell>
                          <TableCell className="text-right">{l.updated || "-"}</TableCell>
                          <TableCell>
                            {l.admin_email_sent ? (
                              <div className="flex items-center gap-1 text-xs text-green-700">
                                <Mail className="h-3.5 w-3.5" /><span className="truncate max-w-[140px]">{l.admin_email_to}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MailX className="h-3.5 w-3.5" /><span>Yok</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                            {l.skip_reason && <span>{l.skip_reason}</span>}
                            {l.error_message && <span className="text-destructive">{l.error_message}</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredApifyLogs.length === 0 && (
                        <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Kayıt yok.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pager page={apifyPaged.safePage} totalPages={apifyPaged.totalPages} total={apifyPaged.total} onPage={setApifyPage} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============ USERS ============ */}
            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle className="text-base">Tüm Kullanıcılar ({filteredUsers.length})</CardTitle></CardHeader>
                <CardContent className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead className="text-right">İşletme</TableHead>
                        <TableHead>Kayıt</TableHead>
                        <TableHead>Son Giriş</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersPaged.pageItems.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium text-sm">{u.email}</TableCell>
                          <TableCell className="text-sm">{u.full_name}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
                          <TableCell className="text-right">{u.business_count}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(u.created_at), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_sign_in_at
                              ? format(new Date(u.last_sign_in_at), "dd MMM HH:mm", { locale: tr })
                              : "Hiç"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Kayıt yok.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pager page={usersPaged.safePage} totalPages={usersPaged.totalPages} total={usersPaged.total} onPage={setUsersPage} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============ REPLIES ============ */}
            <TabsContent value="replies">
              <Card>
                <CardHeader><CardTitle className="text-base">Yorum Yanıtları ({filteredReplies.length})</CardTitle></CardHeader>
                <CardContent className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Kullanıcı</TableHead>
                        <TableHead>İşletme</TableHead>
                        <TableHead>Kaynak</TableHead>
                        <TableHead>Ton</TableHead>
                        <TableHead>Yanıt</TableHead>
                        <TableHead>Google</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repliesPaged.pageItems.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {format(new Date(r.created_at), "dd MMM HH:mm", { locale: tr })}
                          </TableCell>
                          <TableCell className="text-sm">{r.user_email}</TableCell>
                          <TableCell className="text-sm">{r.business_name}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{r.reply_source || "-"}</Badge></TableCell>
                          <TableCell className="text-xs capitalize">{r.tone || "-"}</TableCell>
                          <TableCell className="text-xs max-w-[300px] truncate" title={r.reply_text}>{r.reply_text}</TableCell>
                          <TableCell>
                            {r.google_status === "sent" && <Badge className="bg-green-100 text-green-800">Gönderildi</Badge>}
                            {r.google_status && r.google_status !== "sent" && <Badge variant="destructive">{r.google_status}</Badge>}
                            {!r.google_status && <span className="text-muted-foreground text-xs">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredReplies.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Kayıt yok.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pager page={repliesPaged.safePage} totalPages={repliesPaged.totalPages} total={repliesPaged.total} onPage={setRepliesPage} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============ EMAILS ============ */}
            <TabsContent value="emails">
              <Card>
                <CardHeader><CardTitle className="text-base">E-posta Logları ({filteredEmails.length})</CardTitle></CardHeader>
                <CardContent className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Alıcı</TableHead>
                        <TableHead>Konu</TableHead>
                        <TableHead>İşletme</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Hata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailsPaged.pageItems.map((e: any) => (
                        <TableRow key={e.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {format(new Date(e.created_at), "dd MMM HH:mm", { locale: tr })}
                          </TableCell>
                          <TableCell className="text-sm">{e.recipient_email}</TableCell>
                          <TableCell className="text-sm max-w-[280px] truncate" title={e.subject}>{e.subject}</TableCell>
                          <TableCell className="text-sm">{e.business_name}</TableCell>
                          <TableCell><StatusBadge status={e.status} /></TableCell>
                          <TableCell className="text-xs text-destructive max-w-[200px] truncate">{e.error_message || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {filteredEmails.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Kayıt yok.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pager page={emailsPaged.safePage} totalPages={emailsPaged.totalPages} total={emailsPaged.total} onPage={setEmailsPage} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============ INTEGRATIONS ============ */}
            <TabsContent value="integrations" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.integrations.by_provider).map(([p, v]) => (
                  <Card key={p}>
                    <CardContent className="p-4">
                      <div className="text-xs text-muted-foreground capitalize">{p}</div>
                      <div className="text-2xl font-bold mt-1">{v.total}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        ✅ {v.success} · ⏭ {v.skipped} · ❌ {v.failed}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-base">Tüm Entegrasyon Logları ({filteredIntegrations.length})</CardTitle>
                    <Select value={providerFilter} onValueChange={setProviderFilter}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm provider'lar</SelectItem>
                        {providers.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>İşletme</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>HTTP</TableHead>
                        <TableHead>Detay / Hata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrationsPaged.pageItems.map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {format(new Date(l.created_at), "dd MMM HH:mm", { locale: tr })}
                          </TableCell>
                          <TableCell className="capitalize"><Badge variant="outline">{l.provider}</Badge></TableCell>
                          <TableCell className="text-xs">{l.action}</TableCell>
                          <TableCell className="text-sm">{l.business_name}</TableCell>
                          <TableCell><StatusBadge status={l.status} /></TableCell>
                          <TableCell className="text-xs">{l.http_status || "-"}</TableCell>
                          <TableCell className="text-xs max-w-[280px] truncate">
                            {l.error_message ? <span className="text-destructive">{l.error_message}</span> : <span className="text-muted-foreground">{l.meta_summary}</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredIntegrations.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Kayıt yok.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pager page={integrationsPaged.safePage} totalPages={integrationsPaged.totalPages} total={integrationsPaged.total} onPage={setIntegrationsPage} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success" || status === "sent") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
  if (status === "skipped") return <Badge variant="secondary">Skip</Badge>;
  return <Badge variant="destructive">{status}</Badge>;
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
