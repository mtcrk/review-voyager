import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { startOfWeek, addDays, format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { useBusiness } from "@/contexts/BusinessContext";
import { BusinessOnboarding } from "@/components/BusinessOnboarding";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeBusiness, loading: businessLoading, refetchBusinesses } = useBusiness();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

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

  // Helper function to get heat colors based on rating
  function getDayHeatColor(avgRating: number) {
    if (avgRating <= 2.0) {
      return { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C' };
    } else if (avgRating <= 3.5) {
      return { bg: '#FFFBEB', border: '#FACC15', text: '#92400E' };
    } else if (avgRating <= 4.3) {
      return { bg: '#ECFDF3', border: '#4ADE80', text: '#166534' };
    } else {
      return { bg: '#ECFEFF', border: '#22D3EE', text: '#115E59' };
    }
  }

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    if (!reviews.length) {
      return {
        avgRating: 0,
        totalReviews: 0,
        reviewsThisWeek: 0,
        pendingReplies: 0,
      };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const weekStart = startOfDay(currentWeekStart);
    const weekEnd = endOfDay(addDays(currentWeekStart, 6));
    const reviewsThisWeek = reviews.filter(r => {
      const date = new Date(r.posted_at);
      return date >= weekStart && date <= weekEnd;
    }).length;

    const pendingReplies = reviews.filter(r => r.status === 'pending_reply').length;

    return {
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
      reviewsThisWeek,
      pendingReplies,
    };
  }, [reviews, currentWeekStart]);

  // Generate weekly data from real reviews
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(currentWeekStart, index);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayReviews = reviews.filter(r => {
        const reviewDate = new Date(r.posted_at);
        return reviewDate >= dayStart && reviewDate <= dayEnd;
      });

      const avgRating = dayReviews.length > 0
        ? dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length
        : 0;

      return {
        date,
        day: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        reviewCount: dayReviews.length,
        avgRating,
      };
    });
  }, [currentWeekStart, reviews]);

  // Calculate week range for display
  const weekRange = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    return `${format(currentWeekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
  }, [currentWeekStart]);

  // Navigate weeks
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  // Filter reviews by selected day
  const filteredReviews = useMemo(() => {
    const dayStart = startOfDay(selectedDay);
    const dayEnd = endOfDay(selectedDay);
    
    return reviews.filter(review => {
      const reviewDate = new Date(review.posted_at);
      return reviewDate >= dayStart && reviewDate <= dayEnd;
    });
  }, [reviews, selectedDay]);

  // Get selected day name for display
  const selectedDayName = format(selectedDay, 'EEE');

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "neutral":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const analyticsData = [
    {
      title: "Average Rating",
      value: metrics.avgRating,
      icon: Star,
      subtitle: "out of 5.0",
    },
    {
      title: "Total Reviews",
      value: metrics.totalReviews.toLocaleString(),
      subtitle: "all time",
    },
    {
      title: "Reviews This Week",
      value: metrics.reviewsThisWeek.toString(),
      subtitle: weekRange,
    },
    {
      title: "Pending Replies",
      value: metrics.pendingReplies.toString(),
      subtitle: "need attention",
    },
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
        open={!businessLoading && !activeBusiness}
        onBusinessCreated={refetchBusinesses}
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-8 space-y-10">
          {/* Business Name Header */}
          {activeBusiness && (
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                {activeBusiness.name}
              </h1>
              <p className="text-muted-foreground mt-1">Dashboard Overview</p>
            </div>
          )}

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.map((item, index) => (
              <Card
                key={index}
                className="shadow-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    {item.icon && (
                      <item.icon className="h-5 w-5 text-primary fill-primary" />
                    )}
                    <div className="text-3xl font-bold text-foreground">
                      {item.value}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {reviewsLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <p className="text-muted-foreground text-lg">No reviews yet for this business.</p>
              <p className="text-sm text-muted-foreground mt-2">Reviews will appear here once they're added.</p>
            </Card>
          ) : (
            <>
              {/* Weekly Activity Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      This Week's Reviews
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {weekRange}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={goToPreviousWeek}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={goToNextWeek}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Weekly Strip */}
                <div className="grid grid-cols-7 gap-3">
                  {weeklyData.map((dayData, index) => {
                    const colors = dayData.avgRating > 0 
                      ? getDayHeatColor(dayData.avgRating)
                      : { bg: '#F9FAFB', border: '#E5E7EB', text: '#9CA3AF' };
                    const isSelected = isSameDay(selectedDay, dayData.date);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(dayData.date)}
                        className={`
                          p-4 rounded-lg transition-all duration-200
                          ${isSelected 
                            ? 'shadow-md scale-105' 
                            : 'shadow-soft hover:shadow-card hover:scale-[1.02]'
                          }
                        `}
                        style={{
                          backgroundColor: colors.bg,
                          borderWidth: '2px',
                          borderColor: isSelected ? colors.border : 'transparent',
                        }}
                      >
                        <div className="space-y-2 text-center">
                          <div 
                            className="text-xs font-semibold"
                            style={{ color: colors.text }}
                          >
                            {dayData.day}
                          </div>
                          <div 
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                          >
                            {dayData.dayNumber}
                          </div>
                          <div 
                            className="text-[10px] font-medium"
                            style={{ color: colors.text }}
                          >
                            {dayData.reviewCount} review{dayData.reviewCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reviews Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {selectedDayName}'s Reviews ({format(selectedDay, 'MMM d')})
                </h2>

                {filteredReviews.length === 0 ? (
                  <Card className="p-16 text-center shadow-card">
                    <p className="text-muted-foreground text-lg">No reviews found for this day.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <Card
                        key={review.id}
                        className="shadow-card hover:shadow-md transition-all duration-300 hover:scale-[1.005] cursor-pointer"
                        onClick={() => navigate(`/reviews/${review.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1 space-y-3">
                              {/* Header: Name and Stars */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-semibold text-foreground text-base">
                                  {review.reviewer_name}
                                </h3>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-4 w-4 fill-primary text-primary"
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Review Text */}
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {review.text || 'No review text'}
                              </p>

                              {/* Footer: Date and Sentiment */}
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {getTimeAgo(review.posted_at)}
                                </span>
                                {review.sentiment && (
                                  <Badge
                                    variant="outline"
                                    className={`${getSentimentColor(review.sentiment)} text-xs capitalize`}
                                  >
                                    {review.sentiment}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* View Reply Button */}
                            <Button variant="outline" size="sm" className="shrink-0">
                              View Reply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
