import { useApiQuery, useApiMutation } from './use-api-query';
import { clientService } from '@/api';
import { ClientRequest } from '@/api/types';
import { useToast } from '@/hooks/use-toast';

export function useClientRequests() {
  return useApiQuery({
    queryKey: ['client-requests'],
    queryFn: clientService.getClientRequests,
  });
}

export function useClientRequest(id: string) {
  return useApiQuery({
    queryKey: ['client-request', id],
    queryFn: () => clientService.getClientRequest(id),
    enabled: !!id,
  });
}

export function useRequestMessages(requestId: string) {
  return useApiQuery({
    queryKey: ['request-messages', requestId],
    queryFn: () => clientService.getRequestMessages(requestId),
    enabled: !!requestId,
  });
}

export function useSendMessage() {
  const { toast } = useToast();

  return useApiMutation({
    mutationFn: ({ requestId, content, senderType }: {
      requestId: string;
      content: string;
      senderType: 'client' | 'staff';
    }) => clientService.sendMessage(requestId, content, senderType),
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error) => {
      const errorData = error.response?.data as any;
      toast({
        title: 'Failed to send message',
        description: errorData?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    invalidateQueries: [['request-messages']],
  });
}

export function useUpdateRequestStatus() {
  const { toast } = useToast();

  return useApiMutation({
    mutationFn: ({ requestId, status }: {
      requestId: string;
      status: ClientRequest['status'];
    }) => clientService.updateRequestStatus(requestId, status),
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'Request status has been updated successfully.',
      });
    },
    onError: (error) => {
      const errorData = error.response?.data as any;
      toast({
        title: 'Failed to update status',
        description: errorData?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    invalidateQueries: [['client-requests'], ['client-request']],
  });
}