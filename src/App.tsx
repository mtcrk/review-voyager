import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LocaleSync } from "@/components/LocaleSync";
import { HelmetProvider } from "react-helmet-async";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ReviewFetchProvider } from "@/contexts/ReviewFetchContext";
import { NewReviewsProvider } from "@/contexts/NewReviewsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigate, useParams } from "react-router-dom";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reviews = lazy(() => import("./pages/Reviews"));
const ReviewDetailPage = lazy(() => import("./pages/ReviewDetailPage"));
const AutoReply = lazy(() => import("./pages/AutoReply"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Report = lazy(() => import("./pages/Report"));
const ChatWithReviewsPage = lazy(() => import("./pages/ChatWithReviewsPage"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GoogleBusinessCallback = lazy(() => import("./pages/GoogleBusinessCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Hub = lazy(() => import("./pages/Hub"));
const InstagramSales = lazy(() => import("./pages/automations/InstagramSales"));
const GoogleReviews = lazy(() => import("./pages/automations/GoogleReviews"));
const WhatsAppAutomation = lazy(() => import("./pages/automations/WhatsAppAutomation"));
const OtherAutomations = lazy(() => import("./pages/automations/OtherAutomations"));
const TikTokChannel = lazy(() => import("./pages/channels/TikTok"));
const TikTokCallback = lazy(() => import("./pages/TikTokCallback"));
const TikTokInbox = lazy(() => import("./pages/TikTokInbox"));
const TikTokDMInbox = lazy(() => import("./pages/TikTokDMInbox"));
const TikTokReviewKit = lazy(() => import("./pages/TikTokReviewKit"));
const StoryKit = lazy(() => import("./pages/StoryKit"));
const StoryKitSettings = lazy(() => import("./pages/StoryKitSettings"));
const Contact = lazy(() => import("./pages/Contact"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const About = lazy(() => import("./pages/About"));
const Locations = lazy(() => import("./pages/Locations"));
const PlatformRatings = lazy(() => import("./pages/PlatformRatings"));
const PlatformRatingDetail = lazy(() => import("./pages/PlatformRatingDetail"));
const EmailCenter = lazy(() => import("./pages/EmailCenter"));
const RepScore = lazy(() => import("./pages/RepScore"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const GoogleYorumCevapOrnekleri = lazy(() => import("./pages/seo/GoogleYorumCevapOrnekleri"));
const RestoranYorumCevaplari = lazy(() => import("./pages/seo/RestoranYorumCevaplari"));
const OtelYorumCevaplari = lazy(() => import("./pages/seo/OtelYorumCevaplari"));
const GooglePerformance = lazy(() => import("./pages/GooglePerformance"));
const Inbox = lazy(() => import("./pages/Inbox"));
const GoogleAccounts = lazy(() => import("./pages/GoogleAccounts"));
const AdminApifyLogs = lazy(() => import("./pages/AdminApifyLogs"));
const YouTubeInbox = lazy(() => import("./pages/YouTubeInbox"));
const SocialAnalytics = lazy(() => import("./pages/SocialAnalytics"));

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
