import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthPage } from "@/pages/auth/AuthPage";
import { EmailVerificationPage } from "@/pages/auth/EmailVerificationPage";
import { PasswordResetPage } from "@/pages/auth/PasswordResetPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { AgentEditorPage } from "@/pages/agents/AgentEditorPage";
import { PublicChatPage } from "@/pages/chat/PublicChatPage";
import { SessionInspectorPage } from "@/pages/sessions/SessionInspectorPage";
import { SessionsListPage } from "@/pages/sessions/SessionsListPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AboutHelpPage } from "@/pages/docs/AboutHelpPage";
import { KnowledgePage } from "@/pages/knowledge/KnowledgePage";
import { LandingPage } from "@/pages/landing/LandingPage";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { ErrorPage } from "@/pages/error/ErrorPage";
import { MaintenancePage } from "@/pages/error/MaintenancePage";
import { PrivacyPolicyPage } from "@/pages/legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/legal/TermsOfServicePage";
import { CookiePolicyPage } from "@/pages/legal/CookiePolicyPage";
import { DataProcessingAddendumPage } from "@/pages/legal/DataProcessingAddendumPage";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/chat/:slug" element={<PublicChatPage />} />
          
          {/* Legal & Compliance routes */}
          <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/legal/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/legal/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/legal/data-processing-addendum" element={<DataProcessingAddendumPage />} />
          
          {/* Dashboard routes (protected) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="agents/new" element={<AgentEditorPage />} />
            <Route path="agents/:id" element={<AgentEditorPage />} />
            <Route path="agents/:id/sessions" element={<SessionsListPage />} />
            <Route path="sessions" element={<SessionsListPage />} />
            <Route path="sessions/:id" element={<SessionInspectorPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<AboutHelpPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
          
          {/* Error pages */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ErrorPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
      <CookieConsentBanner />
    </QueryClientProvider>
  );
}

export default App;
