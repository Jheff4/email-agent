export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar?: string;
}

export interface ClientRequest {
  id: string;
  clientId: string;
  client: Client;
  subject: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'staff';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface DashboardMetrics {
  activeRequests: number;
  overdueRequests: number;
  responseRate: number;
  newClients: number;
}