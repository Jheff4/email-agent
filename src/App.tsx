import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "./pages/Dashboard";
import Agent from "./pages/Agent";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { HeaderUserArea } from "@/components/auth/header-user-area";
import Manager from "./pages/Manager";
import AuthProvider from "./Providers/AuthProvder";
import { useAuthProvider } from "./Providers/hooks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppLayout = () => {
  const location = useLocation();
  const { authenticated, user } = useAuthProvider();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 max-sm:px-3">
          <div className="flex items-center gap-4">
            {location.pathname !== "/login" && <SidebarTrigger />}
            {/* <img src={darkLogo} className="w-30 h-16" alt="" /> */}
            <h1 className="text-xl font-semibold">R2P</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {location.pathname !== "/login" && <HeaderUserArea />}
          </div>
        </header>

        {/* Sidebar */}
        {location.pathname !== "/login" && <AppSidebar />}

        {/* Main Content */}
        <main className="flex-1 pt-16 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/manager" element={user?.isRoot ? <Manager /> : <Navigate to="/" replace />} />
            <Route 
              path="/login" 
              element={authenticated ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const AppContent = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default App;
