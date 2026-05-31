'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserTableRowSkeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import type { User, UserRole } from '@/types/auth.types';

const ROLE_OPTIONS: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All Roles', value: 'all' },
  { label: 'Shipper', value: 'shipper' },
  { label: 'Carrier', value: 'carrier' },
  { label: 'Admin', value: 'admin' },
];

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmModal({ title, message, confirmLabel, variant = 'destructive', onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UserManagementTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{
    user: User;
    action: 'activate' | 'deactivate' | 'changeRole';
    newRole?: UserRole;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: result, isLoading } = useQuery({
    queryKey: ['user-management', debouncedSearch, roleFilter, page],
    queryFn: () =>
      apiClient<PaginatedUsers>(
        `/users?page=${page}&limit=20${roleFilter !== 'all' ? `&role=${roleFilter}` : ''}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`,
      ),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiClient(`/users/${userId}/${isActive ? 'deactivate' : 'activate'}`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['user-management'] });
    },
    onError: () => toast.error('Failed to update user status'),
    onSettled: () => setConfirmAction(null),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      apiClient(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['user-management'] });
    },
    onError: () => toast.error('Failed to change user role'),
    onSettled: () => setConfirmAction(null),
  });

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { user, action, newRole } = confirmAction;

    if (action === 'activate' || action === 'deactivate') {
      toggleActiveMutation.mutate({ userId: user.id, isActive: user.isActive });
    } else if (action === 'changeRole' && newRole) {
      changeRoleMutation.mutate({ userId: user.id, role: newRole });
    }
  };

  const handleRoleChange = (user: User, newRole: UserRole) => {
    setConfirmAction({ user, action: 'changeRole', newRole });
  };

  const handleToggleActive = (user: User) => {
    setConfirmAction({
      user,
      action: user.isActive ? 'deactivate' : 'activate',
    });
  };

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.action === 'changeRole'
              ? `Change role to ${confirmAction.newRole}?`
              : confirmAction.action === 'deactivate'
                ? 'Deactivate User?'
                : 'Activate User?'
          }
          message={
            confirmAction.action === 'changeRole'
              ? `Are you sure you want to change ${confirmAction.user.firstName} ${confirmAction.user.lastName}'s role to ${confirmAction.newRole}?`
              : confirmAction.action === 'deactivate'
                ? `This will deactivate ${confirmAction.user.firstName} ${confirmAction.user.lastName}. They will not be able to log in.`
                : `This will reactivate ${confirmAction.user.firstName} ${confirmAction.user.lastName}.`
          }
          confirmLabel={
            confirmAction.action === 'changeRole'
              ? 'Change Role'
              : confirmAction.action === 'deactivate'
                ? 'Deactivate'
                : 'Activate'
          }
          variant={confirmAction.action === 'deactivate' ? 'destructive' : 'default'}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
          loading={toggleActiveMutation.isPending || changeRoleMutation.isPending}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {result ? `${result.total} total users` : 'Loading...'}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 border border-border rounded-md overflow-hidden">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  setRoleFilter(opt.value as UserRole | 'all');
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  roleFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="rounded-xl border bg-card shadow divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <UserTableRowSkeleton key={i} />
            ))}
          </div>
        ) : !result || result.data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {debouncedSearch
                ? 'No users match your search criteria.'
                : 'No users found.'}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Verified</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.data.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <span className="truncate">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                            className="text-sm bg-background border border-border rounded px-2 py-1 capitalize cursor-pointer"
                          >
                            <option value="shipper">Shipper</option>
                            <option value="carrier">Carrier</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/carriers/${user.id}`, '_blank')}
                            >
                              View
                            </Button>
                            <Button
                              variant={user.isActive ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {result.page} of {result.totalPages} ({result.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === result.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
