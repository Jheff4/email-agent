import api from "@/lib/api";

// Types (create these based on your backend models)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface User {
  id?: string;
  name: string;
  isRoot: boolean;
  role: "admin" | "staff";
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  assignedDomains?: string[];
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "Active" | "Inactive";
  avatar?: string;
  activeRequests: number;
  completedRequests: number;
  responseTime: string;
  joinedDate: string;
  assignedDomains?: string[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  assignedDomains?: string[];
  isAdmin?: boolean;
}

export interface Request {
  id: string;
  clientId: string;
  staffId: string;
  status: "ongoing" | "pending" | "completed";
  summary: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  staff?: Staff;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request query parameters
export interface RequestQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  staffId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Admin APIs
export const adminAPI = {
  create: (userData: Omit<Manager, "id" | "createdAt" | "updatedAt">) =>
    api.post<User>("/api/admin/create", userData),

  update: (userData: Omit<Manager, "createdAt" | "updatedAt">) =>
    api.put<User>(`/api/admin/${userData.id}`, userData),

  delete: (id: string) => api.delete<User>(`/api/admin/${id}`),

  getAll: () => api.get<Manager[]>("/api/admin/get"),
};

// Authentication APIs
export const authAPI = {
  login: (credentials: LoginRequest) =>
    api.post<LoginResponse>("/api/auth/login", credentials),

  logout: () => api.post<LogoutResponse>("/api/auth/logout"),

  checkAuth: () => api.get<User>("/api/auth/check-auth"),

  changePassword: ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) =>
    api.post<User>("/api/auth/change-password", {
      currentPassword,
      newPassword,
    }),
};

// Client APIs
export const clientAPI = {
  getAll: () => api.get<Client[]>("/api/clients"),

  getById: (id: string) => api.get<Client>(`/api/clients/${id}`),
};

// System APIs
export const systemAPI = {
  health: () => api.get("/api/health"),

  stats: () => api.get("/api/health/stats"),
};

// Request APIs
export const requestAPI = {
  // Get all requests without pagination (for backward compatibility)
  // When no page/limit params are provided, backend returns ALL requests
  getAll: () => api.get<{ requests: Request[]; pagination: any }>("/api/requests"),
  
  // Get paginated requests
  getPaginated: (params: RequestQueryParams = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.staffId) queryParams.append('staffId', params.staffId);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/requests?${queryString}` : '/api/requests';
    
    return api.get<PaginatedResponse<Request>>(url);
  },
  
  getCompleted: () => api.get<{ requests: Request[] }>("/api/requests/completed"),
  getOngoing: () => api.get<{ requests: Request[] }>("/api/requests/ongoing"),
  getPending: () => api.get<{ requests: Request[] }>("/api/requests/pending"),
  reassign: (requestId: string, assigneeId: string) =>
    api.post(`/api/requests/${requestId}/reassign`, { staffId: assigneeId }),
  updateStatus: (requestId: string, status: string) =>
    api.patch(`/api/requests/${requestId}/status`, { status }),
};

// Staff APIs
export const staffAPI = {
  getStaff: () => api.get<Staff[]>("/api/staff"),

  getAllStaff: () => api.get<Staff[]>("/api/staff/assigned"),

  create: (staffData: Omit<Staff, "id">) =>
    api.post<Staff>("/api/staff", staffData),

  getById: (id: string) => api.get<Staff>(`/api/staff/${id}`),

  update: (id: string, staffData: Partial<Staff>) =>
    api.put<Staff>(`/api/staff/${id}`, staffData),

  delete: (id: string) => api.delete(`/api/staff/${id}`),
};