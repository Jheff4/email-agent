import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import ChangePasswordModal from "./change-password";
import { useLogout } from "@/hooks/use-auth";
import { useAuthProvider } from "@/Providers/hooks";

export function UserMenu() {
  const { user, isLoading, refetch } = useAuthProvider();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Don't render if still loading or no user
  if (isLoading || !user) {
    return (
      <Button variant="outline" size="icon" className="h-8 w-8" disabled>
        <Avatar className="h-6 w-6">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    window.location.href = "";
    await refetch();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Avatar className="h-6 w-6">
              <AvatarImage
                // src={user.avatar}
                alt={user.name || user.email || "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                // src={user.avatar}
                alt={user.name || user.email || "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                setShowChangePassword(true);
                setOpen(false);
              }}
            >
              Change password
            </Button>
            <Button
              variant="ghost"
              className="justify-start"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <ChangePasswordModal
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </>
  );
}

export default UserMenu;
