import { useMemo, useState, useRef } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
} from "@/hooks/use-api-query";
import { Staff } from "@/api/types";
import { useAuthProvider } from "@/Providers/hooks";
import Loader from "@/components/loader";

// Domain Tags Component
const DomainTags = ({
  assignedDomains,
  onRemove,
  onAdd,
  placeholder = "Enter domain and press Enter",
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDomain();
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      assignedDomains.length > 0
    ) {
      // Remove last domain when backspace on empty input
      onRemove(assignedDomains[assignedDomains.length - 1]);
    }
  };

  const addDomain = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      !assignedDomains.some(
        (domain: string) => domain.toLowerCase() === trimmedValue.toLowerCase()
      )
    ) {
      onAdd(trimmedValue);
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Handle comma-separated input
    if (value.includes(",")) {
      const newDomains = value
        .split(",")
        .map((d: string) => d.trim())
        .filter((d: string) => d);
      newDomains.forEach((domain: string) => {
        if (
          !assignedDomains?.some(
            (existing: string) =>
              existing.toLowerCase() === domain.toLowerCase()
          )
        ) {
          onAdd(domain);
        }
      });
      setInputValue("");
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md bg-background">
        {assignedDomains?.map((domain: string, index: number) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {domain}
            <button
              type="button"
              onClick={() => onRemove(domain)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={addDomain}
          placeholder={assignedDomains.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Type domain names and press Enter or comma to add. Click × to remove.
      </p>
    </div>
  );
};

export default function Agent() {
  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
    refetch,
  } = useStaff();
  const { user, isLoading: userLoading } = useAuthProvider();

  // mutation hooks
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    createdAt: "",
    assignedDomains: [] as string[],
  });

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAgentId, setEditAgentId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    assignedDomains: [] as string[],
  });

  // Loading states for operations
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false);
  const [isDeletingAgent, setIsDeletingAgent] = useState(null);

  const { toast } = useToast();

  // Get all agents
  const allAgents = useMemo(() => {
    // Get agents from API and filter out admins
    const apiAgents = staffData && Array.isArray((staffData as any).staff)
      ? (staffData as any).staff.filter((agent: any) => !agent.isAdmin)
      : [];
  
    const uniqueAgents = apiAgents.reduce((acc, agent) => {
      const existing = acc.find(
        (a) => a.email.toLowerCase() === agent.email.toLowerCase()
      );
      if (!existing) {
        // Ensure assignedDomains is always an array
        const processedAgent = {
          ...agent,
          assignedDomains: Array.isArray(agent.assignedDomains) 
            ? agent.assignedDomains
            : typeof agent.assignedDomains === 'string' 
              ? agent.assignedDomains.split(',').map((d: string) => d.trim()).filter(Boolean)
              : []
        };
        acc.push(processedAgent);
      }
      return acc;
    }, []);
  
    return uniqueAgents;
  }, [staffData]);

  const filteredAgents = useMemo(() => {
    if (!allAgents || !Array.isArray(allAgents)) return [];

    return allAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.assignedDomains &&
          agent.assignedDomains.some((domain: string) =>
            domain.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );
  }, [allAgents, searchTerm]);

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
    );
  }

  const handleAddAgent = async () => {
    // Check if email already exists
    if (
      allAgents.find(
        (agent) => agent.email.toLowerCase() === formData.email.toLowerCase()
      )
    ) {
      toast({
        title: "Error",
        description: "An agent with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const newAgentData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      assignedDomains: formData.assignedDomains.length > 0 ? formData.assignedDomains : undefined,
      address: "",
    };

    createStaffMutation.mutate(newAgentData as any, {
      onSuccess: () => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          createdAt: "",
          assignedDomains: [],
        });
        setIsAddDialogOpen(false);
        toast({
          title: "Agent added",
          description: `${newAgentData.name} has been added successfully`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to add agent",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteAgent = async (agentId: string) => {
    const agent = allAgents.find((a) => a.id === agentId);
    if (!agent) return;

    if (agentId.startsWith("local_")) {
      // Delete local agent from state
      toast({
        title: "Agent removed",
        description: `${agent.name} has been removed successfully`,
      });
    } else {
      // Delete via API using mutation
      deleteStaffMutation.mutate(agentId, {
        onSuccess: () => {
          toast({
            title: "Agent removed",
            description: `${agent.name} has been removed successfully`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description:
              error instanceof Error ? error.message : "Failed to remove agent",
            variant: "destructive",
          });
        },
      });
    }
  };

  const openEditDialog = (agent: any) => {
    setEditAgentId(agent.id);
    setEditFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || "",
      assignedDomains: agent.assignedDomains || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAgent = async () => {
    if (
      !editAgentId ||
      !editFormData.name.trim() ||
      !editFormData.email.trim()
    ) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists for another agent
    const existingAgent = allAgents.find(
      (agent: any) =>
        agent.email.toLowerCase() === editFormData.email.toLowerCase() &&
        agent.id !== editAgentId
    );

    if (existingAgent) {
      toast({
        title: "Error",
        description: "An agent with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const updatedData = {
      name: editFormData.name.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim() || undefined,
      assignedDomains: editFormData.assignedDomains.length > 0 ? editFormData.assignedDomains : undefined,
    };
    console.log('updatedData', updatedData);
    updateStaffMutation.mutate(
      { id: editAgentId, data: updatedData },
      {
        onSuccess: () => {
          toast({
            title: "Agent updated",
            description: `${updatedData.name} has been updated successfully`,
          });
          setIsEditDialogOpen(false);
          setEditAgentId(null);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to update agent",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      createdAt: "",
      assignedDomains: [],
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      name: "",
      email: "",
      phone: "",
      assignedDomains: [],
    });
    setEditAgentId(null);
  };

  // Domain management functions
  const handleAddDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedDomains: [...prev.assignedDomains, domain],
    }));
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedDomains: prev.assignedDomains.filter(
        (domain) => domain !== domainToRemove
      ),
    }));
  };

  const handleEditAddDomain = (domain: string) => {
    setEditFormData((prev) => ({
      ...prev,
      assignedDomains: [...prev.assignedDomains, domain],
    }));
  };

  const handleEditRemoveDomain = (domainToRemove: string) => {
    setEditFormData((prev) => ({
      ...prev,
      assignedDomains: prev.assignedDomains.filter(
        (domain) => domain !== domainToRemove
      ),
    }));
  };

  return (
    <>
      {(staffLoading || userLoading) && <Loader />}

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap space-y-5 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Agent Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your agents ({allAgents.length} total)
            </p>
          </div>

          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={createStaffMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createStaffMutation.isPending ? "Adding..." : "Add Agent"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    disabled={isAddingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    disabled={isAddingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Domains</Label>
                  <DomainTags
                    assignedDomains={formData.assignedDomains}
                    onAdd={handleAddDomain}
                    onRemove={handleRemoveDomain}
                    placeholder="Add domains (e.g. example.com)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
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
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) resetEditForm();
            }}
          >
            <DialogContent className="sm:max-w-[525px]">
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
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter email address"
                    disabled={isUpdatingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone (Optional)</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    disabled={isUpdatingAgent}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Domains</Label>
                  <DomainTags
                    assignedDomains={editFormData.assignedDomains}
                    onAdd={handleEditAddDomain}
                    onRemove={handleEditRemoveDomain}
                    placeholder="Add domains (e.g. example.com)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetEditForm();
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
                      {agent.id.startsWith("local_") && (
                        <Badge variant="secondary" className="text-xs">
                          Local
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {agent.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeletingAgent === agent.id}
                    >
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
                {agent.assignedDomains && agent.assignedDomains.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Domains</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.assignedDomains.map((domain, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Added{" "}
                  {new Date(agent.createdAt)?.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
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
            <p className="text-muted-foreground mb-4">
              Get started by adding your first agent.
            </p>
          </div>
        )}

        {allAgents.length > 0 && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground">
              No agents match your search criteria.
            </p>
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
  );
}
