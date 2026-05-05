import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleSync } from "@/components/LocaleSync";
import { HelmetProvider } from "react-helmet-async";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ReviewFetchProvider } from "@/contexts/ReviewFetchContext";
import { NewReviewsProvider } from "@/contexts/NewReviewsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Reviews from "./pages/Reviews";
import ReviewDetailPage from "./pages/ReviewDetailPage";
import AutoReply from "./pages/AutoReply";
import Statistics from "./pages/Statistics";
import Report from "./pages/Report";
import ChatWithReviewsPage from "./pages/ChatWithReviewsPage";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import GoogleBusinessCallback from "./pages/GoogleBusinessCallback";
import Onboarding from "./pages/Onboarding";
import Hub from "./pages/Hub";
import { Navigate, useParams } from "react-router-dom";
import InstagramSales from "./pages/automations/InstagramSales";
import GoogleReviews from "./pages/automations/GoogleReviews";
import WhatsAppAutomation from "./pages/automations/WhatsAppAutomation";
import OtherAutomations from "./pages/automations/OtherAutomations";
import TikTokChannel from "./pages/channels/TikTok";
import TikTokCallback from "./pages/TikTokCallback";
import TikTokInbox from "./pages/TikTokInbox";
import TikTokDMInbox from "./pages/TikTokDMInbox";
import TikTokReviewKit from "./pages/TikTokReviewKit";
import StoryKit from "./pages/StoryKit";
import StoryKitSettings from "./pages/StoryKitSettings";
import Contact from "./pages/Contact";
import DemoPage from "./pages/DemoPage";
import About from "./pages/About";
import Locations from "./pages/Locations";
import PlatformRatings from "./pages/PlatformRatings";
import PlatformRatingDetail from "./pages/PlatformRatingDetail";
import EmailCenter from "./pages/EmailCenter";
import RepScore from "./pages/RepScore";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import GoogleYorumCevapOrnekleri from "./pages/seo/GoogleYorumCevapOrnekleri";
import RestoranYorumCevaplari from "./pages/seo/RestoranYorumCevaplari";
import OtelYorumCevaplari from "./pages/seo/OtelYorumCevaplari";
import GooglePerformance from "./pages/GooglePerformance";
import Inbox from "./pages/Inbox";
import GoogleAccounts from "./pages/GoogleAccounts";
import AdminApifyLogs from "./pages/AdminApifyLogs";
import YouTubeInbox from "./pages/YouTubeInbox";
import SocialAnalytics from "./pages/SocialAnalytics";

// Redirect /en/blog/:slug -> /blog/:slug (preserve slug, avoid duplicate content)
const BlogRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/blog/${slug ?? ""}`} replace />;
};

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/google-business/callback" element={<GoogleBusinessCallback />} />
    <Route path="/auth/reset" element={<ResetPassword />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/hub" element={<Hub />} />
    <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/demo" element={<DemoPage />} />
    <Route path="/about" element={<About />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    {/* Redirect /en/blog/* to /blog/* to avoid duplicate content (canonical lives at /blog/...) */}
    <Route path="/en/blog" element={<Navigate to="/blog" replace />} />
    <Route path="/en/blog/:slug" element={<BlogRedirect />} />
    <Route path="/google-yorum-cevap-ornekleri" element={<GoogleYorumCevapOrnekleri />} />
    <Route path="/restoran-yorum-cevaplari" element={<RestoranYorumCevaplari />} />
    <Route path="/otel-yorum-cevaplari" element={<OtelYorumCevaplari />} />
    <Route path="/automations/instagram-sales" element={<InstagramSales />} />
    <Route path="/automations/google-reviews" element={<GoogleReviews />} />
    <Route path="/automations/whatsapp" element={<WhatsAppAutomation />} />
    <Route path="/automations/other" element={<OtherAutomations />} />
    <Route path="/channels/tiktok" element={<ProtectedRoute><TikTokChannel /></ProtectedRoute>} />
    <Route path="/auth/tiktok/callback" element={<TikTokCallback />} />
    <Route path="/tiktok-inbox" element={<ProtectedRoute><AppLayout><TikTokInbox /></AppLayout></ProtectedRoute>} />
    <Route path="/tiktok-review-kit" element={<ProtectedRoute><TikTokReviewKit /></ProtectedRoute>} />
    <Route path="/share/:businessSlug" element={<StoryKit />} />
    <Route path="/story-kit" element={<ProtectedRoute><StoryKitSettings /></ProtectedRoute>} />
    <Route path="/tiktok-dm" element={<ProtectedRoute><TikTokDMInbox /></ProtectedRoute>} />
    <Route path="/locations" element={<ProtectedRoute><AppLayout><Locations /></AppLayout></ProtectedRoute>} />
    <Route path="/locations/platform-ratings" element={<ProtectedRoute><AppLayout><PlatformRatings /></AppLayout></ProtectedRoute>} />
    <Route path="/locations/platform-ratings/:id" element={<ProtectedRoute><AppLayout><PlatformRatingDetail /></AppLayout></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/inbox" element={<ProtectedRoute><AppLayout><Inbox /></AppLayout></ProtectedRoute>} />
    <Route path="/reviews" element={<ProtectedRoute><AppLayout><Reviews /></AppLayout></ProtectedRoute>} />
    <Route path="/reviews/:id" element={<ProtectedRoute><AppLayout><ReviewDetailPage /></AppLayout></ProtectedRoute>} />
    <Route path="/auto-reply" element={<ProtectedRoute><AppLayout><AutoReply /></AppLayout></ProtectedRoute>} />
    <Route path="/statistics" element={<ProtectedRoute><AppLayout><Statistics /></AppLayout></ProtectedRoute>} />
    <Route path="/report" element={<ProtectedRoute><AppLayout><Report /></AppLayout></ProtectedRoute>} />
    <Route path="/chat" element={<ProtectedRoute><AppLayout><ChatWithReviewsPage /></AppLayout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
    <Route path="/email" element={<ProtectedRoute><AppLayout><EmailCenter /></AppLayout></ProtectedRoute>} />
    <Route path="/performance" element={<ProtectedRoute><AppLayout><GooglePerformance /></AppLayout></ProtectedRoute>} />
    <Route path="/rep-score" element={<ProtectedRoute><AppLayout><RepScore /></AppLayout></ProtectedRoute>} />
    <Route path="/google-accounts" element={<ProtectedRoute><AppLayout><GoogleAccounts /></AppLayout></ProtectedRoute>} />
    <Route path="/admin/apify-logs" element={<AdminApifyLogs />} />
    <Route path="/youtube" element={<ProtectedRoute><AppLayout><YouTubeInbox /></AppLayout></ProtectedRoute>} />
    <Route path="/social-analytics" element={<ProtectedRoute><AppLayout><SocialAnalytics /></AppLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
    <AuthProvider>
      <BusinessProvider>
        <NewReviewsProvider>
        <ReviewFetchProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LocaleSync />
            <Routes>
              {/* English mirror of every route, mounted under /en */}
              <Route path="/en/*" element={<AppRoutes />} />
              {/* Default Turkish routes */}
              <Route path="/*" element={<AppRoutes />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </ReviewFetchProvider>
        </NewReviewsProvider>
      </BusinessProvider>
    </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
