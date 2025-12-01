import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Reviews from "./pages/Reviews";
import ReviewDetailPage from "./pages/ReviewDetailPage";
import AutoReply from "./pages/AutoReply";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import GoogleBusinessCallback from "./pages/GoogleBusinessCallback";

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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/google-business/callback" element={<GoogleBusinessCallback />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
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
