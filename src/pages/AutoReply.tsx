import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";

export default function AutoReply() {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [tone, setTone] = useState("friendly");
  const [language, setLanguage] = useState("en");
  const [reviewRule, setReviewRule] = useState("positive");

  const toneOptions = [
    { value: "formal", label: "Formal", description: "Professional and business-like" },
    { value: "friendly", label: "Friendly", description: "Warm and approachable" },
    { value: "playful", label: "Playful", description: "Fun and casual" },
  ];

  const previewReplies = {
    formal: "Thank you for your review. We appreciate your feedback and are pleased to have met your expectations. We look forward to serving you again in the future.",
    friendly: "Thank you so much for your wonderful review! We're thrilled to hear you had a great experience. Looking forward to seeing you again soon! 😊",
    playful: "Wow, thank you! 🎉 Your amazing review made our day! We can't wait to welcome you back for more awesome experiences! ⭐",
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Auto Reply</h1>
        <p className="text-muted-foreground">Configure AI-powered automatic responses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enable Auto Reply */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Auto Reply Status</CardTitle>
              <CardDescription>
                Enable AI to automatically respond to reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-reply" className="text-base font-medium">
                    Auto Reply
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {autoReplyEnabled ? "Currently active" : "Currently inactive"}
                  </p>
                </div>
                <Switch
                  id="auto-reply"
                  checked={autoReplyEnabled}
                  onCheckedChange={setAutoReplyEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tone Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Response Tone</CardTitle>
              <CardDescription>
                Choose the tone for AI-generated responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {toneOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
                    tone === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/30"
                  }`}
                  onClick={() => setTone(option.value)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                        tone === option.value
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {tone === option.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Language & Rules */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Language & Rules</CardTitle>
              <CardDescription>
                Configure language and reply rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Turkish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Reply Rules</Label>
                <RadioGroup value={reviewRule} onValueChange={setReviewRule}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive" className="font-normal cursor-pointer">
                      Only positive reviews (4-5 stars)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      All reviews
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="shadow-card sticky top-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Preview</CardTitle>
              </div>
              <CardDescription>
                Example AI-generated response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {previewReplies[tone as keyof typeof previewReplies]}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tone:</span>
                  <span className="font-medium text-foreground capitalize">{tone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium text-foreground">
                    {language === "en" ? "English" : "Turkish"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Rule:</span>
                  <span className="font-medium text-foreground">
                    {reviewRule === "positive" ? "Positive only" : "All reviews"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
