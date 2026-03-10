import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ReviewFetchProvider } from "@/contexts/ReviewFetchContext";
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
import { Navigate } from "react-router-dom";
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
import EmailCenter from "./pages/EmailCenter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BusinessProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
            <Route path="/automations/instagram-sales" element={<InstagramSales />} />
            <Route path="/automations/google-reviews" element={<GoogleReviews />} />
            <Route path="/automations/whatsapp" element={<WhatsAppAutomation />} />
            <Route path="/automations/other" element={<OtherAutomations />} />
            <Route
              path="/channels/tiktok"
              element={
                <ProtectedRoute>
                  <TikTokChannel />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/tiktok/callback" element={<TikTokCallback />} />
            <Route
              path="/tiktok-inbox"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TikTokInbox />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tiktok-review-kit"
              element={
                <ProtectedRoute>
                  <TikTokReviewKit />
                </ProtectedRoute>
              }
              />
            {/* Story Kit - Public page for customers */}
            <Route path="/share/:businessSlug" element={<StoryKit />} />
            {/* Story Kit Settings - For business owners */}
            <Route
              path="/story-kit"
              element={
                <ProtectedRoute>
                  <StoryKitSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tiktok-dm"
              element={
                <ProtectedRoute>
                  <TikTokDMInbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Locations />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reviews />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReviewDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auto-reply"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AutoReply />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Statistics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Report />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChatWithReviewsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/email"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EmailCenter />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BusinessProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
