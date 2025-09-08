import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  adminAPI,
  clientAPI,
  systemAPI,
  requestAPI,
  staffAPI,
} from "../api/types";

// Query Keys
export const QUERY_KEYS = {
  ADMINS: ["admins"],
  CLIENTS: ["clients"],
  CLIENT: (id: string) => ["clients", id],
  STAFF: ["staff"],
  STAFF_MEMBER: (id: string) => ["staff", id],
  REQUESTS: ["requests"],
  REQUESTS_COMPLETED: ["requests", "completed"],
  REQUESTS_ONGOING: ["requests", "ongoing"],
  REQUESTS_PENDING: ["requests", "pending"],
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
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
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
export const useRequests = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['requests', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Update your API call to include the pagination parameters
      const response = await requestAPI.getAll();
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useCompletedRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS_COMPLETED,
    queryFn: () => requestAPI.getCompleted().then((res) => res.data),
  });
};

export const useOngoingRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS_ONGOING,
    queryFn: () => requestAPI.getOngoing().then((res) => res.data),
  });
};

export const usePendingRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS_PENDING,
    queryFn: () => requestAPI.getPending().then((res) => res.data),
  });
};

// Staff Hooks
export const useStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF,
    queryFn: () => staffAPI.getStaff().then((res) => res.data),
  });
};

export const useAllStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF,
    queryFn: () => staffAPI.getAllStaff().then((res) => res.data),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
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
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
    },
  });
};
