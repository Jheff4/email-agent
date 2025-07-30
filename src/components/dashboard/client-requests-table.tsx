import { useState } from "react"
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
  timeLeft: string
  status: "Pending" | "Overdue" | "Completed"
}

// Mock data
const mockRequests: ClientRequest[] = [
  {
    id: "1",
    client: { name: "John Smith", email: "john@example.com" },
    staff: { name: "Sarah Wilson" },
    timeLeft: "6h 23m",
    status: "Pending"
  },
  {
    id: "2",
    client: { name: "Emily Davis", email: "emily@company.com" },
    staff: { name: "Mike Johnson" },
    timeLeft: "Overdue",
    status: "Overdue"
  },
  {
    id: "3",
    client: { name: "Robert Brown", email: "robert@startup.io" },
    staff: { name: "Lisa Chen" },
    timeLeft: "Responded",
    status: "Completed"
  },
  {
    id: "4",
    client: { name: "Maria Garcia", email: "maria@tech.com" },
    staff: { name: "David Kim" },
    timeLeft: "2h 15m",
    status: "Pending"
  },
  {
    id: "5",
    client: { name: "James Wilson", email: "james@digital.co" },
    staff: { name: "Anna Lee" },
    timeLeft: "4h 30m",
    status: "Pending"
  },
  {
    id: "6",
    client: { name: "Lisa Anderson", email: "lisa@business.net" },
    staff: { name: "Tom Rodriguez" },
    timeLeft: "Overdue",
    status: "Overdue"
  },
  {
    id: "7",
    client: { name: "Michael Chang", email: "michael@solutions.io" },
    staff: { name: "Emma White" },
    timeLeft: "1h 45m",
    status: "Pending"
  },
  {
    id: "8",
    client: { name: "Sarah Thompson", email: "sarah@consulting.com" },
    staff: { name: "Alex Johnson" },
    timeLeft: "Responded",
    status: "Completed"
  }
]

const ITEMS_PER_PAGE = 5

export function ClientRequestsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(mockRequests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRequests = mockRequests.slice(startIndex, endIndex)

  const getStatusBadge = (status: ClientRequest["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "Completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewClick = (requestId: string) => {
    // Handle view action - this could navigate to a detail page or open a modal
    console.log("Viewing request:", requestId)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
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
            {currentRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.client.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(request.client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.client.name}</p>
                      <p className="text-sm text-muted-foreground">{request.client.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
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
                <TableCell>
                  <span className={request.timeLeft === "Overdue" ? "text-destructive font-medium" : ""}>
                    {request.timeLeft}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.status)}
                </TableCell>
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