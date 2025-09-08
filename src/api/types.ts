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
}

export interface Request {
  id: string;
  clientId: string;
  staffId: string;
  status: "ongoing" | "pending" | "Overdue" | "completed";
  summary: string;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  page: number;
  limit: number;
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
  getAll: () => api.get<Request[]>("/api/requests"),
  getCompleted: () => api.get<Request[]>("/api/requests/completed"),
  getOngoing: () => api.get<Request[]>("/api/requests/ongoing"),
  getPending: () => api.get<Request[]>("/api/requests/pending"),
  reassign: (requestId: string, assigneeId: string) =>
    api.post(`/api/requests/${requestId}/reassign`, { staffId: assigneeId }),
};

// Staff APIs
export const staffAPI = {
  getStaff: () => api.get<Staff[]>("/api/staff"),

  getAllStaff: () => api.get<Staff[]>("/api/staff/all"),

  create: (staffData: Omit<Staff, "id">) =>
    api.post<Staff>("/api/staff", staffData),

  getById: (id: string) => api.get<Staff>(`/api/staff/${id}`),

  update: (id: string, staffData: Partial<Staff>) =>
    api.put<Staff>(`/api/staff/${id}`, staffData),

  delete: (id: string) => api.delete(`/api/staff/${id}`),
};
