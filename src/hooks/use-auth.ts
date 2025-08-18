// src/hooks/use-api-query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, type LoginRequest, type User } from "../api/types";
import { useNavigate } from "react-router-dom";
import { useAuthProvider } from "@/Providers/hooks";

// Query Keys
export const AUTH_QUERY_KEYS = {
  USER: ["auth", "user"],
} as const;

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      authAPI.login(credentials).then((res) => res.data),
    onSuccess: (data) => {
      // Cache the user data
      queryClient.setQueryData(AUTH_QUERY_KEYS.USER, { user: data.user });
      // Invalidate and refetch any cached data that might depend on auth
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

// Check authentication status (you might need to create this endpoint in your backend)
export const useAuth = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.USER,
    queryFn: () => authAPI.checkAuth().then((res) => res.data),
    retry: false, // Don't retry auth checks
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Custom hook to get current user
export const useCurrentUser = (): {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRoot: boolean;
} => {
  const { data, isLoading, refetch } = useAuth();

  return {
    user: data || null,
    isLoading,
    isAuthenticated: !!data,
    isRoot: data?.isRoot || false,
  };
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: data, isLoading, refetch } = useAuthProvider();

  return useMutation({
    mutationFn: () => authAPI.logout().then((res) => res.data),
    onSuccess: async () => {
      // Clear all cached data
      queryClient.clear();
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local cache
      queryClient.clear();
    },
  });
};
