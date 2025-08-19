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
  createdAt?: string;
  updatedAt?: string;
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
  joinedDate: Date;
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
}

export interface Request {
  id: string;
  clientId: string;
  staffId: string;
  status: 'Ongoing' | 'Pending' | 'Overdue' | 'Completed';
  summary: string;
  createdAt: string;
  updatedAt: string;
}

// Admin APIs
export const adminAPI = {
  create: (userData: Omit<Manager, "id" | "createdAt" | "updatedAt">) =>
    api.post<User>("/api/admin/create", userData),

  getAll: () => api.get<Manager[]>("/api/admin/get"),
};

// Authentication APIs
export const authAPI = {
  login: (credentials: LoginRequest) =>
    api.post<LoginResponse>("/api/auth/login", credentials),

  logout: () => api.post<LogoutResponse>("/api/auth/logout"),

  checkAuth: () => api.get<User>("/api/auth/check-auth"),
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
  getAll: () =>
    api.get<Request[]>('/api/requests'),
  
  getCompleted: () =>
    api.get<Request[]>('/api/requests/completed'),
  
  getOngoing: () =>
    api.get<Request[]>('/api/requests/ongoing'),
  
  getPending: () =>
    api.get<Request[]>('/api/requests/pending'),
};

// Staff APIs
export const staffAPI = {
  getAll: () => api.get<Staff[]>("/api/staff"),

  create: (staffData: Omit<Staff, "id">) =>
    api.post<Staff>("/api/staff", staffData),

  getById: (id: string) => api.get<Staff>(`/api/staff/${id}`),

  update: (id: string, staffData: Partial<Staff>) =>
    api.put<Staff>(`/api/staff/${id}`, staffData),

  delete: (id: string) => api.delete(`/api/staff/${id}`),
};
