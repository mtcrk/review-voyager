import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { averageRating5 } from "@/lib/ratingScale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { startOfWeek, addDays, format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { useBusiness } from "@/contexts/BusinessContext";
import { BusinessOnboarding } from "@/components/BusinessOnboarding";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

import { PriorityActions } from "@/components/dashboard/PriorityActions";
import { TopicAnalyticsCard } from "@/components/dashboard/TopicAnalyticsCard";
import { CompetitorComparison } from "@/components/dashboard/CompetitorComparison";
import { AIVisibilityChecker } from "@/components/landing/AIVisibilityChecker";
import { DemoModeBanner } from "@/components/dashboard/DemoModeBanner";
import { AllBusinessesView } from "@/components/dashboard/AllBusinessesView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UpgradeCTA } from "@/components/dashboard/UpgradeCTA";
import { DEMO_REVIEWS, DEMO_METRICS } from "@/lib/demoData";
import { useTranslation } from "react-i18next";
import { SetupWizard } from "@/components/dashboard/SetupWizard";
import { PlatformDiscovery } from "@/components/dashboard/PlatformDiscovery";
import { RepScoreWidget } from "@/components/dashboard/RepScoreWidget";
import { calculateRepScore, ReviewData } from "@/lib/repScore";
import { GooglePerformanceWidget } from "@/components/dashboard/GooglePerformanceWidget";
import { FirstSuccessModal } from "@/components/dashboard/FirstSuccessModal";
import { useReviewFetch } from "@/contexts/ReviewFetchContext";


export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { activeBusiness, businesses, loading: businessLoading, refetchBusinesses } = useBusiness();
  const { hasPendingRuns } = useReviewFetch();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [demoDismissed, setDemoDismissed] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [wizardDismissed, setWizardDismissed] = useState(false);

  // Fetch reviews for active business
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('posted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness,
  });

  // Demo mode: active business exists, no real reviews, not google connected
  const isDemoMode = !!activeBusiness && !reviewsLoading && reviews.length === 0 && !activeBusiness.google_connected;
  const effectiveReviews = isDemoMode ? DEMO_REVIEWS : reviews;

  // Helper function to get heat colors based on rating
  function getDayHeatColor(avgRating: number) {
    if (avgRating <= 2.0) return { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C' };
    if (avgRating <= 3.5) return { bg: '#FFFBEB', border: '#FACC15', text: '#92400E' };
    if (avgRating <= 4.3) return { bg: '#ECFDF3', border: '#4ADE80', text: '#166534' };
    return { bg: '#ECFEFF', border: '#22D3EE', text: '#115E59' };
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    if (isDemoMode) return DEMO_METRICS;
    if (!reviews.length) return { avgRating: 0, totalReviews: 0, reviewsThisWeek: 0, pendingReplies: 0 };

    const avgRating = averageRating5(reviews as any);
    const weekStart = startOfDay(currentWeekStart);
    const weekEnd = endOfDay(addDays(currentWeekStart, 6));
    const reviewsThisWeek = reviews.filter(r => {
      const date = new Date(r.posted_at);
      return date >= weekStart && date <= weekEnd;
    }).length;
    const pendingReplies = reviews.filter(r => r.status === 'pending_reply').length;

    return { avgRating: avgRating.toFixed(1), totalReviews: reviews.length, reviewsThisWeek, pendingReplies };
  }, [reviews, currentWeekStart, isDemoMode]);

  // Generate weekly data
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(currentWeekStart, index);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayReviews = effectiveReviews.filter(r => {
        const reviewDate = new Date(r.posted_at);
        return reviewDate >= dayStart && reviewDate <= dayEnd;
      });
      const avgRating = averageRating5(dayReviews as any);
      return {
        date,
        day: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        reviewCount: dayReviews.length,
        avgRating,
      };
    });
  }, [currentWeekStart, effectiveReviews]);

  const weekRange = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    return `${format(currentWeekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
  }, [currentWeekStart]);

  const goToPreviousWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const goToNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));

  const filteredReviews = useMemo(() => {
    const dayStart = startOfDay(selectedDay);
    const dayEnd = endOfDay(selectedDay);
    return effectiveReviews.filter(review => {
      const reviewDate = new Date(review.posted_at);
      return reviewDate >= dayStart && reviewDate <= dayEnd;
    });
  }, [effectiveReviews, selectedDay]);

  const selectedDayName = format(selectedDay, 'EEE');

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "neutral": return "bg-amber-50 text-amber-700 border-amber-200";
      case "negative": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} gün önce`;
    if (diffHours > 0) return `${diffHours} saat önce`;
    if (diffMins > 0) return `${diffMins} dakika önce`;
    return 'Az önce';
  };

  const analyticsData = [
    { title: t('dashboard.metrics.avgRating', 'Ortalama Puan'), value: metrics.avgRating, icon: Star, subtitle: t('dashboard.metrics.outOf5', '5 üzerinden') },
    { title: t('dashboard.metrics.totalReviews', 'Toplam Yorumlar'), value: typeof metrics.totalReviews === 'number' ? metrics.totalReviews.toLocaleString() : metrics.totalReviews, subtitle: t('dashboard.metrics.allTime', 'tüm zamanlar') },
    { title: t('dashboard.metrics.weeklyReviews', 'Bu Haftanın Yorumları'), value: metrics.reviewsThisWeek.toString(), subtitle: weekRange },
    { title: t('dashboard.metrics.pendingReplies', 'Bekleyen Yanıtlar'), value: metrics.pendingReplies.toString(), subtitle: t('dashboard.metrics.needsAttention', 'dikkat gerekiyor') },
  ];

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <BusinessOnboarding
        open={!businessLoading && !activeBusiness && !onboardingDismissed}
        onBusinessCreated={refetchBusinesses}
        onDismiss={() => setOnboardingDismissed(true)}
      />
      <FirstSuccessModal />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {activeBusiness && businesses.length > 1 ? (
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Aktif Otel</TabsTrigger>
                <TabsTrigger value="all">Tüm Oteller ({businesses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <AllBusinessesView />
              </TabsContent>

              <TabsContent value="active" className="mt-6 space-y-10">
                <DashboardActiveContent />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-10">
              <DashboardActiveContent />
            </div>
          )}
        </div>
      </div>
    </>
  );

  function DashboardActiveContent() {
    return (
      <>
          {/* Business Name Header */}
          {activeBusiness && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold text-foreground">
                    {activeBusiness.name}
                  </h1>
                  {activeBusiness.google_connected ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Google Bağlı
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Google Bağlı Değil
                    </Badge>
                  )}
                  {activeBusiness.booking_hotel_id && (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Booking.com
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">
                  {activeBusiness.city ? `${activeBusiness.city} · ` : ''}{t('dashboard.subtitle', 'Dashboard Özeti')}
                </p>
              </div>
              {activeBusiness.place_id && (
                <a 
                  href={`https://search.google.com/local/reviews?placeid=${activeBusiness.place_id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google'da Gör
                </a>
              )}
            </div>
          )}

          {/* Setup Wizard */}
          {activeBusiness && !wizardDismissed && (
            <SetupWizard
              onDismiss={() => setWizardDismissed(true)}
              onComplete={() => {
                refetchBusinesses();
                queryClient.invalidateQueries({ queryKey: ['reviews'] });
              }}
            />
          )}

          {/* Platform Discovery */}
          <PlatformDiscovery />

          {/* Demo Mode Banner */}
          {isDemoMode && !demoDismissed && (
            <DemoModeBanner onDismiss={() => setDemoDismissed(true)} />
          )}

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.map((item, index) => (
              <Card key={index} className="shadow-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-5 w-5 text-primary fill-primary" />}
                    <div className="text-3xl font-bold text-foreground">{item.value}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-0">
              <RepScoreWidget score={calculateRepScore(effectiveReviews.map(r => ({
                rating: r.rating,
                text: r.text,
                platform: (r as any).platform || 'google',
                posted_at: r.posted_at,
                status: r.status,
                sentiment: r.sentiment,
                approved_reply: r.approved_reply,
                replied_at: r.replied_at,
              })))} />
            </div>
            <div className="space-y-0">
              <PriorityActions reviews={effectiveReviews} />
              {isDemoMode && <UpgradeCTA feature={t('dashboard.demo.features.priorityActions', 'Öncelikli İşlemler')} />}
            </div>
            <div className="space-y-0">
              <TopicAnalyticsCard />
            </div>
            <div className="space-y-0">
              <Card className="shadow-card h-[500px] flex flex-col cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/chat')}>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Yorumlarınızla Sohbet</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        AI'a yorumlarınız hakkında sorular sorun
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-center mb-4">
                    Yorumlarınız hakkında sorular sorun
                  </p>
                  <Button variant="outline" size="sm">
                    Sohbete Git →
                  </Button>
                </CardContent>
              </Card>
              {isDemoMode && <UpgradeCTA feature={t('dashboard.demo.features.chatWithReviews', 'Yorumlarla Sohbet')} />}
            </div>
            <div className="space-y-0">
              <GooglePerformanceWidget />
            </div>
            <div className="space-y-0">
              <CompetitorComparison />
              {isDemoMode && <UpgradeCTA feature={t('dashboard.demo.features.competitorAnalysis', 'Rakip Analizi')} />}
            </div>
          </div>

          <div className="mt-6">
            <AIVisibilityChecker />
          </div>

          {reviewsLoading && !isDemoMode ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : effectiveReviews.length === 0 ? (
            <Card className="p-12 text-center shadow-card space-y-4">
              {hasPendingRuns ? (
                <>
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground text-lg font-medium">Yorumların çekiliyor...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu işlem 1-2 dakika sürebilir. Bittiğinde sana haber vereceğiz.
                    </p>
                  </div>
                </>
              ) : activeBusiness?.google_connected ? (
                <>
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground text-lg font-medium">Google Business bağlı, yorumları çekelim!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sidebar'dan Google Business → Google Yorumları sayfasına gidin ve "Yorumları Çek" butonuna tıklayın.
                    </p>
                  </div>
                  <Button onClick={() => navigate('/reviews')} className="mt-2">
                    Yorumlar Sayfasına Git
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-lg">{t('dashboard.noReviews', 'Bu işletme için henüz yorum yok.')}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.noReviewsSub', 'Yorumlar eklendiğinde burada görünecek.')}</p>
                </>
              )}
            </Card>
          ) : (
            <>
              {/* Weekly Activity Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {t('dashboard.weeklyTitle', 'Bu Haftanın Yorumları')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{weekRange}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousWeek}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Weekly Strip */}
                <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                  {weeklyData.map((dayData, index) => {
                    const colors = dayData.avgRating > 0 
                      ? getDayHeatColor(dayData.avgRating)
                      : { bg: '#F9FAFB', border: '#E5E7EB', text: '#9CA3AF' };
                    const isSelected = isSameDay(selectedDay, dayData.date);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(dayData.date)}
                        className={`p-2 md:p-4 rounded-lg transition-all duration-200 ${
                          isSelected ? 'shadow-md scale-105' : 'shadow-soft hover:shadow-card hover:scale-[1.02]'
                        }`}
                        style={{
                          backgroundColor: colors.bg,
                          borderWidth: '2px',
                          borderColor: isSelected ? colors.border : 'transparent',
                        }}
                      >
                        <div className="space-y-1 md:space-y-2 text-center">
                          <div className="text-[10px] md:text-xs font-semibold" style={{ color: colors.text }}>{dayData.day}</div>
                          <div className="text-sm md:text-lg font-bold" style={{ color: colors.text }}>{dayData.dayNumber}</div>
                          <div className="text-[9px] md:text-[10px] font-medium" style={{ color: colors.text }}>{dayData.reviewCount} yorum</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reviews Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {selectedDayName} {t('dashboard.dayReviews', 'Günü Yorumları')} ({format(selectedDay, 'MMM d')})
                </h2>

                {filteredReviews.length === 0 ? (
                  <Card className="p-16 text-center shadow-card">
                    <p className="text-muted-foreground text-lg">{t('dashboard.noDayReviews', 'Bu gün için yorum bulunamadı.')}</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <Card
                        key={review.id}
                        className="shadow-card hover:shadow-md transition-all duration-300 hover:scale-[1.005] cursor-pointer"
                        onClick={() => !isDemoMode && navigate(`/reviews/${review.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-semibold text-foreground text-base">{review.reviewer_name}</h3>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                  ))}
                                </div>
                                {isDemoMode && (
                                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                                    Demo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {review.text || 'Yorum metni yok'}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{getTimeAgo(review.posted_at)}</span>
                                {review.sentiment && (
                                  <Badge variant="outline" className={`${getSentimentColor(review.sentiment)} text-xs capitalize`}>
                                    {review.sentiment}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="shrink-0">
                              {isDemoMode ? t('dashboard.demo.seeExample', 'Örnek Yanıt') : t('dashboard.seeReply', 'Yanıtı Gör')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Upgrade CTA for Demo Mode */}
              {isDemoMode && (
                <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 p-8 text-center space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('dashboard.demo.bottomCta.title', 'Gerçek verilerinizle çalışmaya hazır mısınız?')}
                  </h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    {t('dashboard.demo.bottomCta.subtitle', 'Google Business hesabınızı bağlayın ve gerçek müşteri yorumlarınızı AI ile yönetmeye başlayın.')}
                  </p>
                  <Button onClick={() => navigate("/settings")} className="gradient-primary text-white px-8 py-6 text-base">
                    {t('dashboard.demo.bottomCta.button', 'Hesabımı Bağla ve Başla')}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      );
    }
}
