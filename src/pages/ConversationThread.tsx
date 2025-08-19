import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useAdmins, useStaff } from "@/hooks/use-api-query";
import { useRequests } from "@/hooks/use-api-query";
import { useRequestTimer } from "@/hooks/use-request-timer";
import { Request } from "@/api/types";
import Loader from "@/components/loader";

interface ConversationThreadProps {
  requestId: string;
  onBack: () => void;
}

export default function ConversationThread({
  requestId,
  onBack,
}: ConversationThreadProps) {
  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequests();
  const { data: adminsData, isLoading: adminsLoading } = useAdmins();
  const { data: staffData, isLoading: staffLoading } = useStaff();
  const [reassignOpen, setReassignOpen] = useState(false);
  const [assignee, setAssignee] = useState<string>("");

  // Merge admins and staff data
  const allStaffMembers = useMemo(() => {
    const adminList = Array.isArray(adminsData)
      ? adminsData
      : (adminsData as any)?.admins || [];
    const staffList = Array.isArray(staffData)
      ? staffData
      : (staffData as any)?.staff || [];

    // Combine both arrays and create a map for easy lookup
    const combined = [
      ...adminList.map((admin: any) => ({ ...admin, role: "manager" })),
      ...staffList.map((staff: any) => ({ ...staff, role: "agent" })),
    ];

    return combined;
  }, [adminsData, staffData]);

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

  // Extract staff options from API data
  const staffOptions = allStaffMembers
    ? (Array.isArray(allStaffMembers) ? allStaffMembers : []).map(
        (s: any) => s.name || s.email || s.id
      )
    : [];

  // Show loading state
  if (requestsLoading || adminsLoading || staffLoading) {
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

  // Determine status based on request status and timer
  // const isActive = request.status === "Pending" || request.status === "Ongoing"
  const effectiveStatus = isOverdue ? "Overdue" : request.status;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
      case "Ongoing":
        return <Badge variant="secondary">{status}</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get conversation messages from the request data
  const messages = request.chat.messages || [];

  console.log(messages);
  console.log(request);

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
              {getStatusBadge(effectiveStatus)}
              <span
                className={`text-sm ${
                  isOverdue
                    ? "text-destructive font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {isOverdue
                  ? formatDuration(remainingSeconds)
                  : formatDuration(remainingSeconds)}
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
            <label className="text-sm font-medium">Select staff</label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffOptions.map((staffName: string, index: number) => (
                  <SelectItem key={index} value={staffName}>
                    {staffName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setReassignOpen(false)} disabled={!assignee}>
              Confirm
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
                      <Avatar className="h-8 w-8">
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
                              : request.assignedStaff?.name ||
                                  request.staffName ||
                                  "S"
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
