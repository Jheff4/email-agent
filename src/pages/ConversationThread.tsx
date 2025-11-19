import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllStaff, useRequests, QUERY_KEYS } from "@/hooks/use-api-query";
import { useRequestTimer } from "@/hooks/use-request-timer";
import { Request } from "@/api/types";
import Loader from "@/components/loader";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAPI } from "@/api/types";

interface ConversationThreadProps {
  requestId: string;
  onBack: () => void;
}

export default function ConversationThread({
  requestId,
  onBack,
}: ConversationThreadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequests();
  
  // Use the same staff fetching as in client-request-table
  const { data: staffData, isLoading: staffLoading } = useAllStaff();
  
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // Real-time WebSocket connection for chat updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/requests/${requestId}/chat`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_MESSAGE':
          // Update the specific request's messages
          queryClient.setQueryData(QUERY_KEYS.REQUESTS, (old: any) => {
            if (!old || !old.requests) return old;
            
            return {
              ...old,
              requests: old.requests.map((req: any) => 
                req.id === requestId 
                  ? {
                      ...req,
                      chat: {
                        ...req.chat,
                        messages: [...(req.chat?.messages || []), data.message]
                      }
                    }
                  : req
              )
            };
          });
          break;
          
        case 'MESSAGE_READ':
          // Update message read status
          queryClient.setQueryData(QUERY_KEYS.REQUESTS, (old: any) => {
            if (!old || !old.requests) return old;
            
            return {
              ...old,
              requests: old.requests.map((req: any) => 
                req.id === requestId 
                  ? {
                      ...req,
                      chat: {
                        ...req.chat,
                        messages: req.chat?.messages?.map((msg: any) => 
                          msg.id === data.messageId 
                            ? { ...msg, isRead: true, read: true }
                            : msg
                        ) || []
                      }
                    }
                  : req
              )
            };
          });
          break;
          
        case 'STATUS_UPDATE':
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
          break;
      }
    };
    
    return () => ws.close();
  }, [requestId, queryClient]);

  // Reassign mutation
  const reassignMutation = useMutation({
    mutationFn: ({ requestId, staffId }: { requestId: string; staffId: string }) =>
      requestAPI.reassign(requestId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      setReassignOpen(false);
      toast({
        title: "Success",
        description: "Request has been reassigned successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Failed to reassign request:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reassign request",
        variant: "destructive",
      });
    },
  });

  // Mark as completed mutation
  const markAsCompletedMutation = useMutation({
    mutationFn: (requestId: string) => requestAPI.updateStatus(requestId, "completed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      toast({
        title: "Success",
        description: "Request has been marked as completed.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark request as completed:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update request status",
        variant: "destructive",
      });
    },
  });

  // Process staff data the same way as in client-request-table
  const staffList = Array.isArray(staffData)
    ? staffData
    : (staffData as any)?.staff || [];

  // Add role tags like in client-request-table
  staffList.forEach((staff: any) => {
    staff.role = "agent";
  });

  // Create staff lookup map for quick name resolution
  const staffLookup = useMemo(() => {
    const lookup = new Map();
    staffList.forEach((member: any) => {
      lookup.set(member.id, member);
    });
    return lookup;
  }, [staffList]);

  // Get staff name by ID
  const getStaffNameById = (staffId: string) => {
    const staff = staffLookup.get(staffId);
    return staff ? staff.name : "No Staff";
  };

  // Handle reassign confirmation
  const handleReassign = () => {
    if (!selectedStaffId) return;
    console.log('Reassigning request:', { requestId, selectedStaffId });
    
    const selectedStaff = staffList.find((m: any) => m.id === selectedStaffId);
    console.log('Selected staff:', selectedStaff);
    
    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Selected staff member not found",
        variant: "destructive",
      });
      return;
    }
    
    reassignMutation.mutate({ 
      requestId, 
      staffId: selectedStaffId 
    });
  };

  // Handle mark as completed
  const handleMarkAsCompleted = () => {
    markAsCompletedMutation.mutate(requestId);
  };

  // Extract requests array from API data
  const requests =
    requestsData && Array.isArray((requestsData as any).requests)
      ? (requestsData as any).requests
      : [];

  // Find the specific request by ID
  const request = requests.find((req: Request) => req.id === requestId);

  const { remainingSeconds, isOverdue, formatDuration } = useRequestTimer(
    request?.createdAt || ""
  );

  // Show loading state
  if (requestsLoading || staffLoading) {
    return <Loader />;
  }

  // Show error state
  if (requestsError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <p>Error loading conversation data</p>
      </div>
    );
  }

  // Show not found state
  if (!request) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <p>Request not found</p>
          <Button variant="ghost" onClick={onBack} className="mt-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string, isOverdue = false) => {
    const effective =
      isOverdue && status !== "ongoing" && status !== "completed" ? "Overdue" : status;
  
    switch (effective) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "ongoing":
        return <Badge variant="secondary">Ongoing</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{effective}</Badge>;
    }
  };

  // Get conversation messages from the request data
  const messages = request?.chat?.messages || [];

  const isGmail = request?.client?.email?.endsWith("gmail.com");

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="border-b bg-background p-4 max-md:p-0">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.client?.avatar} />
                <AvatarFallback>
                  {getInitials(
                    request.client?.name || request.clientName || "Unknown"
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">
                  {request.client?.name ||
                    request.clientName ||
                    "Unknown Client"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {request.client?.email || request.clientEmail || ""}
                </p>
              </div>
            </div>
          </div>
          <div className="flex max-md:w-full gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-3">
            
              {request.status !== "completed" && isGmail && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMarkAsCompleted}
                  disabled={markAsCompletedMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {markAsCompletedMutation.isPending ? (
                    <>
                      <span className="mr-2">Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </>
                  )}
                </Button>
              )}

              {getStatusBadge(request.status, isOverdue)}

              <span>
              {(() => {
                // If status is "Completed", show "Completed"
                if (request.status === "completed") {
                  return (
                    <span className="text-sm text-green-600 font-medium">
                      Completed
                    </span>
                  );
                }

                if (request.status === "ongoing") {
                  return (
                    <span className="text-sm text-blue-600 font-medium">
                      In Progress
                    </span>
                  );
                }
                
                // For pending requests, check if timer has reached 0
                if (request.status === "pending") {
                  return (
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
                        {formatDuration(remainingSeconds)}
                      </span>
                    </div>
                  );
                }
            
                if (isOverdue) {
                  return (
                    <span className="text-sm text-destructive font-medium">
                      {formatDuration(Math.abs(remainingSeconds))}
                    </span>
                  );
                }

                return (
                  <span className="text-sm">
                    {formatDuration(remainingSeconds)}
                  </span>
                );
              })()}
              </span>
            </div>  
            <Button
              className="max-md:mb-1"
              variant="outline"
              size="sm"
              onClick={() => setReassignOpen(true)}
            >
              Reassign
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Select staff member</label>
            <Select
              value={selectedStaffId}
              onValueChange={setSelectedStaffId}
              disabled={reassignMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff: any) => {
                  const isAssigned = staff.id === request?.staffId;
                  return (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex w-full items-center justify-between">
                        {staff.name} {staff.isAdmin ? "(manager)" : "(agent)"}
                        {isAssigned && (
                          <span className="text-green-500">
                            ✓
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setReassignOpen(false)}
              disabled={reassignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              disabled={!selectedStaffId || reassignMutation.isPending}
            >
              {reassignMutation.isPending ? "Reassigning..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 max-md:p-0">
        <div className="space-y-4">
          {messages?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No messages in this conversation yet
              </p>
            </div>
          ) : (
            messages?.map((message: any, index: number) => {
              const prevMessage = messages[index - 1];
              const showDate =
                index === 0 ||
                formatDate(new Date(message.timestamp || message.createdAt)) !==
                  formatDate(
                    new Date(prevMessage.timestamp || prevMessage.createdAt)
                  );

              return (
                <div key={message.id || index}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatDate(
                          new Date(message.timestamp || message.createdAt)
                        )}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      message.sender === "staff" ||
                      message.senderType === "staff"
                        ? "justify-end"
                        : message.sender === "system" ||
                          message.senderType === "system"
                        ? "justify-center"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[70%] ${
                        message.sender === "staff" ||
                        message.senderType === "staff"
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <Avatar
                        className={
                          message.sender == "system" ? "hidden" : "h-8 w-8"
                        }
                      >
                        <AvatarImage
                          src={
                            message.sender === "client" ||
                            message.senderType === "client"
                              ? request.client?.avatar
                              : request.assignedStaff?.avatar
                          }
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            message.sender === "client" ||
                              message.senderType === "client"
                              ? request.client?.name ||
                                  request.clientName ||
                                  "C"
                              : getStaffNameById(request.staffId) || "S"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`space-y-1 ${
                          message.sender === "staff" ||
                          message.senderType === "staff"
                            ? "text-right"
                            : ""
                        }`}
                      >
                        <Card
                          className={`${
                            message.sender === "staff" ||
                            message.senderType === "staff"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <CardContent className="p-3">
                            <p className="text-sm">
                              {message.content ||
                                message.text ||
                                message.message}
                            </p>
                          </CardContent>
                        </Card>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatTime(
                              new Date(message.timestamp || message.createdAt)
                            )}
                          </span>
                          {(message.sender === "staff" ||
                            message.senderType === "staff") && (
                            <span>
                              {message.isRead || message.read ? "Read" : "Sent"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}