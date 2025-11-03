import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  adminAPI,
  clientAPI,
  systemAPI,
  requestAPI,
  staffAPI,
  RequestQueryParams,
} from "../api/types";

// Query Keys
export const QUERY_KEYS = {
  ADMINS: ["admins"],
  CLIENTS: ["clients"],
  CLIENT: (id: string) => ["clients", id],
  STAFF: ["staff"],
  ALL_STAFF: ["all-staff"],
  STAFF_MEMBER: (id: string) => ["staff", id],
  REQUESTS: ["requests"],
  // REQUESTS_PAGINATED: (params: RequestQueryParams) => ["requests", "paginated", params],
  // REQUESTS_COMPLETED: ["requests", "completed"],
  // REQUESTS_ONGOING: ["requests", "ongoing"],
  // REQUESTS_PENDING: ["requests", "pending"],
  SYSTEM_HEALTH: ["system", "health"],
  SYSTEM_STATS: ["system", "stats"],
} as const;

// Admin Hooks
export const useAdmins = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMINS,
    queryFn: () => adminAPI.getAll().then((res) => res.data),
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_STAFF });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.update,
    
    onMutate: async (updatedAdmin) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMINS });
      
      const previousAdmins = queryClient.getQueryData(QUERY_KEYS.ADMINS);

      // Optimistically update the admin
      queryClient.setQueryData(QUERY_KEYS.ADMINS, (oldData: any) => {
        if (!oldData || !oldData.admins) return oldData;

        const updatedAdmins = oldData.admins.map((admin: any) => {
          if (admin.id === updatedAdmin.id) {
            return {
              ...admin,
              ...updatedAdmin,
              updatedAt: new Date().toISOString(),
            };
          }
          return admin;
        });

        return { ...oldData, admins: updatedAdmins };
      });

      return { previousAdmins };
    },

    onError: (err, updatedAdmin, context) => {
      if (context?.previousAdmins) {
        queryClient.setQueryData(QUERY_KEYS.ADMINS, context.previousAdmins);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_STAFF });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_STAFF });
    },
  });
};

// Client Hooks
export const useClients = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CLIENTS,
    queryFn: () => clientAPI.getAll().then((res) => res.data),
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CLIENT(id),
    queryFn: () => clientAPI.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

// System Hooks
export const useSystemHealth = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_HEALTH,
    queryFn: () => systemAPI.health().then((res) => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSystemStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_STATS,
    queryFn: () => systemAPI.stats().then((res) => res.data),
  });
};

// Request Hooks

// Main hook for fetching all requests (used in ClientRequestsTable)
export const useRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS,
    queryFn: async () => {
      // Fetch ALL requests by not providing page/limit params
      // This tells the backend to return all records
      const response = await requestAPI.getAll();
      // The response should have a 'requests' property based on your backend
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  });
};

// Hook for paginated requests (if your backend supports it)
// export const usePaginatedRequests = (params: RequestQueryParams = {}) => {
//   return useQuery({
//     queryKey: QUERY_KEYS.REQUESTS_PAGINATED(params),
//     queryFn: async () => {
//       const response = await requestAPI.getPaginated(params);
//       return response.data;
//     },
//     placeholderData: keepPreviousData,
//     staleTime: 10000,
//   });
// };

// export const useCompletedRequests = () => {
//   return useQuery({
//     queryKey: QUERY_KEYS.REQUESTS_COMPLETED,
//     queryFn: () => requestAPI.getCompleted().then((res) => res.data),
//   });
// };

// export const useOngoingRequests = () => {
//   return useQuery({
//     queryKey: QUERY_KEYS.REQUESTS_ONGOING,
//     queryFn: () => requestAPI.getOngoing().then((res) => res.data),
//   });
// };

// export const usePendingRequests = () => {
//   return useQuery({
//     queryKey: QUERY_KEYS.REQUESTS_PENDING,
//     queryFn: () => requestAPI.getPending().then((res) => res.data),
//   });
// };

// Staff Hooks
export const useStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF,
    queryFn: () => staffAPI.getStaff().then((res) => res.data),
  });
};

export const useAllStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_STAFF,
    queryFn: () => staffAPI.getAllStaff().then((res) => res.data),
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF_MEMBER(id),
    queryFn: () => staffAPI.getById(id).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffAPI.create,
    onSuccess: () => {
      // Invalidate both STAFF and ALL_STAFF to keep dropdowns in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_STAFF });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      staffAPI.update(id, data),
    onSuccess: async (_, variables) => {
      queryClient.setQueryData(QUERY_KEYS.STAFF, (oldData: any) => {
        if (!oldData || !oldData.staff || !Array.isArray(oldData.staff)) {
          return oldData;
        }

        const updatedStaff = oldData.staff.map((agent: any) => {
          if (agent.id === variables.id) {
            const updatedAgent = { ...agent, ...variables.data };
            return updatedAgent;
          }
          return agent;
        });

        const newData = { ...oldData, staff: updatedStaff };
        return newData;
      });
      
      // Invalidate both STAFF and ALL_STAFF to keep dropdowns in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_STAFF });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffAPI.delete,
    onSuccess: () => {
      // Invalidate both STAFF and ALL_STAFF to keep dropdowns in sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_STAFF });
    },
  });
};