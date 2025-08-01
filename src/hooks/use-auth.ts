import { useApiQuery, useApiMutation } from './use-api-query';
// import { authService, LoginCredentials } from '@/api/authService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// export function useAuth() {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   const loginMutation = useApiMutation({
//     mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
//     onSuccess: (data) => {
//       toast({
//         title: 'Login successful',
//         description: `Welcome back, ${data.user.name}!`,
//       });
//       // Invalidate all queries to refresh data with new auth context
//       queryClient.invalidateQueries();
//     },
//     onError: (error) => {
//       const errorData = error.response?.data as any;
//       toast({
//         title: 'Login failed',
//         description: errorData?.message || 'Invalid credentials',
//         variant: 'destructive',
//       });
//     },
//   });

//   const logoutMutation = useApiMutation({
//     mutationFn: () => authService.logout(),
//     onSuccess: () => {
//       toast({
//         title: 'Logged out',
//         description: 'You have been logged out successfully.',
//       });
//       // Clear all cached data
//       queryClient.clear();
//     },
//     onError: () => {
//       // Still clear local data even if logout API fails
//       queryClient.clear();
//     },
//   });

//   const refreshTokenMutation = useApiMutation({
//     mutationFn: () => authService.refreshToken(),
//     onError: () => {
//       // If refresh fails, logout user
//       authService.logout();
//       queryClient.clear();
//     },
//   });

//   return {
//     user: authService.getCurrentUser(),
//     isAuthenticated: authService.isAuthenticated(),
//     login: loginMutation.mutate,
//     logout: logoutMutation.mutate,
//     refreshToken: refreshTokenMutation.mutate,
//     isLoggingIn: loginMutation.isPending,
//     isLoggingOut: logoutMutation.isPending,
//   };
// }

// export function useCurrentUser() {
//   return useApiQuery({
//     queryKey: ['current-user'],
//     queryFn: authService.getCurrentUserProfile,
//     enabled: authService.isAuthenticated(),
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// }