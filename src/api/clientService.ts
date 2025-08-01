import { ClientRequest, Message, DashboardMetrics } from './types';
import { mockRequests, mockMessages, mockMetrics } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const clientService = {
  // Get all client requests
  async getClientRequests(): Promise<ClientRequest[]> {
    await delay(500);
    return mockRequests;
  },

  // Get a specific request by ID
  async getClientRequest(id: string): Promise<ClientRequest | null> {
    await delay(300);
    return mockRequests.find(req => req.id === id) || null;
  },

  // Get messages for a specific request
  async getRequestMessages(requestId: string): Promise<Message[]> {
    await delay(400);
    return mockMessages[requestId] || [];
  },

  // Send a new message
  async sendMessage(requestId: string, content: string, senderType: 'client' | 'staff'): Promise<Message> {
    await delay(600);
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId: senderType === 'staff' ? 'staff-current' : 'client-current',
      senderName: senderType === 'staff' ? 'Current Staff' : 'Current Client',
      senderType,
      content,
      timestamp: new Date().toISOString()
    };

    // Add to mock data
    if (!mockMessages[requestId]) {
      mockMessages[requestId] = [];
    }
    mockMessages[requestId].push(newMessage);

    return newMessage;
  },

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay(200);
    return mockMetrics;
  },

  // Update request status
  async updateRequestStatus(requestId: string, status: ClientRequest['status']): Promise<ClientRequest | null> {
    await delay(400);
    
    const request = mockRequests.find(req => req.id === requestId);
    if (request) {
      request.status = status;
      request.updatedAt = new Date().toISOString();
    }
    
    return request || null;
  }
};