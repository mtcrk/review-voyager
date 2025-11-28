import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(2); // Tuesday selected by default

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

  // Mock weekly data
  const weeklyData = [
    { day: 'Mon', dayIndex: 0, reviewCount: 12, avgRating: 4.5 },
    { day: 'Tue', dayIndex: 1, reviewCount: 8, avgRating: 4.2 },
    { day: 'Wed', dayIndex: 2, reviewCount: 15, avgRating: 4.7 },
    { day: 'Thu', dayIndex: 3, reviewCount: 6, avgRating: 3.8 },
    { day: 'Fri', dayIndex: 4, reviewCount: 18, avgRating: 4.9 },
    { day: 'Sat', dayIndex: 5, reviewCount: 4, avgRating: 3.2 },
    { day: 'Sun', dayIndex: 6, reviewCount: 9, avgRating: 4.6 },
  ];
  // Mock analytics data
  const analytics = [
    {
      title: "Average Rating",
      value: "4.8",
      icon: Star,
      subtitle: "out of 5.0",
    },
    {
      title: "Total Reviews",
      value: "1,247",
      subtitle: "all time",
    },
    {
      title: "Reviews This Week",
      value: "23",
      subtitle: "+12% from last week",
    },
    {
      title: "Pending Replies",
      value: "5",
      subtitle: "need attention",
    },
  ];

  // Mock review data - now with day index for filtering
  const reviews = [
    {
      id: 1,
      reviewer: "Sarah Johnson",
      rating: 5,
      text: "Excellent service! The team was very professional and responsive. I couldn't be happier with the results. Highly recommend to anyone looking for quality work.",
      date: "2 hours ago",
      sentiment: "Positive",
      dayIndex: 2, // Wednesday
    },
    {
      id: 2,
      reviewer: "Michael Chen",
      rating: 4,
      text: "Great experience overall. The communication was clear and the delivery was on time. Would definitely use again.",
      date: "5 hours ago",
      sentiment: "Positive",
      dayIndex: 2, // Wednesday
    },
    {
      id: 3,
      reviewer: "Emma Davis",
      rating: 3,
      text: "Decent service but there's room for improvement. The response time could be faster.",
      date: "1 day ago",
      sentiment: "Neutral",
      dayIndex: 1, // Tuesday
    },
    {
      id: 4,
      reviewer: "James Wilson",
      rating: 5,
      text: "Outstanding quality and attention to detail. Exceeded my expectations in every way.",
      date: "2 days ago",
      sentiment: "Positive",
      dayIndex: 0, // Monday
    },
    {
      id: 5,
      reviewer: "Lisa Anderson",
      rating: 4,
      text: "Very satisfied with the service. Professional team and great results.",
      date: "3 days ago",
      sentiment: "Positive",
      dayIndex: 4, // Friday
    },
  ];

  // Filter reviews by selected day
  const filteredReviews = reviews.filter(review => review.dayIndex === selectedDay);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Neutral":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analytics.map((item, index) => (
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

        {/* Weekly Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              This Week's Reviews
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekly Strip */}
          <div className="grid grid-cols-7 gap-3">
            {weeklyData.map((dayData) => {
              const colors = getDayHeatColor(dayData.avgRating);
              const isSelected = selectedDay === dayData.dayIndex;
              
              return (
                <button
                  key={dayData.dayIndex}
                  onClick={() => setSelectedDay(dayData.dayIndex)}
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
                      {dayData.reviewCount}
                    </div>
                    <div 
                      className="text-[10px] font-medium"
                      style={{ color: colors.text }}
                    >
                      reviews
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
            {weeklyData[selectedDay].day}'s Reviews
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
                  className="shadow-card hover:shadow-md transition-all duration-300 hover:scale-[1.005]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        {/* Header: Name and Stars */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-foreground text-base">
                            {review.reviewer}
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
                          {review.text}
                        </p>

                        {/* Footer: Date and Sentiment */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {review.date}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${getSentimentColor(review.sentiment)} text-xs`}
                          >
                            {review.sentiment}
                          </Badge>
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
      </div>
    </div>
  );
}
