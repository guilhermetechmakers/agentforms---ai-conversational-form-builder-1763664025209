import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  UserX,
  UserCheck,
} from 'lucide-react';
import type { AdminUser } from '@/types/admin';
import { EditUserRoleDialog } from './EditUserRoleDialog';
import { DeactivateUserDialog } from './DeactivateUserDialog';
import { useActivateUser } from '@/hooks/useAdmin';

interface UserManagementTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onInviteClick?: () => void;
}

export function UserManagementTable({ users, isLoading }: UserManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const activateUser = useActivateUser();

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Name',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-charcoal">
                  {user.full_name || 'No name'}
                </div>
                <div className="text-sm text-medium-gray">{user.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const role = row.original.role;
          const roleColors = {
            admin: 'bg-deep-orange/20 text-deep-orange',
            member: 'bg-light-blue/20 text-light-blue',
            viewer: 'bg-medium-gray/20 text-medium-gray',
          };
          return (
            <Badge className={roleColors[role] || ''}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors = {
            active: 'bg-green-500/20 text-green-700',
            inactive: 'bg-medium-gray/20 text-medium-gray',
            suspended: 'bg-red-500/20 text-red-700',
          };
          return (
            <Badge className={statusColors[status] || ''}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'last_active_at',
        header: 'Last Active',
        cell: ({ row }) => {
          const lastActive = row.original.last_active_at;
          if (!lastActive) return <span className="text-medium-gray">Never</span>;
          return (
            <span className="text-sm text-charcoal">
              {format(new Date(lastActive), 'MMM d, yyyy')}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Role
                </DropdownMenuItem>
                {user.status === 'active' ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedUser(user);
                      setDeactivateDialogOpen(true);
                    }}
                    className="text-red-600"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await activateUser.mutateAsync(user.id);
                      } catch (error) {
                        // Error handled by mutation
                      }
                    }}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="card-base p-6 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-pale-gray" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-pale-gray rounded" />
                <div className="h-4 w-32 bg-pale-gray rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-pale-gray overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-medium-gray">No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <EditUserRoleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            user={selectedUser}
          />
          <DeactivateUserDialog
            open={deactivateDialogOpen}
            onOpenChange={setDeactivateDialogOpen}
            user={selectedUser}
          />
        </>
      )}
    </>
  );
}
