import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Star, Copy, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  sentiment: string;
  date: string;
  status: string;
  text: string;
  summary?: string;
  issues?: string[];
  praises?: string[];
  suggestedReply?: string;
}

export default function Reviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  // Mock data
  const reviews: Review[] = [
    {
      id: "1",
      reviewer: "John Smith",
      rating: 5,
      sentiment: "Positive",
      date: "2024-01-15",
      status: "replied",
      text: "Excellent service! Very professional and quick response time. The team went above and beyond to help with my issue.",
      summary: "Positive review praising service quality and responsiveness",
      praises: ["Professional service", "Quick response", "Above and beyond"],
      issues: [],
      suggestedReply: "Thank you so much for your kind words, John! We're thrilled to hear that our team exceeded your expectations. Your satisfaction is our top priority, and we look forward to serving you again soon!",
    },
    {
      id: "2",
      reviewer: "Sarah Johnson",
      rating: 4,
      sentiment: "Positive",
      date: "2024-01-14",
      status: "pending",
      text: "Great experience overall. Would definitely recommend to others.",
      summary: "Positive review with recommendation",
      praises: ["Great experience", "Would recommend"],
      issues: [],
      suggestedReply: "We appreciate your recommendation, Sarah! It's wonderful to know you had a great experience with us. Thank you for taking the time to share your feedback!",
    },
    {
      id: "3",
      reviewer: "Michael Brown",
      rating: 3,
      sentiment: "Neutral",
      date: "2024-01-13",
      status: "pending",
      text: "Service was okay. Could be better in some areas but overall acceptable.",
      summary: "Mixed feedback with room for improvement",
      praises: ["Acceptable service"],
      issues: ["Could be better"],
      suggestedReply: "Thank you for your honest feedback, Michael. We're always looking to improve and would love to hear more about what we could do better. Please feel free to reach out to us directly so we can address your concerns.",
    },
  ];

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.suggestedReply || "");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Reviews</h1>
        <p className="text-muted-foreground">Manage and respond to customer reviews</p>
      </div>

      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Reviewer</TableHead>
              <TableHead className="font-semibold">Rating</TableHead>
              <TableHead className="font-semibold">Sentiment</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow
                key={review.id}
                className="cursor-pointer transition-smooth hover:bg-muted/30"
                onClick={() => handleReviewClick(review)}
              >
                <TableCell className="font-medium">{review.reviewer}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getSentimentColor(review.sentiment)} variant="outline">
                    {review.sentiment}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{review.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={review.status === "replied" ? "default" : "secondary"}
                  >
                    {review.status === "replied" ? "Replied" : "Pending"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">Review Details</SheetTitle>
            <SheetDescription>
              Review from {selectedReview?.reviewer}
            </SheetDescription>
          </SheetHeader>

          {selectedReview && (
            <div className="mt-6 space-y-6">
              {/* Review Text */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Review</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedReview.text}
                </p>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Rating</h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: selectedReview.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedReview.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{selectedReview.summary}</p>
                </div>
              )}

              {/* Praises */}
              {selectedReview.praises && selectedReview.praises.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Praises</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.praises.map((praise, i) => (
                      <Badge key={i} variant="secondary" className="bg-green-100 text-green-800">
                        {praise}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {selectedReview.issues && selectedReview.issues.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Issues</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.issues.map((issue, i) => (
                      <Badge key={i} variant="secondary" className="bg-red-100 text-red-800">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggested Reply */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  AI Suggested Reply
                </h3>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Edit the suggested reply..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Reply
                </Button>
                <Button className="flex-1 gap-2">
                  <Send className="h-4 w-4" />
                  Send to Google
                </Button>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={selectedReview.status === "replied" ? "default" : "secondary"}
                  >
                    {selectedReview.status === "replied" ? "Replied" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
