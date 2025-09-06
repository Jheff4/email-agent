import { useState, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Mail,
  Phone,
  X,
  CheckCircle,
  AlertCircle,
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
  useAdmins,
  useCreateAdmin,
  useDeleteAdmin,
  useUpdateAdmin,
} from "@/hooks/use-api-query";
import Loader from "@/components/loader";

interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinedDate: Date;
  assignedDomains?: string[];
}

// Domain Tags Component (same as before)
const DomainTags = ({
  assignedDomains,
  onRemove,
  onAdd,
  placeholder = "Enter domain and press Enter",
}: {
  assignedDomains: string[];
  onRemove: (domain: string) => void;
  onAdd: (domain: string) => void;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDomain();
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      assignedDomains.length > 0
    ) {
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

export default function Manager() {
  const { data: managersData, isLoading: adminsLoading } = useAdmins();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedDomains: [] as string[],
  });
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editManagerId, setEditManagerId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    assignedDomains: [] as string[],
  });
  
  // Optimistic mutations
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();
  const { toast } = useToast();

  // Process managers data with domain handling
  const managers = useMemo(() => {
    if (!managersData) return [];
    
    return managersData.map((manager: any) => {
      let processedDomains = [];
      
      if (Array.isArray(manager.assignedDomains)) {
        processedDomains = manager.assignedDomains.filter(Boolean);
      } else if (typeof manager.assignedDomains === 'string' && manager.assignedDomains.trim()) {
        processedDomains = manager.assignedDomains
          .split(',')
          .map((d: string) => d.trim())
          .filter(Boolean);
      }
      
      return {
        ...manager,
        assignedDomains: processedDomains,
        // Add optimistic state indicators
        isOptimistic: manager.id?.startsWith('temp-'),
        isPendingUpdate: updateMutation.isPending && updateMutation.variables?.id === manager.id,
        isPendingDelete: deleteMutation.isPending && deleteMutation.variables === manager.id,
      };
    });
  }, [managersData, updateMutation.isPending, updateMutation.variables, deleteMutation.isPending, deleteMutation.variables]);

  const filteredManagers = managers?.filter(
    (manager: any) =>
      manager.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (manager.assignedDomains &&
        manager.assignedDomains.some((domain: string) =>
          domain.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  // Optimistic create with immediate UI feedback
  const handleAddManager = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    // Show immediate success toast for optimistic update
    toast({
      title: "Adding manager...",
      description: `${formData.name} is being added`,
    });

    try {
      await createMutation.mutateAsync({
        ...formData,
        assignedDomains: formData.assignedDomains.length > 0 ? formData.assignedDomains : []
      } as any);

      // Success toast after server confirms
      toast({
        title: "Manager added successfully",
        description: `${formData.name} has been added to your team`,
      });
      
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Failed to add manager",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Optimistic delete with immediate UI feedback
  const handleDeleteManager = async (managerId: string, managerName: string) => {
    // Show immediate feedback
    toast({
      title: "Removing manager...",
      description: `${managerName} is being removed`,
    });

    try {
      await deleteMutation.mutateAsync(managerId);
      
      toast({
        title: "Manager removed",
        description: `${managerName} has been removed successfully`,
      });
    } catch (error) {
      toast({
        title: "Failed to remove manager",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Optimistic update with immediate UI feedback
  const handleUpdateManager = async () => {
    if (!editManagerId || !editFormData.name || !editFormData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    // Show immediate feedback
    toast({
      title: "Updating manager...",
      description: `${editFormData.name}'s details are being updated`,
    });

    try {
      await updateMutation.mutateAsync({
        id: editManagerId,
        ...editFormData,
        assignedDomains: editFormData.assignedDomains.length > 0 ? editFormData.assignedDomains : []
      } as any);
      
      toast({
        title: "Manager updated successfully",
        description: `${editFormData.name}'s details have been updated`,
      });
      
      setIsEditDialogOpen(false);
      setEditManagerId(null);
      resetEditForm();
    } catch (error) {
      toast({
        title: "Failed to update manager",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (manager: Manager) => {
    setEditManagerId(manager.id);
    
    let domains = [];
    if (Array.isArray(manager.assignedDomains)) {
      domains = [...manager.assignedDomains];
    } else if (typeof manager.assignedDomains === 'string' && (manager.assignedDomains as any).trim()) {
      domains = (manager.assignedDomains as any).split(',').map((d: string) => d.trim()).filter(Boolean);
    }
    
    setEditFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone ?? "",
      password: "",
      assignedDomains: domains,
    });
    setIsEditDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase()
      .substring(0, 2);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      assignedDomains: [],
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      assignedDomains: [],
    });
    setEditManagerId(null);
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
      {adminsLoading && <Loader />}

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap space-y-5 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manager Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your managers and their permissions ({managers.length} total)
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button disabled={createMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Adding..." : "Add Manager"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Manager</DialogTitle>
                <DialogDescription>
                  Add a new manager to your organization.
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                    disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddManager} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Manager"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Manager Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) resetEditForm();
          }}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Edit Manager</DialogTitle>
                <DialogDescription>
                  Update the manager details.
                </DialogDescription>
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
                    disabled={updateMutation.isPending}
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
                    disabled={updateMutation.isPending}
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
                    disabled={updateMutation.isPending}
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
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateManager} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search managers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Manager Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredManagers?.map((manager) => (
            <Card 
              key={manager.id}
              className={`
                ${manager.isOptimistic ? 'border-blue-200 bg-blue-50/50' : ''}
                ${manager.isPendingUpdate ? 'border-orange-200 bg-orange-50/50' : ''}
                ${manager.isPendingDelete ? 'border-red-200 bg-red-50/50 opacity-50' : ''}
                transition-all duration-200
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                    </Avatar>
                    {/* Status indicators */}
                    {manager.isOptimistic && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {manager.isPendingUpdate && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-white animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{manager.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {manager.email}
                    </p>
                    {manager.isOptimistic && (
                      <p className="text-xs text-blue-600">Adding...</p>
                    )}
                    {manager.isPendingUpdate && (
                      <p className="text-xs text-orange-600">Updating...</p>
                    )}
                    {manager.isPendingDelete && (
                      <p className="text-xs text-red-600">Removing...</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={manager.isPendingDelete || manager.isOptimistic}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => openEditDialog(manager as any)}
                      disabled={manager.isPendingUpdate}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteManager(manager.id, manager.name)}
                      className="text-destructive"
                      disabled={manager.isPendingDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                {manager.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span className="truncate">{manager.phone}</span>
                  </div>
                )}

                {manager.assignedDomains?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Domains</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {manager?.assignedDomains?.map((domain, index) => (
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
                  Joined{" "}
                  {new Date(manager.joinedDate)?.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredManagers?.length === 0 && !adminsLoading && (
          <div className="text-center py-12">
            {managers.length === 0 ? (
              <>
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No managers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first manager.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No managers found</h3>
                <p className="text-muted-foreground">
                  No managers match your search criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}