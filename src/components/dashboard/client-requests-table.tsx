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
import { Search, AlertCircle } from "lucide-react";
import { useRequests, useAllStaff } from "@/hooks/use-api-query";
import { useAuthProvider } from "@/Providers/hooks";
import { useRequestTimer } from "@/hooks/use-request-timer";
import { useQueryClient } from "@tanstack/react-query"
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

// Helper function to get URL search params
const getURLParam = (param: string, defaultValue: string = "") => {
  if (typeof window === "undefined") return defaultValue;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || defaultValue;
};

// Helper function to update URL without page reload
const updateURLParam = (param: string, value: string) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value && value !== "1" && value !== "") {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }
  window.history.replaceState({}, "", url.toString());
};

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

  // Initialize state from URL parameters
  const [currentPage, setCurrentPage] = useState(() => {
    const pageFromURL = getURLParam("page");
    return pageFromURL ? parseInt(pageFromURL) : 1;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Update URL when page changes
  useEffect(() => {
    updateURLParam("page", currentPage.toString());
  }, [currentPage]);

  // Auto-refresh data every 30 seconds for real-time feel
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!requestsLoading) {
  //       refetchRequests();
  //     }
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [refetchRequests, requestsLoading]);

  // Ensure requests is always an array
  const requests =
    requestsData && Array.isArray((requestsData as any).requests)
      ? (requestsData as any).requests
      : [];

      const staffList = useMemo(() => {
        let data = Array.isArray(staffData)
          ? staffData
          : (staffData as any)?.staff || [];
        
        // Create NEW objects with .map() instead of mutating
        return data.map((staff: any) => ({
          ...staff,
          role: "agent"
        }));
      }, [staffData]);

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

  // Get all staff members for filter dropdown
  const staffMembersForFilter = useMemo(() => {
    if (staffList.length === 0) return [];

    // Show ALL staff members in the dropdown, not just those with requests
    const allStaff = staffList.map((staff: any) => ({
      id: staff.id,
      name: staff.name,
      isAdmin: staff.isAdmin || false,
    }));

    // Sort alphabetically
    return allStaff.sort((a, b) => a.name.localeCompare(b.name));
  }, [staffList]);

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

// Helper function to check if a request is overdue
const isRequestOverdue = (createdAt: string) => {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const diffInMs = now.getTime() - createdDate.getTime()
  return diffInMs > 24 * 60 * 60 * 1000 // 24 hours in ms
}

// Update the filteredRequests useMemo
const filteredRequests = useMemo(() => {
  return requests.filter((request: any) => {
    const isOverdue = isRequestOverdue(request.createdAt);
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
    
    const matchesStatus = (() => {
      if (statusFilter === "" || statusFilter === "all") {
        return true;
      }
      
      switch (statusFilter) {
        case "pending":
          return request.status === "pending" && !isOverdue;
          
        case "ongoing":
          return request.status === "ongoing";

        case "Overdue":
          return isOverdue && request.status !== "ongoing" && request.status !== "completed";
          
        case "completed":
          return request.status === "completed";
          
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

  // Reset to first page when filters change, but maintain page from URL on initial load
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, staffFilter, statusFilter, monthFilter, totalPages]);

  // Generate pagination items with ellipsis logic
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if there's a gap after first page
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if there's a gap before last page
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => setCurrentPage(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filteredRequests.length > 0 ? (
            <>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of{' '}
              <span className="font-medium text-foreground">{filteredRequests.length}</span>{' '}
              {filteredRequests.length !== requests.length && (
                <>
                  filtered from{' '}
                  <span className="font-medium text-foreground">{requests.length}</span> total
                </>
              )}
              {filteredRequests.length === requests.length && (
                <>
                  total request{requests.length !== 1 ? 's' : ''}
                </>
              )}
            </>
          ) : (
            <>
              No requests found
              {requests.length > 0 && (
                <> from <span className="font-medium text-foreground">{requests.length}</span> total</>
              )}
            </>
          )}
        </div>
        {(searchTerm || staffFilter || statusFilter || monthFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStaffFilter("");
              setStatusFilter("");
              setMonthFilter("");
            }}
            className="text-xs"
          >
            Clear all filters
          </Button>
        )}
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

      {/* Pagination with Ellipsis */}
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

            {generatePaginationItems()}

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