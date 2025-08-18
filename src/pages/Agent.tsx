import { useMemo, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { useStaff } from "@/hooks/use-api-query"
import { Staff } from "@/api/types"
import { useAuthProvider } from "@/Providers/hooks"

export default function Agent() {
  const { data: staff, isLoading: staffLoading, error: staffError } = useStaff();
  const { user, isLoading: userLoading } = useAuthProvider();

  const [agentMembers, setAgentMembers] = useState<Staff[]>(staff)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editAgentId, setEditAgentId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const { toast } = useToast()

  if (staffLoading || userLoading) {
    return <div>Loading agents...</div>;
  }

  if (staffError) {
    return <div>Error loading agents: {staffError.message}</div>;
  }

  const filteredAgent = useMemo(() => {
    if (!agentMembers) return [];
    
    return agentMembers.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agentMembers, searchTerm]);

  const handleAddAgent = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      })
      return
    }

    const newAgent: Staff = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: "",
    }

    setAgentMembers([...agentMembers, newAgent])
    setFormData({ name: "", email: "", phone: "" })
    setIsAddDialogOpen(false)
    
    toast({
      title: "Agent added",
      description: `${formData.name} has been added successfully`
    })
  }

  const handleDeleteAgent = (agentId: string) => {
    const agent = agentMembers.find(s => s.id === agentId)
    setAgentMembers(agentMembers.filter(s => s.id !== agentId))
    
    toast({
      title: "Agent removed",
      description: `${agent?.name} has been removed successfully`
    })
  }

  const openEditDialog = (agent: Staff) => {
    setEditAgentId(agent.id)
    setEditFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone ?? "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateAgent = () => {
    if (!editAgentId || !editFormData.name || !editFormData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setAgentMembers((prev) =>
      prev.map((s) =>
        s.id === editAgentId
          ? { ...s, name: editFormData.name, email: editFormData.email, phone: editFormData.phone || undefined }
          : s
      )
    )

    toast({
      title: "Agent updated",
      description: `${editFormData.name} has been updated successfully`,
    })

    setIsEditDialogOpen(false)
    setEditAgentId(null)
  }

  // const toggleAgentStatus = (agentId: string) => {
  //   setAgentMembers(agentMembers.map(agent =>
  //     agent.id === agentId
  //       ? { ...agent, status: agent.status === "Active" ? "Inactive" : "Active" }
  //       : agent
  //   ))
  // }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // const getStatusBadgeVariant = (status: Staff["status"]) => {
  //   return status === "Active" ? "default" : "secondary"
  // }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap space-y-5 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your agents
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Add a new agent to your organization.
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
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAgent}>Add Agent</Button>
              </div>
          </DialogContent>
        </Dialog>

        {/* Edit Agent Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>Update the agent details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone (Optional)</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAgent}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Agent Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgent.map((agent) => (
          <Card key={agent.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {/* <AvatarImage src={agent.avatar} /> */}
                  <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(agent)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => toggleAgentStatus(agent.id)}>
                    {agent.status === "Active" ? "Deactivate" : "Activate"}
                  </DropdownMenuItem> */}
                  <DropdownMenuItem 
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="flex items-center justify-between">
                <Badge variant={getStatusBadgeVariant(agent.status)}>{agent.status}</Badge>
              </div> */}
              
              {agent.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {agent.phone}
                </div>
              )}
              
              {/* <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{agent.activeRequests}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{agent.completedRequests}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{agent.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
              </div> */}
              
              {/* <div className="text-xs text-muted-foreground">
                Joined {agent.joinedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agents found matching your search.</p>
        </div>
      )}
    </div>
  )
}