import { useState } from "react"
import { Plus, Search, MoreHorizontal, Trash2, Edit, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface StaffMember {
  id: string
  name: string
  email: string
  phone?: string
  role: "Admin" | "Manager" | "Agent"
  status: "Active" | "Inactive"
  avatar?: string
  activeRequests: number
  completedRequests: number
  responseTime: string
  joinedDate: Date
}

// Mock staff data
const mockStaff: StaffMember[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    phone: "+1 (555) 123-4567",
    role: "Manager",
    status: "Active",
    activeRequests: 8,
    completedRequests: 156,
    responseTime: "1.2h",
    joinedDate: new Date("2023-01-15")
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike@company.com",
    phone: "+1 (555) 234-5678",
    role: "Agent",
    status: "Active",
    activeRequests: 12,
    completedRequests: 243,
    responseTime: "2.1h",
    joinedDate: new Date("2023-03-22")
  },
  {
    id: "3",
    name: "Lisa Chen",
    email: "lisa@company.com",
    role: "Agent",
    status: "Active",
    activeRequests: 6,
    completedRequests: 187,
    responseTime: "1.8h",
    joinedDate: new Date("2023-02-10")
  },
  {
    id: "4",
    name: "David Kim",
    email: "david@company.com",
    phone: "+1 (555) 345-6789",
    role: "Admin",
    status: "Active",
    activeRequests: 3,
    completedRequests: 89,
    responseTime: "0.9h",
    joinedDate: new Date("2022-11-08")
  },
  {
    id: "5",
    name: "Anna Lee",
    email: "anna@company.com",
    role: "Agent",
    status: "Inactive",
    activeRequests: 0,
    completedRequests: 134,
    responseTime: "2.3h",
    joinedDate: new Date("2023-05-17")
  }
]

export default function Staff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaff)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Agent" as StaffMember["role"]
  })
  const { toast } = useToast()

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddStaff = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      })
      return
    }

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "Active",
      activeRequests: 0,
      completedRequests: 0,
      responseTime: "0h",
      joinedDate: new Date()
    }

    setStaffMembers([...staffMembers, newStaff])
    setFormData({ name: "", email: "", phone: "", role: "Agent" })
    setIsAddDialogOpen(false)
    
    toast({
      title: "Staff member added",
      description: `${formData.name} has been added successfully`
    })
  }

  const handleDeleteStaff = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    setStaffMembers(staffMembers.filter(s => s.id !== staffId))
    
    toast({
      title: "Staff member removed",
      description: `${staff?.name} has been removed from the team`
    })
  }

  const toggleStaffStatus = (staffId: string) => {
    setStaffMembers(staffMembers.map(staff =>
      staff.id === staffId
        ? { ...staff, status: staff.status === "Active" ? "Inactive" : "Active" }
        : staff
    ))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeVariant = (role: StaffMember["role"]) => {
    switch (role) {
      case "Admin": return "default"
      case "Manager": return "secondary"
      case "Agent": return "outline"
    }
  }

  const getStatusBadgeVariant = (status: StaffMember["status"]) => {
    return status === "Active" ? "default" : "secondary"
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: StaffMember["role"]) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agent">Agent</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStaff}>Add Staff Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Staff Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.map((staff) => (
          <Card key={staff.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={staff.avatar} />
                  <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{staff.name}</h3>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleStaffStatus(staff.id)}>
                    {staff.status === "Active" ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={getRoleBadgeVariant(staff.role)}>{staff.role}</Badge>
                <Badge variant={getStatusBadgeVariant(staff.status)}>{staff.status}</Badge>
              </div>
              
              {staff.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {staff.phone}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{staff.activeRequests}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{staff.completedRequests}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{staff.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Joined {staff.joinedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No staff members found matching your search.</p>
        </div>
      )}
    </div>
  )
}