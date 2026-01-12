import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  Shield, 
  Play, 
  FileText, 
  AlertTriangle,
  Video,
  MessageSquare,
  Sparkles,
  Send,
  RefreshCw,
  ToggleLeft,
  Download,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CHECKLIST_ITEMS = [
  {
    id: "scopes",
    label: "Minimal API scopes requested",
    description: "Only user.info.basic, video.list, comment.list, comment.reply scopes",
    completed: true,
  },
  {
    id: "no-auto",
    label: "No automatic replies",
    description: "All replies require manual user approval before sending",
    completed: true,
  },
  {
    id: "demo-mode",
    label: "Demo Mode is sandbox-only",
    description: "Simulated features are hidden in production builds",
    completed: true,
  },
  {
    id: "privacy",
    label: "Privacy notice present",
    description: "Clear disclosure about data handling and user responsibility",
    completed: true,
  },
  {
    id: "rate-limit",
    label: "Rate limit handling",
    description: "Exponential backoff with user-friendly error messages",
    completed: true,
  },
  {
    id: "token-refresh",
    label: "Token refresh mechanism",
    description: "Automatic token refresh before expiration",
    completed: true,
  },
  {
    id: "error-handling",
    label: "Robust error handling",
    description: "Clear error messages and logging for debugging",
    completed: true,
  },
  {
    id: "manual-approval",
    label: "Manual approval workflow",
    description: "AI suggests, user reviews and explicitly approves",
    completed: true,
  },
];

const DEMO_SCRIPT = [
  {
    step: 1,
    title: "Connect TikTok Account",
    description: "Navigate to TikTok channel page and click 'Connect TikTok'. Complete OAuth flow.",
    icon: <Video className="h-5 w-5" />,
    duration: "15 sec",
  },
  {
    step: 2,
    title: "Refresh Videos",
    description: "Click 'Videoları Yenile' button to fetch videos from TikTok API.",
    icon: <RefreshCw className="h-5 w-5" />,
    duration: "10 sec",
  },
  {
    step: 3,
    title: "Select a Video",
    description: "Click on any video from the list to view its comments.",
    icon: <Eye className="h-5 w-5" />,
    duration: "5 sec",
  },
  {
    step: 4,
    title: "Fetch Comments",
    description: "Click refresh to fetch comments. If empty in sandbox, proceed to step 5.",
    icon: <MessageSquare className="h-5 w-5" />,
    duration: "10 sec",
  },
  {
    step: 5,
    title: "Enable Demo Mode",
    description: "Toggle 'Demo Mod' switch and click 'Demo Yorumları Yükle' to load sample comments.",
    icon: <ToggleLeft className="h-5 w-5" />,
    duration: "10 sec",
  },
  {
    step: 6,
    title: "Generate AI Suggestions",
    description: "Click 'AI Yanıt' button on any comment. Show the 3 different tone suggestions.",
    icon: <Sparkles className="h-5 w-5" />,
    duration: "15 sec",
  },
  {
    step: 7,
    title: "Approve & Send (Simulated)",
    description: "Select a suggestion, review in textarea, click 'Onayla ve Gönder (Simüle)'. Show status update to 'Gönderildi'.",
    icon: <Send className="h-5 w-5" />,
    duration: "15 sec",
  },
  {
    step: 8,
    title: "Explain Production Behavior",
    description: "Highlight: In production, this uses real TikTok API. Manual approval is always required. No auto-replies.",
    icon: <Shield className="h-5 w-5" />,
    duration: "20 sec",
  },
];

export default function TikTokReviewKit() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">TikTok App Review Kit</h1>
        </div>
        <p className="text-muted-foreground">
          Checklist and demo script for TikTok production app approval submission
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-6">
        <Button asChild variant="outline">
          <Link to="/tiktok-inbox">← TikTok Inbox</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/channels/tiktok">TikTok Bağlantısı</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Compliance Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Compliance Checklist
            </CardTitle>
            <CardDescription>
              All items must be completed before submitting for TikTok production approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CHECKLIST_ITEMS.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 ${item.completed ? "text-green-500" : "text-muted-foreground"}`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.completed && (
                        <Badge variant="secondary" className="text-xs">Completed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Important Review Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>• <strong>Keep your camera on the UI</strong> at all times during the demo video.</p>
            <p>• <strong>Clearly show</strong> the "AI önerir; kullanıcı onaylar" text in the interface.</p>
            <p>• <strong>Highlight</strong> that the send button requires explicit user click.</p>
            <p>• <strong>Mention verbally</strong> that there are no automatic/scheduled replies.</p>
            <p>• <strong>Demo Mode</strong> simulates the workflow; production uses real TikTok API.</p>
            <p>• <strong>Total video length</strong> should be 1-2 minutes.</p>
          </CardContent>
        </Card>

        {/* Demo Script */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Demo Video Script (1-2 min)
            </CardTitle>
            <CardDescription>
              Follow these steps while recording your screen for TikTok app review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {DEMO_SCRIPT.map((step) => (
                  <div key={step.step} className="relative pl-8 pb-6 border-l-2 border-muted last:border-l-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 bg-background border-2 border-primary rounded-full p-2">
                      {step.icon}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">Step {step.step}</Badge>
                        <Badge variant="secondary" className="text-xs">{step.duration}</Badge>
                      </div>
                      <h4 className="font-semibold text-lg">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Script to Read */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Voiceover Script (Optional)
            </CardTitle>
            <CardDescription>
              Read this while recording if you want to add narration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg space-y-4 text-sm italic">
              <p>
                "This is VoyageRespond's TikTok comment management feature. 
                Let me show you how it works."
              </p>
              <p>
                "First, I'll connect my TikTok business account using the secure OAuth flow."
              </p>
              <p>
                "Now I can see all my videos. Let me select one to view its comments."
              </p>
              <p>
                "For each comment, I can click 'AI Reply' to generate suggestions. 
                The AI provides three different tones: friendly, professional, and witty."
              </p>
              <p>
                "Important: The AI only suggests - it never sends automatically. 
                I must review, edit if needed, and explicitly click 'Approve & Send'."
              </p>
              <p>
                "As you can see, there are no automatic or scheduled replies. 
                Every response requires manual user approval before posting to TikTok."
              </p>
              <p>
                "Thank you for reviewing our application."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Submission Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Privacy Policy URL</p>
                  <p className="text-sm text-muted-foreground">https://app.voyagerespond.com/privacy-policy</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open('/privacy-policy', '_blank')}>
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Terms of Service URL</p>
                  <p className="text-sm text-muted-foreground">https://app.voyagerespond.com/terms-of-service</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open('/terms-of-service', '_blank')}>
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">App Description</p>
                  <p className="text-sm text-muted-foreground">
                    VoyageRespond helps businesses manage TikTok comments with AI-suggested replies. 
                    All replies require manual user approval. No automatic sending.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
