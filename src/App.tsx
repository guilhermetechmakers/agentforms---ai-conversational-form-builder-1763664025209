import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { EmailVerificationPage } from "@/pages/auth/EmailVerificationPage";
import { PasswordResetPage } from "@/pages/auth/PasswordResetPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { AgentEditorPage } from "@/pages/agents/AgentEditorPage";
import { PublicChatPage } from "@/pages/chat/PublicChatPage";
import { SessionInspectorPage } from "@/pages/sessions/SessionInspectorPage";
import { SessionsListPage } from "@/pages/sessions/SessionsListPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { LandingPage } from "@/pages/landing/LandingPage";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { ErrorPage } from "@/pages/error/ErrorPage";
import { MaintenancePage } from "@/pages/error/MaintenancePage";

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/chat/:slug" element={<PublicChatPage />} />
          
          {/* Dashboard routes (protected) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="agents/new" element={<AgentEditorPage />} />
            <Route path="agents/:id" element={<AgentEditorPage />} />
            <Route path="agents/:id/sessions" element={<SessionsListPage />} />
            <Route path="sessions" element={<SessionsListPage />} />
            <Route path="sessions/:id" element={<SessionInspectorPage />} />
            <Route path="settings" element={<SettingsPage />} />
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
    </QueryClientProvider>
  );
}

export default App;
