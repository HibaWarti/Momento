import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/admin/RequireAuth";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Reports from "./pages/Reports.tsx";
import ProviderRequests from "./pages/ProviderRequests.tsx";
import Users from "./pages/Users.tsx";
import Logs from "./pages/Logs.tsx";
import Categories from "./pages/Categories.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
            <Route path="/provider-requests" element={<RequireAuth><ProviderRequests /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth roles={["SUPERADMIN"]}><Users /></RequireAuth>} />
            <Route path="/logs" element={<RequireAuth roles={["SUPERADMIN"]}><Logs /></RequireAuth>} />
            <Route path="/categories" element={<RequireAuth roles={["SUPERADMIN"]}><Categories /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
