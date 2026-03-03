import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/app-shell.jsx";
import { ProtectedRoute } from "@/components/protected-route.jsx";
import { ChatPage } from "@/pages/chat-page.jsx";
import { DashboardPage } from "@/pages/dashboard-page.jsx";
import { HistoryPage } from "@/pages/history-page.jsx";
import { LoginPage } from "@/pages/login-page.jsx";
import { NotFoundPage } from "@/pages/not-found-page.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
