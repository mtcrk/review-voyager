import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Dashboard() {
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

  // Mock review data
  const reviews = [
    {
      id: 1,
      reviewer: "Sarah Johnson",
      rating: 5,
      text: "Excellent service! The team was very professional and responsive. I couldn't be happier with the results. Highly recommend to anyone looking for quality work.",
      date: "2 hours ago",
      sentiment: "Positive",
    },
    {
      id: 2,
      reviewer: "Michael Chen",
      rating: 4,
      text: "Great experience overall. The communication was clear and the delivery was on time. Would definitely use again.",
      date: "5 hours ago",
      sentiment: "Positive",
    },
    {
      id: 3,
      reviewer: "Emma Davis",
      rating: 3,
      text: "Decent service but there's room for improvement. The response time could be faster.",
      date: "1 day ago",
      sentiment: "Neutral",
    },
    {
      id: 4,
      reviewer: "James Wilson",
      rating: 5,
      text: "Outstanding quality and attention to detail. Exceeded my expectations in every way.",
      date: "2 days ago",
      sentiment: "Positive",
    },
  ];

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

        {/* Recent Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Recent Reviews
          </h2>

          {reviews.length === 0 ? (
            <Card className="p-16 text-center shadow-card">
              <p className="text-muted-foreground text-lg">No reviews found yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
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
