
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Reset from "./pages/Reset";
import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import ControleParcelas from "./pages/ControleParcelas";
import VrVa from "./pages/VrVa";
import Investimentos from "./pages/Investimentos";
import Objetivos from "./pages/Objetivos";
import Faturas from "./pages/Faturas";
import Configuracoes from "./pages/Configuracoes";
import Planejamento from "./pages/Planejamento";
import NotFound from "./pages/NotFound";
import Ajuda from "./pages/Ajuda";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset" element={<Reset />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/receitas" 
                element={
                  <ProtectedRoute>
                    <Receitas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/despesas" 
                element={
                  <ProtectedRoute>
                    <Despesas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/planejamento" 
                element={
                  <ProtectedRoute>
                    <Planejamento />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vr-va" 
                element={
                  <ProtectedRoute>
                    <VrVa />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/investimentos" 
                element={
                  <ProtectedRoute>
                    <Investimentos />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/objetivos" 
                element={
                  <ProtectedRoute>
                    <Objetivos />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/faturas" 
                element={
                  <ProtectedRoute>
                    <Faturas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/controle-parcelas" 
                element={
                  <ProtectedRoute>
                    <ControleParcelas />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ajuda" 
                element={
                  <ProtectedRoute>
                    <Ajuda />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
