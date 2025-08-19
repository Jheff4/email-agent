import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI, clientAPI, systemAPI, requestAPI, staffAPI } from "../api";

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
  REQUESTS_CANCELLED: ["requests", "cancelled"],
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
    onSuccess: () => {
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
export const useRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS,
    queryFn: () => requestAPI.getAll().then((res) => res.data),
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

export const useCancelledRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REQUESTS_CANCELLED,
    queryFn: () => requestAPI.getCancelled().then((res) => res.data),
  });
};

// Staff Hooks
export const useStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF,
    queryFn: () => staffAPI.getAll().then((res) => res.data),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.STAFF_MEMBER(variables.id),
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
