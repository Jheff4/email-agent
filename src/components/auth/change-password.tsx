import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/api/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (next !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // TODO: integrate with backend endpoint
      // await new Promise((r) => setTimeout(r, 600));
      await authAPI.changePassword({
        currentPassword: current,
        newPassword: next,
      });

      toast({ title: "Password changed" });
      onOpenChange(false);
      setCurrent("");
      setNext("");
      setConfirm("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Current password</label>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">New password</label>
            <Input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm new password</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
