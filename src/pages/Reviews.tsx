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
import { Star, Copy, Send, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Reviews() {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch reviews from Supabase
  const { data: reviews = [], isLoading } = useQuery({
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

  // Approve reply mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Reply Approved",
        description: "The reply has been marked as approved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve reply.",
        variant: "destructive",
      });
    },
  });

  // Send to Google mutation
  const sendMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      // Copy to clipboard
      await navigator.clipboard.writeText(reply);
      
      // Update status
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status: 'replied',
          approved_reply: reply,
          replied_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Reply Copied",
        description: "Reply copied to clipboard. Paste it into your Google Business console.",
      });
      setSelectedReview(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process reply.",
        variant: "destructive",
      });
    },
  });

  const handleReviewClick = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.suggested_reply || "");
  };

  const handleApprove = () => {
    if (selectedReview) {
      approveMutation.mutate(selectedReview.id);
    }
  };

  const handleSendToGoogle = () => {
    if (selectedReview && replyText) {
      sendMutation.mutate({ reviewId: selectedReview.id, reply: replyText });
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "replied":
        return { label: "Replied", variant: "default" as const };
      case "approved":
        return { label: "Approved", variant: "secondary" as const };
      default:
        return { label: "Pending", variant: "outline" as const };
    }
  };

  if (!activeBusiness) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No business selected. Please add a business first.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Reviews</h1>
        <p className="text-muted-foreground">Manage and respond to customer reviews</p>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <p className="text-muted-foreground text-lg">No reviews yet for this business.</p>
          <p className="text-sm text-muted-foreground mt-2">Reviews will appear here once they're added.</p>
        </Card>
      ) : (
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
              {reviews.map((review) => {
                const statusInfo = getStatusBadge(review.status);
                return (
                  <TableRow
                    key={review.id}
                    className="cursor-pointer transition-smooth hover:bg-muted/30"
                    onClick={() => handleReviewClick(review)}
                  >
                    <TableCell className="font-medium">{review.reviewer_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.sentiment && (
                        <Badge className={getSentimentColor(review.sentiment)} variant="outline">
                          {review.sentiment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(review.posted_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Sheet open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl">Review Details</SheetTitle>
            <SheetDescription>
              Review from {selectedReview?.reviewer_name}
            </SheetDescription>
          </SheetHeader>

          {selectedReview && (
            <div className="mt-6 space-y-6">
              {/* Review Text */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Review</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedReview.text || 'No review text'}
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
              {selectedReview.praises && Array.isArray(selectedReview.praises) && selectedReview.praises.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Praises</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.praises.map((praise: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700">
                        {praise}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {selectedReview.issues && Array.isArray(selectedReview.issues) && selectedReview.issues.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Issues</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.issues.map((issue: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-rose-50 text-rose-700">
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
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending || selectedReview.status === 'approved' || selectedReview.status === 'replied'}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedReview.status === 'approved' || selectedReview.status === 'replied' ? 'Approved' : 'Approve Reply'}
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleSendToGoogle}
                  disabled={sendMutation.isPending || !replyText}
                >
                  <Send className="h-4 w-4" />
                  Send to Google
                </Button>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={getStatusBadge(selectedReview.status).variant}>
                    {getStatusBadge(selectedReview.status).label}
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
