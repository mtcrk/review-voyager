import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, Star, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  // Mock data - will be replaced with real data
  const metrics = [
    {
      title: "New Reviews",
      value: "12",
      subtitle: "Last 24 hours",
      icon: MessageSquare,
      trend: "+2 from yesterday",
    },
    {
      title: "Pending Replies",
      value: "5",
      subtitle: "Needs attention",
      icon: Clock,
      trend: "3 are urgent",
    },
    {
      title: "Avg Rating",
      value: "4.5",
      subtitle: "This month",
      icon: Star,
      trend: "+0.2 from last month",
    },
    {
      title: "Auto Reply Success",
      value: "94%",
      subtitle: "Success rate",
      icon: CheckCircle2,
      trend: "Excellent performance",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      reviewer: "John Smith",
      rating: 5,
      text: "Excellent service! Very professional and quick response time.",
      time: "2 hours ago",
      status: "replied",
    },
    {
      id: 2,
      reviewer: "Sarah Johnson",
      rating: 4,
      text: "Great experience overall. Would definitely recommend.",
      time: "5 hours ago",
      status: "pending",
    },
    {
      id: 3,
      reviewer: "Michael Brown",
      rating: 5,
      text: "Outstanding quality and attention to detail.",
      time: "1 day ago",
      status: "replied",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your review overview.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="shadow-card hover:shadow-soft transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground mb-1">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{metric.subtitle}</p>
              <p className="text-xs text-primary">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-smooth"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{activity.reviewer}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: activity.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.text}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{activity.time}</span>
                      <Badge
                        variant={activity.status === "replied" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {activity.status === "replied" ? "Replied" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Google Connection Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Google Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">Connection Status</p>
                <p className="text-xs text-muted-foreground mt-1">Not connected</p>
              </div>
              <Badge variant="secondary">Offline</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-1">Last Sync</p>
              <p className="text-xs text-muted-foreground">Never</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
