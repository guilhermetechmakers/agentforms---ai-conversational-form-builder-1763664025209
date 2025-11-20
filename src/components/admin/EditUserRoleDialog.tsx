import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUpdateUserRole } from '@/hooks/useAdmin';
import type { AdminUser } from '@/types/admin';
import { Loader2 } from 'lucide-react';

interface EditUserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
}

export function EditUserRoleDialog({
  open,
  onOpenChange,
  user,
}: EditUserRoleDialogProps) {
  const [role, setRole] = useState<string>(user.role);
  const updateRole = useUpdateUserRole();

  const handleSubmit = async () => {
    if (role === user.role) {
      onOpenChange(false);
      return;
    }

    try {
      await updateRole.mutateAsync({
        user_id: user.id,
        role: role as 'admin' | 'member' | 'viewer',
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-medium-gray">
              {role === 'admin' && 'Full access to all features and settings'}
              {role === 'member' && 'Can create and manage agents'}
              {role === 'viewer' && 'Read-only access to agents and sessions'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={updateRole.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRole.isPending || role === user.role}
          >
            {updateRole.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
