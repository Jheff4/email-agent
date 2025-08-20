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
import { Loader, Search } from "lucide-react"
import { useRequests, useAdmins, useStaff } from "@/hooks/use-api-query"
import { useAuthProvider } from "@/Providers/hooks"
import { useRequestTimer } from "@/hooks/use-request-timer"

const ITEMS_PER_PAGE = 5

interface ClientRequestsTableProps {
  onViewRequest?: (requestId: string) => void
}

export function ClientRequestsTable({ onViewRequest }: ClientRequestsTableProps) {
  const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useRequests()
  const { user, isLoading: userLoading } = useAuthProvider()
  const { data: adminsData, isLoading: adminsLoading } = useAdmins()
  const { data: staffData, isLoading: staffLoading } = useStaff()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [staffFilter, setStaffFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [monthFilter, setMonthFilter] = useState("")

  // Ensure requests is always an array
  const requests = (requestsData && Array.isArray((requestsData as any).requests)) ? (requestsData as any).requests : []

  // Merge admins and staff data for the filter dropdown
  const allStaffMembers = useMemo(() => {
    const adminList = Array.isArray(adminsData) ? adminsData : (adminsData as any)?.admins || []
    const staffList = Array.isArray(staffData) ? staffData : (staffData as any)?.staff || []
    
    // Combine both arrays and create a map for easy lookup
    const combined = [
      ...adminList.map((admin: any) => ({ ...admin, role: 'manager' })),
      ...staffList.map((staff: any) => ({ ...staff, role: 'agent' }))
    ]
    
    return combined
  }, [adminsData, staffData])

  // Create a staff lookup map for quick name resolution
  const staffLookup = useMemo(() => {
    const lookup = new Map()
    allStaffMembers.forEach((member: any) => {
      lookup.set(member.id, member)
    })
    return lookup
  }, [allStaffMembers])

  // Get staff name by ID
  const getStaffNameById = (staffId: string) => {
    const staff = staffLookup.get(staffId)
    return staff ? staff.name : "No Staff"
  }

  // Get unique staff members for filter (from requests data)
  const staffMembersForFilter = useMemo(() => {
    if (allStaffMembers.length === 0) return []
    
    // Get unique staff IDs from requests
    const uniqueStaffIds = [...new Set(allStaffMembers.map((req: any) => req.id).filter(Boolean))]
    
    // Map to staff objects with names
    const staffWithNames = uniqueStaffIds.map((staffId: string) => {
      const staff = staffLookup.get(staffId)
      return {
        id: staffId,
        name: staff ? staff.name : "No Staff",
        role: staff ? staff.role : 'unknown'
      }
    })
    
    return staffWithNames.sort((a, b) => a.name.localeCompare(b.name))
  }, [allStaffMembers, staffLookup])

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    if (requests.length === 0) return []
    const months = [...new Set(requests.map((req: any) => {
      const date = new Date(req.createdAt)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }))]
    return months.sort().reverse() // Most recent first
  }, [requests])

  // Calculate remaining time for a request using the hook
  const RequestRow = ({ request }: { request: any }) => {
    const { remainingSeconds, isOverdue, formatDuration } = useRequestTimer(request.createdAt)
    const staffMember = staffLookup.get(request.staffId)
    const staffName = staffMember ? staffMember.name : (request.staff?.name || 'Unassigned')
    const isActive = request.status === "Pending" || request.status === "Ongoing"
    
    return (
      <TableRow>
        <TableCell className="min-w-[200px]">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(request.client?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">{request.client?.name || 'Unknown Client'}</p>
              <p className="text-sm text-muted-foreground">{request.client?.email || ''}</p>
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
                  {staffMember.role === 'admin' ? 'Manager' : 'Agent'}
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
            if (isOverdue) {
              return <span className="text-sm text-destructive font-medium">{formatDuration(remainingSeconds)}</span>
            }
            
            return <span className="text-sm">{formatDuration(remainingSeconds)}</span>
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
    )
  }

  // Filter requests based on search and filters
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Get actual names for search
      const clientName = request.client?.name || request.clientId || ''
      const clientEmail = request.client?.email || ''
      const staffName = getStaffNameById(request.staffId)
      
      const matchesSearch = 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStaff = staffFilter === "" || staffFilter === "all" || request.staffId === staffFilter
      const matchesStatus = statusFilter === "" || statusFilter === "all" || request.status === statusFilter
      const matchesMonth = monthFilter === "" || monthFilter === "all" || (() => {
        const requestDate = new Date(request.createdAt)
        const requestMonth = `${requestDate.getFullYear()}-${String(requestDate.getMonth() + 1).padStart(2, '0')}`
        return requestMonth === monthFilter
      })()
      
      return matchesSearch && matchesStaff && matchesStatus && matchesMonth
    })
  }, [requests, searchTerm, staffFilter, statusFilter, monthFilter, staffLookup])
  
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRequests = filteredRequests.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, staffFilter, statusFilter, monthFilter])

  const getStatusBadge = (status: string, isOverdue = false) => {
    // const isActive = status === "Pending" || status === "Ongoing"
    const effective = (isOverdue) ? "Overdue" : status
    
    switch (effective) {
      case "Pending":
      case "Ongoing":
        return <Badge variant="secondary">{effective}</Badge>
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      default:
        return <Badge variant="secondary">{effective}</Badge>
    }
  }

  const handleViewClick = (requestId: string) => {
    onViewRequest?.(requestId)
  }

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  // Loading state
  if (requestsLoading || userLoading || adminsLoading || staffLoading) {
    return (
      <Loader />
    )
  }

  // Error state
  if (requestsError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-destructive">Error loading requests: {requestsError.message}</div>
        </div>
      </div>
    )
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
              {staffMembersForFilter.map(staff => (
                <SelectItem key={staff.id.toString()} value={staff.id.toString()}>
                  {staff.name} {staff.role === 'manager' ? '(manager)' : '(agent)'}
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
              {currentRequests.length == 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No requests match your filters
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