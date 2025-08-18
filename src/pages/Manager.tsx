import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Mail,
  Phone,
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
import { useAdmins, useCreateAdmin } from "@/hooks/use-api-query";

interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "Active" | "Inactive";
  avatar?: string;
  activeRequests: number;
  completedRequests: number;
  responseTime: string;
  joinedDate: Date;
}

// Mock manager data
const mockManagers: Manager[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    activeRequests: 8,
    completedRequests: 156,
    responseTime: "1.2h",
    joinedDate: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike@company.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    activeRequests: 12,
    completedRequests: 243,
    responseTime: "2.1h",
    joinedDate: new Date("2023-03-22"),
  },
  {
    id: "3",
    name: "Lisa Chen",
    email: "lisa@company.com",
    status: "Active",
    activeRequests: 6,
    completedRequests: 187,
    responseTime: "1.8h",
    joinedDate: new Date("2023-02-10"),
  },
  {
    id: "4",
    name: "David Kim",
    email: "david@company.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    activeRequests: 3,
    completedRequests: 89,
    responseTime: "0.9h",
    joinedDate: new Date("2022-11-08"),
  },
  {
    id: "5",
    name: "Anna Lee",
    email: "anna@company.com",
    status: "Inactive",
    activeRequests: 0,
    completedRequests: 134,
    responseTime: "2.3h",
    joinedDate: new Date("2023-05-17"),
  },
];

export default function Manager() {
  const { data: managers } = useAdmins();
  // const [managers, setManagers] = useState<Manager[]>(mockManagers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editManagerId, setEditManagerId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const { mutate: createAdmin, isPending } = useCreateAdmin();

  const { toast } = useToast();

  const filteredManagers = managers?.filter(
    (manager) =>
      manager.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleAddManager = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    createAdmin({ ...formData } as any);

    setIsAddDialogOpen(false);

    toast({
      title: "Manager added",
      description: `${formData.name} has been added successfully`,
    });
  };

  const handleDeleteManager = (managerId: string) => {
    const manager = managers.find((m) => m.id === managerId);
    // setManagers(managers.filter((m) => m.id !== managerId));

    toast({
      title: "Manager removed",
      description: `${manager?.name} has been removed from the team`,
    });
  };

  const openEditDialog = (manager: Manager) => {
    setEditManagerId(manager.id);
    setEditFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone ?? "",
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateManager = () => {
    if (
      !editManagerId ||
      !editFormData.name ||
      !editFormData.email ||
      !editFormData.password
    ) {
      toast({
        title: "Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    // setManagers((prev) =>
    //   prev.map((m) =>
    //     m.id === editManagerId
    //       ? {
    //           ...m,
    //           name: editFormData.name,
    //           email: editFormData.email,
    //           phone: editFormData.phone || undefined,
    //         }
    //       : m
    //   )
    // );

    toast({
      title: "Manager updated",
      description: `${editFormData.name} has been updated successfully`,
    });

    setIsEditDialogOpen(false);
    setEditManagerId(null);
  };

  const toggleManagerStatus = (managerId: string) => {};

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase();
  };

  const getStatusBadgeVariant = (status: Manager["status"]) => {
    return status === "Active" ? "default" : "secondary";
  };

  console.log({ managers });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap space-y-5 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manager Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your managers and their permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
              <DialogDescription>
                Add a new manager to your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddManager}>Add Manager</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Manager Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Manager</DialogTitle>
              <DialogDescription>Update the manager details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone (Optional)</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateManager}>Save Changes</Button>
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
          <Card key={manager.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={manager.avatar} />
                  <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{manager.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {manager.email}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(manager)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleManagerStatus(manager.id)}
                  >
                    {manager.status === "Active" ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteManager(manager.id)}
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
                <Badge variant={getStatusBadgeVariant(manager.status)}>
                  {manager.status}
                </Badge>
              </div>

              {manager.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {manager.phone}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Joined{" "}
                {manager.joinedDate?.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredManagers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No managers found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
