import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import PurchaseOrders from "@/pages/PurchaseOrders";
import SalesOrders from "@/pages/SalesOrders";
import Financials from "@/pages/Financials";
import Inventory from "@/pages/Inventory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <MainLayout onLogout={logout}>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/purchase-orders"
        element={
          <MainLayout onLogout={logout}>
            <PurchaseOrders />
          </MainLayout>
        }
      />
      <Route
        path="/sales-orders"
        element={
          <MainLayout onLogout={logout}>
            <SalesOrders />
          </MainLayout>
        }
      />
      <Route
        path="/financials"
        element={
          <MainLayout onLogout={logout}>
            <Financials />
          </MainLayout>
        }
      />
      <Route
        path="/inventory"
        element={
          <MainLayout onLogout={logout}>
            <Inventory />
          </MainLayout>
        }
      />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
