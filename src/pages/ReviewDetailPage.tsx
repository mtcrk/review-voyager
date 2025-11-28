import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock data - will be replaced with Supabase data
const mockReview = {
  id: "1",
  businessName: "Voyage Coffee House",
  reviewerName: "Sarah Johnson",
  rating: 5,
  text: "Absolutely loved this place! The coffee was exceptional, and the staff was incredibly friendly. The atmosphere is perfect for working or catching up with friends. I especially appreciated the attention to detail in their latte art. Will definitely be back!",
  postedAt: "2025-03-15T10:30:00Z",
  sentiment: "Positive" as const,
  summary: "Customer highly satisfied with coffee quality, staff friendliness, and work-friendly atmosphere. Particularly impressed by latte art presentation.",
  issues: [] as string[],
  praises: ["Exceptional coffee", "Friendly staff", "Perfect atmosphere", "Great latte art"],
  status: "pending" as "pending" | "approved" | "replied",
};

type ToneOption = "Friendly" | "Professional" | "Formal";

const ReviewDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTone, setSelectedTone] = useState<ToneOption>("Friendly");
  const [aiReply, setAiReply] = useState(
    "Thank you so much for your wonderful review, Sarah! We're thrilled to hear you enjoyed our coffee and the cozy atmosphere. Our team takes great pride in crafting each cup with care, and we're so glad the latte art caught your eye! We can't wait to welcome you back soon. ☕✨"
  );
  const [status, setStatus] = useState(mockReview.status);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Negative":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "replied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(aiReply);
    toast.success("Reply copied to clipboard!");
  };

  const handleMarkAsApproved = () => {
    setStatus("approved");
    toast.success("Review marked as approved!");
  };

  const handleRegenerateReply = () => {
    // Will connect to AI service later
    toast.info("Regenerating reply...");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm h-16">
        <div className="container mx-auto max-w-[720px] px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-base">{mockReview.reviewerName}</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < mockReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getSentimentColor(mockReview.sentiment)}>
              {mockReview.sentiment}
            </Badge>
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-[720px] px-6 py-8 flex-1">
        <div className="space-y-6">
          {/* Section A: Original Review */}
          <Card className="rounded-xl shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Original Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Reviewer</p>
                  <p className="text-lg font-semibold">{mockReview.reviewerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Posted</p>
                  <p className="text-sm font-medium">{formatDate(mockReview.postedAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Review Text</p>
                <p className="text-base leading-relaxed text-foreground">{mockReview.text}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Business</p>
                <p className="font-medium text-foreground">{mockReview.businessName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section B: AI Insights */}
          <Card className="rounded-xl shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                <p className="text-sm leading-relaxed text-foreground">{mockReview.summary}</p>
              </div>

              {mockReview.praises.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Praises</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockReview.praises.map((praise, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 justify-start"
                      >
                        {praise}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {mockReview.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Issues</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockReview.issues.map((issue, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-red-50 text-red-700 border-red-200 justify-start"
                      >
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section C: AI Suggested Reply */}
          <Card className="rounded-xl shadow-sm border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">AI Suggested Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">Tone</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateReply}
                    className="h-8 text-xs"
                  >
                    Regenerate Reply
                  </Button>
                </div>
                <div className="inline-flex w-full rounded-lg border bg-muted p-1">
                  {(["Friendly", "Professional", "Formal"] as ToneOption[]).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTone === tone
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reply Text</p>
                <Textarea
                  value={aiReply}
                  onChange={(e) => setAiReply(e.target.value)}
                  className="min-h-[200px] resize-none text-base"
                  placeholder="AI-generated reply will appear here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-[720px] px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleMarkAsApproved}
              disabled={status === "approved"}
              size="lg"
              className="flex-1"
            >
              Approve Reply
            </Button>
            <Button 
              onClick={handleCopyReply}
              size="lg"
              className="flex-1"
            >
              Send to Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;
