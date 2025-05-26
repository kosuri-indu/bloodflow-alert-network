
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import GovernmentLoginPage from "./pages/GovernmentLoginPage";
import GovernmentDashboardPage from "./pages/GovernmentDashboardPage";
import DonorRegisterPage from "./pages/DonorRegisterPage";
import DonorDashboardPage from "./pages/DonorDashboardPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route for hospitals
const HospitalProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userType } = useAuth();
  
  // Only hospitals are allowed to access hospital routes
  if (!isAuthenticated || userType !== 'hospital') {
    return <Navigate to="/register" />;
  }
  
  return <>{children}</>;
};

// Protected route for government officials
const GovernmentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userType } = useAuth();
  
  // Only government officials are allowed to access government routes
  if (!isAuthenticated || userType !== 'government') {
    return <Navigate to="/gov-login" />;
  }
  
  return <>{children}</>;
};

// Protected route for donors
const DonorProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userType } = useAuth();
  
  // Only donors are allowed to access donor routes
  if (!isAuthenticated || userType !== 'donor') {
    return <Navigate to="/donor-register" />;
  }
  
  return <>{children}</>;
};

// The Routes component that uses AuthProvider
const AppRoutes = () => (
  <AuthProvider>
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/gov-login" element={<GovernmentLoginPage />} />
          <Route path="/donor-register" element={<DonorRegisterPage />} />
          <Route path="/dashboard" element={
            <HospitalProtectedRoute>
              <DashboardPage />
            </HospitalProtectedRoute>
          } />
          <Route path="/government-dashboard" element={
            <GovernmentProtectedRoute>
              <GovernmentDashboardPage />
            </GovernmentProtectedRoute>
          } />
          <Route path="/donor-dashboard" element={
            <DonorProtectedRoute>
              <DonorDashboardPage />
            </DonorProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </AuthProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
