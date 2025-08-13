import { useState, useMemo, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

interface ClientRequest {
  id: string
  client: {
    name: string
    email: string
    avatar?: string
  }
  staff: {
    name: string
    avatar?: string
  }
  dateAssigned: string
  timeLeft: string
  status: "Pending" | "Overdue" | "Completed" | "Ongoing"
}

// Mock data
const mockRequests: ClientRequest[] = [
  {
    id: "1",
    client: { name: "John Smith", email: "john@example.com" },
    staff: { name: "Sarah Wilson" },
    dateAssigned: "2025-08-01",
    timeLeft: "6h 23m",
    status: "Pending"
  },
  {
    id: "2",
    client: { name: "Emily Davis", email: "emily@company.com" },
    staff: { name: "Mike Johnson" },
    dateAssigned: "2025-07-29",
    timeLeft: "Overdue",
    status: "Overdue"
  },
  {
    id: "3",
    client: { name: "Robert Brown", email: "robert@startup.io" },
    staff: { name: "Lisa Chen" },
    dateAssigned: "2025-07-28",
    timeLeft: "Responded",
    status: "Completed"
  },
  {
    id: "4",
    client: { name: "Maria Garcia", email: "maria@tech.com" },
    staff: { name: "David Kim" },
    dateAssigned: "2025-08-04",
    timeLeft: "2h 15m",
    status: "Pending"
  },
  {
    id: "5",
    client: { name: "James Wilson", email: "james@digital.co" },
    staff: { name: "Anna Lee" },
    dateAssigned: "2025-08-03",
    timeLeft: "4h 30m",
    status: "Pending"
  },
  {
    id: "6",
    client: { name: "Lisa Anderson", email: "lisa@business.net" },
    staff: { name: "Tom Rodriguez" },
    dateAssigned: "2025-07-30",
    timeLeft: "Overdue",
    status: "Overdue"
  },
  {
    id: "7",
    client: { name: "Michael Chang", email: "michael@solutions.io" },
    staff: { name: "Emma White" },
    dateAssigned: "2025-08-05",
    timeLeft: "1h 45m",
    status: "Pending"
  },
  {
    id: "8",
    client: { name: "Sarah Thompson", email: "sarah@consulting.com" },
    staff: { name: "Alex Johnson" },
    dateAssigned: "2025-07-27",
    timeLeft: "Responded",
    status: "Completed"
  }
]

const ITEMS_PER_PAGE = 5

interface ClientRequestsTableProps {
  onViewRequest?: (requestId: string) => void
}

export function ClientRequestsTable({ onViewRequest }: ClientRequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [staffFilter, setStaffFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")

  // Get unique staff members for filter
  const staffMembers = useMemo(() => {
    const uniqueStaff = [...new Set(mockRequests.map(req => req.staff.name))]
    return uniqueStaff.sort()
  }, [])

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    if (mockRequests.length === 0) return [];
    const months = [...new Set(mockRequests.map(req => {
      const date = new Date(req.dateAssigned);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))];
    return months.sort().reverse(); // Most recent first
  }, []);

  // Filter requests based on search and filters
  const filteredRequests = useMemo(() => {
    return mockRequests.filter(request => {
      const matchesSearch = 
        request.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.staff.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStaff = staffFilter === "all" || request.staff.name === staffFilter
      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesMonth = monthFilter === "all" || (() => {
        const requestDate = new Date(request.dateAssigned);
        const requestMonth = `${requestDate.getFullYear()}-${String(requestDate.getMonth() + 1).padStart(2, '0')}`;
        return requestMonth === monthFilter;
      })();
      
      return matchesSearch && matchesStaff && matchesStatus && matchesMonth
    })
  }, [searchTerm, staffFilter, statusFilter, monthFilter])
  
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRequests = filteredRequests.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, staffFilter, statusFilter, monthFilter])

  // 1-hour global countdown for demo
  const [remainingSeconds, setRemainingSeconds] = useState(3600)
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: ClientRequest["status"], isOverdue = false) => {
    const effective = isOverdue ? "Overdue" : status
    switch (effective) {
      case "Pending":
      case "Ongoing":
        return <Badge variant="secondary">{effective}</Badge>
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "Completed":
        // return <Badge className="bg-success text-success-foreground">Completed</Badge>
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      default:
        return <Badge variant="secondary">{effective}</Badge>
    }
  }

  const handleViewClick = (requestId: string) => {
    onViewRequest?.(requestId)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
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
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {getMonthName(month)}
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
              {staffMembers.map(staff => (
                <SelectItem key={staff} value={staff}>{staff}</SelectItem>
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

      {/* Responsive Table Container */}
      <div className="rounded-md border bg-card overflow-hidden">
        {/* Regular Table with Horizontal Scroll */}
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
              {currentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.client.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium">{request.client.name}</p>
                        <p className="text-sm text-muted-foreground">{request.client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.staff.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <span className="text-sm">
                      {formatDate(request.dateAssigned)}
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                  {(() => {
                    const active = request.status === "Pending" || request.status === "Ongoing"
                    const overdue = active && remainingSeconds <= 0
                    return (
                      <span className={`text-sm ${overdue ? "text-destructive font-medium" : ""}`}>
                        {overdue ? "Overdue" : formatDuration(remainingSeconds)}
                      </span>
                    )
                  })()}
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                  {getStatusBadge(request.status, (request.status === "Pending" || request.status === "Ongoing") && remainingSeconds <= 0)}
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
              ))}
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}