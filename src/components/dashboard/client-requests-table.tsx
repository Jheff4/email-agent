import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"
import { Loader, Search, AlertCircle } from "lucide-react";
import { useRequests, useAllStaff, QUERY_KEYS } from "@/hooks/use-api-query";
import { useAuthProvider } from "@/Providers/hooks";
import { useRequestTimer } from "@/hooks/use-request-timer";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { requestAPI } from "@/api/types"
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 5;

interface ClientRequestsTableProps {
  onViewRequest?: (requestId: string) => void;
}

// Improved loading skeleton component
const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <TableRow key={index}>
        {/* Client column skeleton */}
        <TableCell className="min-w-[200px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </TableCell>
        
        {/* Staff column skeleton */}
        <TableCell className="min-w-[150px]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </TableCell>
        
        {/* Date column skeleton */}
        <TableCell className="min-w-[120px]">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </TableCell>
        
        {/* Time left column skeleton */}
        <TableCell className="min-w-[100px]">
          <Skeleton className="h-4 w-16" />
        </TableCell>
        
        {/* Status column skeleton */}
        <TableCell className="min-w-[100px]">
          <Skeleton className="h-6 w-20 rounded-full" />
        </TableCell>
        
        {/* Action column skeleton */}
        <TableCell className="min-w-[80px]">
          <Skeleton className="h-8 w-16 rounded-md" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

// Loading skeleton for filters
const FiltersSkeleton = () => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="relative flex-1 max-w-sm">
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-[160px]" />
      <Skeleton className="h-10 w-[160px]" />
      <Skeleton className="h-10 w-[140px]" />
    </div>
  </div>
);

export function ClientRequestsTable({
  onViewRequest,
}: ClientRequestsTableProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useRequests();
  
  const { user, isLoading: userLoading } = useAuthProvider();
  const { data: staffData, isLoading: staffLoading } = useAllStaff();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Optimistic function to add new request
  const addNewRequestOptimistically = (newRequest: any) => {
    queryClient.setQueryData(QUERY_KEYS.REQUESTS, (old: any) => {
      if (!old) return { requests: [newRequest] };
      
      return {
        ...old,
        requests: [newRequest, ...old.requests]
      };
    });
  };

  // Auto-refresh data every 30 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!requestsLoading) {
        refetchRequests();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchRequests, requestsLoading]);

  // Ensure requests is always an array
  const requests =
    requestsData && Array.isArray((requestsData as any).requests)
      ? (requestsData as any).requests
      : [];

  const staffList = Array.isArray(staffData)
    ? staffData
    : (staffData as any)?.staff || [];

  staffList.forEach((staff: any) => {
    staff.role = "agent";
  });

  // Create a staff lookup map for quick name resolution
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

  // Get unique staff members for filter (from requests data)
  const staffMembersForFilter = useMemo(() => {
    if (staffList.length === 0) return [];

    // Get unique staff IDs from requests
    const uniqueStaffIds = [
      ...new Set(staffList.map((req: any) => req.id).filter(Boolean)),
    ];

    // Map to staff objects with names
    const staffWithNames = uniqueStaffIds.map((staffId: string) => {
      const staff = staffLookup.get(staffId);
      return {
        id: staffId,
        name: staff ? staff.name : "No Staff",
        isAdmin: staff ? staff.isAdmin : false,
      };
    });

    return staffWithNames.sort((a, b) => a.name.localeCompare(b.name));
  }, [staffList, staffLookup]);

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    if (requests.length === 0) return [];
    const months = [
      ...new Set(
        requests.map((req: any) => {
          const date = new Date(req.createdAt);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        })
      ),
    ];
    return months.sort().reverse(); // Most recent first
  }, [requests]);

  // Calculate remaining time for a request using the hook
  const RequestRow = ({ request }: { request: any }) => {
    const { remainingSeconds, isOverdue, formatDuration } = useRequestTimer(
      request.createdAt
    );
    const staffMember = staffLookup.get(request.staffId);
    const staffName = staffMember
      ? staffMember.name
      : request.staff?.name || "Unassigned";
    const isActive =
      request.status === "Pending" || request.status === "Ongoing";

    return (
      <TableRow>
        <TableCell className="min-w-[200px]">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(request.client?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">
                {request.client?.name || "Unknown Client"}
              </p>
              <p className="text-sm text-muted-foreground">
                {request.client?.email || ""}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="min-w-[150px]">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(staffName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{staffName}</span>
              {staffMember && (
                <span className="text-xs text-muted-foreground">
                  {staffMember.isAdmin ? "Manager" : "Agent"}
                </span>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="min-w-[120px]">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {formatDate(request.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(request.createdAt)}
            </span>
          </div>
        </TableCell>
        <TableCell className="min-w-[100px]">
          {(() => {
            // If status is "Completed", show "Completed"
            if (request.status === "Completed") {
              return (
                <span className="text-sm text-green-600 font-medium">
                  Completed
                </span>
              );
            }
            
            // For pending requests, check if timer has reached 0
            if (request.status === "Ongoing") {
              return (
                <div className="flex flex-col">
                  {request.status === "Ongoing" && (
                    <span className="text-sm text-blue-600 font-medium">
                      In Progress
                    </span>
                  )}
                  <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
                    {formatDuration(remainingSeconds)}
                  </span>
                  {isOverdue && (
                    <span className="text-xs text-red-500">Overdue!</span>
                  )}
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
        </TableCell>
        <TableCell className="min-w-[100px]">
          {getStatusBadge(request.status, isOverdue)}
        </TableCell>
        <TableCell className="min-w-[80px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewClick(request.id)}
            className="text-primary hover:text-primary/80"
          >
            View
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  // Filter requests based on search and filters
  // Helper function to calculate overdue status (add this before filteredRequests)
const calculateOverdueStatus = (createdAt: string, status: string) => {
  const createdTime = new Date(createdAt).getTime();
  const timeLimitMs = 5 * 60 * 1000; // 5 minutes in milliseconds (same as useRequestTimer)
  const deadlineTime = createdTime + timeLimitMs;
  const currentTime = Date.now();
  const remainingMs = deadlineTime - currentTime;
  const isOverdue = remainingMs <= 0 && (status === "Pending" || status === "Ongoing");
  return { isOverdue, remainingMs };
};

// Update the filteredRequests useMemo
const filteredRequests = useMemo(() => {
  return requests.filter((request: any) => {
    // Get actual names for search
    const clientName = request.client?.name || request.clientId || "";
    const clientEmail = request.client?.email || "";
    const staffName = getStaffNameById(request.staffId);

    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStaff =
      staffFilter === "" ||
      staffFilter === "all" ||
      request.staffId === staffFilter;
    
    // Status filter logic that matches what's displayed in the TIME LEFT column
const matchesStatus = (() => {
  if (statusFilter === "" || statusFilter === "all") {
    return true;
  }
  
  const { isOverdue } = calculateOverdueStatus(request.createdAt, request.status);
  
  switch (statusFilter) {
    case "Pending":
      // Show requests with countdown timer (Pending status, not overdue, not completed)
      return request.status === "Pending" && !isOverdue;
      
    case "Ongoing":
      // Show requests displaying "In Progress" (Ongoing status)
      return request.status === "Ongoing";
      
    case "Overdue":
      // Show requests displaying overdue time (any status but overdue)
      return isOverdue;
      
    case "Completed":
      // Show requests displaying "Completed" (Completed status)
      return request.status === "Completed";
      
    default:
      return false;
  }
})();
    
    const matchesMonth =
      monthFilter === "" ||
      monthFilter === "all" ||
      (() => {
        const requestDate = new Date(request.createdAt);
        const requestMonth = `${requestDate.getFullYear()}-${String(
          requestDate.getMonth() + 1
        ).padStart(2, "0")}`;
        return requestMonth === monthFilter;
      })();

    return matchesSearch && matchesStaff && matchesStatus && matchesMonth;
  });
}, [
  requests,
  searchTerm,
  staffFilter,
  statusFilter,
  monthFilter,
  getStaffNameById,
]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, staffFilter, statusFilter, monthFilter]);

  const getStatusBadge = (status: string, isOverdue = false) => {
    const effective = isOverdue ? "Overdue" : status;

    switch (effective) {
      case "Pending":
      case "Ongoing":
        return <Badge variant="secondary">{effective}</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{effective}</Badge>;
    }
  };

  const handleViewClick = (requestId: string) => {
    onViewRequest?.(requestId);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Loading state with proper skeleton
  const isLoading = requestsLoading || userLoading || staffLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters skeleton */}
        <FiltersSkeleton />
        
        {/* Table skeleton */}
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CLIENT</TableHead>
                  <TableHead>STAFF</TableHead>
                  <TableHead>DATE ASSIGNED</TableHead>
                  <TableHead>TIME LEFT</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton rows={ITEMS_PER_PAGE} />
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (requestsError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium">
              Error loading requests
            </p>
            <p className="text-sm text-muted-foreground">
              {requestsError.message}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => refetchRequests()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients or staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month.toString()} value={month.toString()}>
                  {getMonthName(month.toString())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffMembersForFilter.map((staff: any) => (
                <SelectItem
                  key={staff.id.toString()}
                  value={staff.id.toString()}
                >
                  {staff.name} {staff.isAdmin ? "(manager)" : "(agent)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CLIENT</TableHead>
                <TableHead>STAFF</TableHead>
                <TableHead>DATE ASSIGNED</TableHead>
                <TableHead>TIME LEFT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p>No requests match your filters</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStaffFilter("");
                          setStatusFilter("");
                          setMonthFilter("");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentRequests.map((request: any) => (
                  <RequestRow key={request.id} request={request} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}