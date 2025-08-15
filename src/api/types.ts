import api from "@/lib/api";

// Types (create these based on your backend models)
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  position: string;
}

export interface Request {
  id: string;
  title: string;
  status: 'ongoing' | 'completed' | 'cancelled';
}

// Admin APIs
export const adminAPI = {
  create: (userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<AdminUser>('/api/admin/create', userData),
  
  getAll: () =>
    api.get<AdminUser[]>('/api/admin/get'),
};

// Authentication APIs
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: AdminUser }>('/api/auth/login', credentials),
  
  logout: () =>
    api.post('/api/auth/logout'),
};

// Client APIs
export const clientAPI = {
  getAll: () =>
    api.get<Client[]>('/api/clients'),
  
  getById: (id: string) =>
    api.get<Client>(`/api/clients/${id}`),
};

// System APIs
export const systemAPI = {
  health: () =>
    api.get('/api/health'),
  
  stats: () =>
    api.get('/api/health/stats'),
};

// Request APIs
export const requestAPI = {
  getAll: () =>
    api.get<Request[]>('/api/requests'),
  
  getCompleted: () =>
    api.get<Request[]>('/api/requests/completed'),
  
  getOngoing: () =>
    api.get<Request[]>('/api/requests/ongoing'),
  
  getCancelled: () =>
    api.get<Request[]>('/api/requests/cancelled'),
};

// Staff APIs
export const staffAPI = {
  getAll: () =>
    api.get<Staff[]>('/api/staff'),
  
  create: (staffData: Omit<Staff, 'id'>) =>
    api.post<Staff>('/api/staff', staffData),
  
  getById: (id: string) =>
    api.get<Staff>(`/api/staff/${id}`),
  
  update: (id: string, staffData: Partial<Staff>) =>
    api.put<Staff>(`/api/staff/${id}`, staffData),
  
  delete: (id: string) =>
    api.delete(`/api/staff/${id}`),
};