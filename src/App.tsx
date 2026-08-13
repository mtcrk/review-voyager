import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocaleSync } from "@/components/LocaleSync";
import { PaywallGuard } from "@/components/PaywallGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ReviewFetchProvider } from "@/contexts/ReviewFetchContext";
import { NewReviewsProvider } from "@/contexts/NewReviewsContext";

// HelmetProvider is provided by vite-react-ssg itself, so we don't wrap
// our tree in another one (that would shadow the SSG head extraction).
// BrowserRouter is also owned by vite-react-ssg (createBrowserRouter on the
// client, StaticRouter on the server). RootLayout just supplies providers.

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BusinessProvider>
          <NewReviewsProvider>
            <ReviewFetchProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <LocaleSync />
                <PaywallGuard />
                <Outlet />
              </TooltipProvider>
            </ReviewFetchProvider>
          </NewReviewsProvider>
        </BusinessProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
