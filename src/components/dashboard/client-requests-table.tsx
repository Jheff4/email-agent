import { useState, useMemo } from "react";
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
import { Search } from "lucide-react";
import { useClientRequests } from "@/hooks/use-client-requests";

interface ClientRequest {
  id: string;
  client: {
    name: string;
    email: string;
    avatar?: string;
  };
  staff: {
    name: string;
    avatar?: string;
  };
  timeLeft: string;
  status: "Pending" | "Overdue" | "Completed";
}

const ITEMS_PER_PAGE = 5;

interface ClientRequestsTableProps {
  onViewRequest?: (requestId: string) => void;
}

export function ClientRequestsTable({
  onViewRequest,
}: ClientRequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests } = useClientRequests();

  // Get unique staff members for filter
  // const staffMembers =   useMemo(() => {
  //   const uniqueStaff = [...new Set(requests.map((req) => req.staff.name))];
  //   return uniqueStaff.sort();
  // }, []);

  // Filter requests based on search and filters
  // const filteredRequests = useMemo(() => {
  //   return requests.filter((request) => {
  //     const matchesSearch =
  //       request.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       request.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       // request.name.toLowerCase().includes(searchTerm.toLowerCase());

  //     const matchesStaff =
  //       staffFilter === "all" || request.staff.name === staffFilter;
  //     const matchesStatus =
  //       statusFilter === "all" || request.status === statusFilter;

  //     return matchesSearch && matchesStaff && matchesStatus;
  //   });
  // }, [searchTerm, staffFilter, statusFilter]);

  const totalPages = Math.ceil(requests?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = requests;

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const getStatusBadge = (status: ClientRequest["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
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

  const handleViewClick = (requestId: string) => {
    onViewRequest?.(requestId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {/* {staffMembers.map((staff) => (
                <SelectItem key={staff} value={staff}>
                  {staff}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-md border bg-card overflow-hidden">
        {/* Desktop View - Regular Table */}
        <div className="hidden xl:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CLIENT</TableHead>
                <TableHead>STAFF</TableHead>
                <TableHead>TIME LEFT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRequests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.client.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium">{request.client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.client.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(request as any)?.staff?.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials((request as any)?.staff?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {(request as any)?.staff?.name || ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        request.status === "overdue"
                          ? "text-destructive font-medium"
                          : ""
                      }
                    >
                      {""}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status as any)}</TableCell>
                  <TableCell>
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
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet View - Pinned Client Column with Horizontal Scroll */}
        <div className="xl:hidden">
          <div className="flex min-h-0">
            {/* Pinned Client Column */}
            <div className="flex-shrink-0 w-[300px] sm:w-[400px] border-r bg-muted/20">
              {/* Header */}
              <div className="h-12 border-b px-3 sm:px-4 flex items-center bg-muted/50">
                <div className="font-medium text-sm text-muted-foreground">
                  CLIENT
                </div>
              </div>
              {/* Rows */}
              <div>
                {currentRequests?.map((request) => (
                  <div
                    key={request.id}
                    className="h-16 border-b last:border-b-0 px-3 sm:px-4 flex items-center"
                  >
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={request.client.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate flex-1">
                            {request.client.name}
                          </p>
                          <div className="flex-shrink-0">
                            {getStatusBadge(request.status as any)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {request.client.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Columns */}
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="w-full" style={{ minWidth: "400px" }}>
                {/* Header */}
                <div className="h-12 border-b bg-muted/50 flex w-full">
                  <div className="flex-1 min-w-[180px] px-3 sm:px-4 flex items-center border-r">
                    <div className="font-medium text-sm text-muted-foreground">
                      STAFF
                    </div>
                  </div>
                  <div className="flex-1 min-w-[120px] px-3 sm:px-4 flex items-center border-r">
                    <div className="font-medium text-sm text-muted-foreground">
                      TIME LEFT
                    </div>
                  </div>
                  <div className="w-20 sm:w-24 px-3 sm:px-4 flex items-center">
                    <div className="font-medium text-sm text-muted-foreground">
                      ACTION
                    </div>
                  </div>
                </div>
                {/* Rows */}
                <div>
                  {currentRequests?.map((request) => (
                    <div
                      key={request.id}
                      className="h-16 border-b last:border-b-0 flex hover:bg-muted/50 w-full"
                    >
                      <div className="flex-1 min-w-[180px] px-3 sm:px-4 flex items-center border-r">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                            <AvatarImage
                              src={(request as any)?.staff?.avatar}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials((request as any)?.staff?.name || "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate text-sm sm:text-base">
                            {(request as any)?.staff?.name || ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-[120px] px-3 sm:px-4 flex items-center border-r">
                        <span
                          className={`truncate text-sm sm:text-base ${
                            request.status === "overdue"
                              ? "text-destructive font-medium"
                              : ""
                          }`}
                        >
                          {""}
                        </span>
                      </div>
                      <div className="w-20 sm:w-24 px-3 sm:px-4 flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClick(request.id)}
                          className="text-primary hover:text-primary/80 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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

            {Array.from({ length: totalPages || 0 }, (_, i) => i + 1)?.map(
              (page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

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
