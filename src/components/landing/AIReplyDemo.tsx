import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles, Loader2, RefreshCw, Copy, Check, MessageSquare, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SampleReview {
  id: string;
  text: string;
  rating: number;
  reviewer: string;
  sentiment: "positive" | "neutral" | "negative";
}

const sampleReviews: SampleReview[] = [
  {
    id: "1",
    text: "Food was amazing but the service was a bit slow. We waited 30 minutes for our main course. Would still come back though!",
    rating: 4,
    reviewer: "Ahmet Y.",
    sentiment: "neutral",
  },
  {
    id: "2",
    text: "Best coffee in town! The barista was super friendly and the atmosphere is perfect for working. Highly recommend!",
    rating: 5,
    reviewer: "Sarah M.",
    sentiment: "positive",
  },
  {
    id: "3",
    text: "Disappointed with my experience. The pizza was cold and the staff seemed uninterested. Won't be coming back.",
    rating: 2,
    reviewer: "Can K.",
    sentiment: "negative",
  },
];

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: "text-green-600", bg: "bg-green-100", label: "Positive" },
  neutral: { icon: Meh, color: "text-amber-600", bg: "bg-amber-100", label: "Neutral" },
  negative: { icon: ThumbsDown, color: "text-red-600", bg: "bg-red-100", label: "Negative" },
};

export function AIReplyDemo() {
  const [selectedReview, setSelectedReview] = useState<SampleReview>(sampleReviews[0]);
  const [generatedReply, setGeneratedReply] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateReply = async () => {
    setIsGenerating(true);
    setGeneratedReply("");
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: {
          reviewText: selectedReview.text,
          rating: selectedReview.rating,
          tone: "friendly",
          language: "en",
          summary: selectedReview.sentiment === "positive" 
            ? "Customer had a great experience" 
            : selectedReview.sentiment === "negative"
            ? "Customer was dissatisfied with the experience"
            : "Customer had mixed feelings about the experience",
          issues: selectedReview.sentiment === "negative" || selectedReview.sentiment === "neutral"
            ? ["Service quality mentioned"]
            : [],
          praises: selectedReview.sentiment === "positive" || selectedReview.sentiment === "neutral"
            ? ["Product quality appreciated"]
            : [],
        },
      });

      if (error) throw error;

      setGeneratedReply(data.reply);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating reply:", error);
      toast.error("Failed to generate reply. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    toast.success("Reply copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectReview = (review: SampleReview) => {
    setSelectedReview(review);
    setGeneratedReply("");
    setHasGenerated(false);
  };

  const SentimentIcon = sentimentConfig[selectedReview.sentiment].icon;

  return (
    <section id="demo" className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Interactive Demo
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Try AI Reply Suggestions
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how our AI generates professional, on-brand replies for any review.
          Select a sample review and click generate.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Review Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Select a Review
            </h3>
            <div className="space-y-3">
              {sampleReviews.map((review) => {
                const config = sentimentConfig[review.sentiment];
                const Icon = config.icon;
                return (
                  <button
                    key={review.id}
                    onClick={() => handleSelectReview(review)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedReview.id === review.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{review.reviewer}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{review.text}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: AI Reply Generation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              AI-Generated Reply
            </h3>
            
            {/* Selected Review Preview */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Selected Review</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">{selectedReview.reviewer}</span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < selectedReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sentimentConfig[selectedReview.sentiment].bg} ${sentimentConfig[selectedReview.sentiment].color}`}>
                  <SentimentIcon className="w-3 h-3" />
                  {sentimentConfig[selectedReview.sentiment].label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground italic">"{selectedReview.text}"</p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReply}
              disabled={isGenerating}
              className="w-full gradient-primary text-white hover:opacity-90 transition-all"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Reply...
                </>
              ) : hasGenerated ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Reply
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Reply
                </>
              )}
            </Button>

            {/* Generated Reply */}
            {generatedReply && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <Textarea
                    value={generatedReply}
                    readOnly
                    className="min-h-[150px] resize-none bg-primary/5 border-primary/20 focus:border-primary"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="absolute top-2 right-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This is a demo. Sign up to use AI replies on your real Google reviews.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!generatedReply && !isGenerating && (
              <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-muted/10 text-center">
                <Sparkles className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click "Generate AI Reply" to see the magic ✨
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
