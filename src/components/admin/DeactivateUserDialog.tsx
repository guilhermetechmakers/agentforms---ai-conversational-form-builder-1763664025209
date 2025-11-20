import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeactivateUser } from '@/hooks/useAdmin';
import type { AdminUser } from '@/types/admin';
import { Loader2 } from 'lucide-react';

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser;
}

export function DeactivateUserDialog({
  open,
  onOpenChange,
  user,
}: DeactivateUserDialogProps) {
  const deactivateUser = useDeactivateUser();

  const handleConfirm = async () => {
    try {
      await deactivateUser.mutateAsync(user.id);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate {user.full_name || user.email}?
            They will no longer be able to access the workspace. This action can
            be reversed later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deactivateUser.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deactivateUser.isPending}
            className="bg-red-500 hover:bg-red-600"
          >
            {deactivateUser.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
