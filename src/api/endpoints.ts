// API endpoint constants
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  
  // Client requests
  REQUESTS: {
    LIST: '/requests',
    BY_ID: (id: string) => `/requests/${id}`,
    MESSAGES: (id: string) => `/requests/${id}/messages`,
    UPDATE_STATUS: (id: string) => `/requests/${id}/status`,
  },
  
  // Messages
  MESSAGES: {
    SEND: '/messages',
    BY_REQUEST: (requestId: string) => `/messages/request/${requestId}`,
  },
  
  // Dashboard
  DASHBOARD: {
    METRICS: '/dashboard/metrics',
    STATS: '/dashboard/stats',
  },
  
  // Staff
  STAFF: {
    LIST: '/staff',
    BY_ID: (id: string) => `/staff/${id}`,
    CREATE: '/staff',
    UPDATE: (id: string) => `/staff/${id}`,
    DELETE: (id: string) => `/staff/${id}`,
  },
  
  // Clients
  CLIENTS: {
    LIST: '/clients',
    BY_ID: (id: string) => `/clients/${id}`,
    CREATE: '/clients',
    UPDATE: (id: string) => `/clients/${id}`,
    DELETE: (id: string) => `/clients/${id}`,
  },
} as const;