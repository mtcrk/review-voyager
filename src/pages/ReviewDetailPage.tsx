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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground">{mockReview.reviewerName}</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < mockReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(mockReview.postedAt)}
              </span>
            </div>

            <Badge className={getSentimentColor(mockReview.sentiment)}>
              {mockReview.sentiment}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Original Review */}
          <Card>
            <CardHeader>
              <CardTitle>Original Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business</p>
                <p className="font-medium">{mockReview.businessName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Reviewer</p>
                <p className="font-medium">{mockReview.reviewerName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < mockReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Review</p>
                <p className="text-foreground leading-relaxed">{mockReview.text}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Posted</p>
                <p className="text-sm">{formatDate(mockReview.postedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - AI Insights & Reply */}
          <div className="space-y-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Summary</p>
                  <p className="text-sm leading-relaxed">{mockReview.summary}</p>
                </div>

                {mockReview.praises.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Praises</p>
                    <div className="flex flex-wrap gap-2">
                      {mockReview.praises.map((praise, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {praise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {mockReview.issues.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Issues</p>
                    <div className="flex flex-wrap gap-2">
                      {mockReview.issues.map((issue, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Reply */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Reply</CardTitle>
                  <Badge className={getStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tone</p>
                  <div className="inline-flex rounded-lg border bg-muted p-1">
                    {(["Friendly", "Professional", "Formal"] as ToneOption[]).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Generated Reply</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegenerateReply}
                      className="h-8"
                    >
                      Regenerate
                    </Button>
                  </div>
                  <Textarea
                    value={aiReply}
                    onChange={(e) => setAiReply(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={handleMarkAsApproved}
                    disabled={status === "approved"}
                  >
                    Mark as Approved
                  </Button>
                  <Button onClick={handleCopyReply}>Copy Reply</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;
