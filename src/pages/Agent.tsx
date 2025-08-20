import { useMemo, useState, useEffect } from "react"
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
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/use-api-query"
import { Staff } from "@/api/types"
import { useAuthProvider } from "@/Providers/hooks"
import Loader from "@/components/loader"

export default function Agent() {
  const { data: staffData, isLoading: staffLoading, error: staffError, refetch } = useStaff()
  const { user, isLoading: userLoading } = useAuthProvider()
  
  // mutation hooks
  const createStaffMutation = useCreateStaff()
  const updateStaffMutation = useUpdateStaff()
  const deleteStaffMutation = useDeleteStaff()

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

  // Loading states for operations
  const [isAddingAgent, setIsAddingAgent] = useState(false)
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false)
  const [isDeletingAgent, setIsDeletingAgent] = useState<string | null>(null)

  // useEffect(() => {
  //   if (user && !userLoading) {
  //     refetch()
  //   }
  // }, [user, userLoading, refetch])

  const { toast } = useToast()

  // Get all agents
  const allAgents = useMemo(() => {
    // Get agents from API
    const apiAgents = (staffData && Array.isArray((staffData as any).staff)) ? (staffData as any).staff : []
    
    // Remove duplicates by email
    const uniqueAgents = apiAgents.reduce((acc: Staff[], agent: Staff) => {
      const existing = acc.find(a => a.email.toLowerCase() === agent.email.toLowerCase())
      if (!existing) {
        acc.push(agent)
      }
      return acc
    }, [])

    return uniqueAgents
  }, [staffData])

  const filteredAgents = useMemo(() => {
    if (!allAgents || !Array.isArray(allAgents)) return []
    
    return allAgents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allAgents, searchTerm])

  if (staffError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading agents</p>
          <p className="text-muted-foreground text-sm">
            {staffError instanceof Error ? staffError.message : "Unknown error"}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const handleAddAgent = async () => {
    // Check if email already exists
    if (allAgents.find(agent => agent.email.toLowerCase() === formData.email.toLowerCase())) {
      toast({
        title: "Error",
        description: "An agent with this email already exists",
        variant: "destructive",
      })
      return
    }

    const newAgentData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      address: "",
    }

    createStaffMutation.mutate(newAgentData, {
      onSuccess: () => {
        setFormData({ name: "", email: "", phone: "" })
        setIsAddDialogOpen(false)
        toast({
          title: "Agent added",
          description: `${newAgentData.name} has been added successfully`,
        })
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add agent",
          variant: "destructive",
        })
      }
    })
  }

  const handleDeleteAgent = async (agentId: string) => {
    const agent = allAgents.find(a => a.id === agentId)
    if (!agent) return

    if (agentId.startsWith('local_')) {
      // Delete local agent from state
      toast({
        title: "Agent removed",
        description: `${agent.name} has been removed successfully`
      })
    } else {
      // Delete via API using mutation
      deleteStaffMutation.mutate(agentId, {
        onSuccess: () => {
          toast({
            title: "Agent removed",
            description: `${agent.name} has been removed successfully`
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to remove agent",
            variant: "destructive",
          })
        }
      })
    }
  }

  const openEditDialog = (agent: Staff) => {
    setEditAgentId(agent.id)
    setEditFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateAgent = async () => {
    if (!editAgentId || !editFormData.name.trim() || !editFormData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    // Check if email already exists for another agent
    const existingAgent = allAgents.find(agent => 
      agent.email.toLowerCase() === editFormData.email.toLowerCase() && 
      agent.id !== editAgentId
    )
    
    if (existingAgent) {
      toast({
        title: "Error",
        description: "An agent with this email already exists",
        variant: "destructive",
      })
      return
    }

    const updatedData = {
      name: editFormData.name.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim() || undefined,
    }

    if (editAgentId.startsWith('local_')) {
      // Update local agent in state
      toast({
        title: "Agent updated",
        description: `${updatedData.name} has been updated successfully`,
      })
      setIsEditDialogOpen(false)
      setEditAgentId(null)
    } else {
      // Update via API using mutation
      updateStaffMutation.mutate({ id: editAgentId, data: updatedData }, {
        onSuccess: () => {
          toast({
            title: "Agent updated",
            description: `${updatedData.name} has been updated successfully`,
          })
          setIsEditDialogOpen(false)
          setEditAgentId(null)
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to update agent",
            variant: "destructive",
          })
        }
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" })
  }

  const resetEditForm = () => {
    setEditFormData({ name: "", email: "", phone: "" })
    setEditAgentId(null)
  }

  return (
    <>
      {(staffLoading || userLoading) && <Loader />}
      
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap space-y-5 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your agents ({allAgents.length} total)
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button disabled={createStaffMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createStaffMutation.isPending ? "Adding..." : "Add Agent"}
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    disabled={isAddingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    disabled={isAddingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    disabled={isAddingAgent}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  disabled={isAddingAgent}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAgent} disabled={isAddingAgent}>
                  {isAddingAgent ? "Adding..." : "Add Agent"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Agent Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) resetEditForm()
          }}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Agent</DialogTitle>
                <DialogDescription>Update the agent details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Enter full name"
                    disabled={isUpdatingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="Enter email address"
                    disabled={isUpdatingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone (Optional)</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    disabled={isUpdatingAgent}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    resetEditForm()
                  }}
                  disabled={isUpdatingAgent}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateAgent} disabled={isUpdatingAgent}>
                  {isUpdatingAgent ? "Saving..." : "Save Changes"}
                </Button>
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
          {filteredAgents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{agent.name}</h3>
                      {agent.id.startsWith('local_') && (
                        <Badge variant="secondary" className="text-xs">Local</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{agent.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isDeletingAgent === agent.id}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(agent)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-destructive"
                      disabled={isDeletingAgent === agent.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeletingAgent === agent.id ? "Removing..." : "Remove"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span className="truncate">{agent.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty States */}
        {allAgents.length === 0 && !staffLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first agent.</p>
          </div>
        )}

        {allAgents.length > 0 && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">No agents match your search criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </>
  )
}