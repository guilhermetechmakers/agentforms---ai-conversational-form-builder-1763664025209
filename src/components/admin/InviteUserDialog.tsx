import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useInviteUser } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
  full_name: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
}: InviteUserDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'member',
    },
  });

  const inviteUser = useInviteUser();
  const role = watch('role');

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteUser.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to join the workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name (Optional)</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...register('full_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) =>
                setValue('role', value as 'admin' | 'member' | 'viewer')
              }
            >
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

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={inviteUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUser.isPending}>
              {inviteUser.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
