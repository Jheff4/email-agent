import { Client, ClientRequest, Message, DashboardMetrics } from './types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@acmecorp.com',
    company: 'Acme Corp',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@techstart.io',
    company: 'TechStart',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e36b02?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@globaltech.com',
    company: 'GlobalTech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@innovate.com',
    company: 'Innovate Inc',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
  }
];

export const mockRequests: ClientRequest[] = [
  {
    id: 'req-1',
    clientId: '1',
    client: mockClients[0],
    subject: 'Integration API Documentation',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-28T10:30:00Z',
    updatedAt: '2024-01-29T14:20:00Z',
    assignedTo: 'Alex Thompson'
  },
  {
    id: 'req-2',
    clientId: '2',
    client: mockClients[1],
    subject: 'Payment Gateway Setup',
    status: 'pending',
    priority: 'urgent',
    createdAt: '2024-01-29T09:15:00Z',
    updatedAt: '2024-01-29T09:15:00Z'
  },
  {
    id: 'req-3',
    clientId: '3',
    client: mockClients[2],
    subject: 'Database Migration Support',
    status: 'overdue',
    priority: 'medium',
    createdAt: '2024-01-26T16:45:00Z',
    updatedAt: '2024-01-28T11:30:00Z',
    assignedTo: 'Lisa Wang'
  },
  {
    id: 'req-4',
    clientId: '4',
    client: mockClients[3],
    subject: 'Security Audit Review',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-01-25T14:20:00Z',
    updatedAt: '2024-01-29T10:45:00Z',
    assignedTo: 'David Kim'
  },
  {
    id: 'req-5',
    clientId: '1',
    client: mockClients[0],
    subject: 'Performance Optimization',
    status: 'pending',
    priority: 'low',
    createdAt: '2024-01-29T11:00:00Z',
    updatedAt: '2024-01-29T11:00:00Z'
  }
];

export const mockMessages: Record<string, Message[]> = {
  'req-1': [
    {
      id: 'msg-1',
      requestId: 'req-1',
      senderId: '1',
      senderName: 'John Smith',
      senderType: 'client',
      content: 'Hi team, I need help with integrating your API into our system. We\'re having trouble with the authentication flow. Could you provide more detailed documentation?',
      timestamp: '2024-01-28T10:30:00Z'
    },
    {
      id: 'msg-2',
      requestId: 'req-1',
      senderId: 'staff-1',
      senderName: 'Alex Thompson',
      senderType: 'staff',
      content: 'Hello John, thank you for reaching out. I\'ll help you with the API integration. Let me gather the updated documentation and some examples for you.',
      timestamp: '2024-01-28T11:15:00Z'
    },
    {
      id: 'msg-3',
      requestId: 'req-1',
      senderId: 'staff-1',
      senderName: 'Alex Thompson',
      senderType: 'staff',
      content: 'I\'ve attached the latest API documentation with authentication examples. Please review the OAuth 2.0 flow section. Let me know if you need any clarification on the implementation.',
      timestamp: '2024-01-29T14:20:00Z'
    }
  ],
  'req-2': [
    {
      id: 'msg-4',
      requestId: 'req-2',
      senderId: '2',
      senderName: 'Sarah Johnson',
      senderType: 'client',
      content: 'We need urgent assistance setting up the payment gateway for our e-commerce platform. Our launch is scheduled for next week.',
      timestamp: '2024-01-29T09:15:00Z'
    }
  ],
  'req-3': [
    {
      id: 'msg-5',
      requestId: 'req-3',
      senderId: '3',
      senderName: 'Michael Chen',
      senderType: 'client',
      content: 'Our database migration has been running into issues. We\'re getting timeout errors when migrating large tables.',
      timestamp: '2024-01-26T16:45:00Z'
    },
    {
      id: 'msg-6',
      requestId: 'req-3',
      senderId: 'staff-2',
      senderName: 'Lisa Wang',
      senderType: 'staff',
      content: 'I\'ll look into the timeout issues. Can you provide the error logs and the size of the tables you\'re trying to migrate?',
      timestamp: '2024-01-27T09:30:00Z'
    }
  ]
};

export const mockMetrics: DashboardMetrics = {
  activeRequests: 24,
  overdueRequests: 3,
  responseRate: 94,
  newClients: 8
};