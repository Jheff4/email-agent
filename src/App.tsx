import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "./pages/Dashboard";
// import Clients from "./pages/Clients";
import Staff from "./pages/Staff";
// import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import Login from "./pages/Login";
import { HeaderUserArea } from "@/components/auth/header-user-area";

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

const App = () => {
  const loggedIn = true

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              {/* Header */}
              <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 max-sm:px-3">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold">Staff Monitor</h1>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <HeaderUserArea />
                </div>
              </header>

              {/* Sidebar */}
              {loggedIn ? <AppSidebar /> : null}

              {/* Main Content */}
              <main className="flex-1 pt-16 w-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  {/* <Route path="/clients" element={<Clients />} /> */}
                  <Route path="/staff" element={<Staff />} />
                  {/* <Route path="/settings" element={<Settings />} /> */}
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    {/* React Query Devtools - only in development */}
    {process.env.NODE_ENV === 'development' && (
      <ReactQueryDevtools initialIsOpen={false} />
    )}
    </QueryClientProvider>
  )
}

export default App;
