import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Check, Clock, Lock, Music2, MessageSquare, MessagesSquare, Zap } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TikTokConnection {
  connected: boolean;
  provider_user_id?: string;
  username?: string;
  avatar_url?: string;
  connected_at?: string;
}

export default function TikTokChannel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeBusiness } = useBusiness();
  const [connection, setConnection] = useState<TikTokConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  // Check for callback success
  useEffect(() => {
    if (searchParams.get("connected") === "1") {
      toast.success("TikTok account connected successfully.");
      // Clean up URL
      navigate("/channels/tiktok", { replace: true });
    }
    if (searchParams.get("error")) {
      toast.error("TikTok connection failed. Please try again.");
      navigate("/channels/tiktok", { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch connection status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!activeBusiness?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await supabase.functions.invoke("tiktok-auth", {
          body: { action: "status", business_id: activeBusiness.id },
        });

        if (response.error) {
          console.error("Status fetch error:", response.error);
        } else {
          setConnection(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch TikTok status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [activeBusiness?.id]);

  const handleConnect = async () => {
    if (!activeBusiness?.id) {
      toast.error("Please select a business first.");
      return;
    }

    setConnecting(true);
    try {
      console.log("Initiating TikTok OAuth for business:", activeBusiness.id);
      
      const response = await supabase.functions.invoke("tiktok-auth", {
        body: { action: "initiate", business_id: activeBusiness.id },
      });

      console.log("TikTok auth response:", response);

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to initiate OAuth");
      }

      if (!response.data?.auth_url) {
        console.error("No auth_url in response:", response.data);
        throw new Error(response.data?.error || "Failed to get authorization URL");
      }

      // Store state in sessionStorage for callback verification
      sessionStorage.setItem("tiktok_oauth_state", response.data.state);
      console.log("Redirecting to TikTok:", response.data.auth_url);

      // Redirect to TikTok
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Connect error:", error);
      toast.error(error instanceof Error ? error.message : "TikTok connection failed. Please try again.");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!activeBusiness?.id) return;

    setDisconnecting(true);
    try {
      const response = await supabase.functions.invoke("tiktok-auth", {
        body: { action: "disconnect", business_id: activeBusiness.id },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setConnection({ connected: false });
      toast.success("TikTok account disconnected.");
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };

  const comingSoonFeatures = [
    { icon: MessageSquare, label: "Inbox (DM)", description: "Manage TikTok direct messages" },
    { icon: MessagesSquare, label: "Comment management", description: "Reply to comments on your videos" },
    { icon: Zap, label: "Auto-reply workflows", description: "Automate responses based on keywords" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">TikTok</h1>
              <p className="text-sm text-muted-foreground">Channel Settings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-8 md:px-6">
        {/* Connection Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>
                  {connection?.connected
                    ? "Your TikTok account is connected"
                    : "Connect your TikTok Business account to get started"}
                </CardDescription>
              </div>
              {connection?.connected ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <Check className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Not connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : connection?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={connection.avatar_url} alt={connection.username} />
                    <AvatarFallback className="bg-black text-white">
                      <Music2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">@{connection.username}</p>
                    <p className="text-sm text-muted-foreground">
                      TikTok ID: {connection.provider_user_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connected {connection.connected_at
                        ? new Date(connection.connected_at).toLocaleDateString()
                        : "recently"}
                    </p>
                  </div>
                  <Badge variant="outline">Login Kit</Badge>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open("https://www.tiktok.com/business", "_blank")}
                  >
                    Open TikTok settings
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your TikTok account to enable future automation features.
                </p>
                {!activeBusiness && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Please create or select a business first to connect TikTok.
                  </div>
                )}
                <Button
                  className="w-full bg-black text-white hover:bg-black/90"
                  onClick={handleConnect}
                  disabled={connecting || !activeBusiness}
                >
                  {connecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Music2 className="mr-2 h-4 w-4" />
                      Connect TikTok
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Coming soon: Inbox automation
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Coming Soon
              <Badge variant="secondary">
                <Lock className="mr-1 h-3 w-3" />
                Preview
              </Badge>
            </CardTitle>
            <CardDescription>
              These features will be available once TikTok approves additional permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comingSoonFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-4 rounded-lg border border-dashed p-4 opacity-60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <feature.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{feature.label}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    Coming Soon
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disconnect Section */}
        {connection?.connected && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Disconnect your TikTok account from VoyageRespond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDisconnectDialog(true)}
                disabled={disconnecting}
              >
                Disconnect
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect TikTok?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connected TikTok account from VoyageRespond. You can reconnect anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={disconnecting}
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
