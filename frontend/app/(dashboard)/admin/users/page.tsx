'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi, PaginatedUsers } from '../../../../lib/api/admin.api';
import type { User, UserRole } from '../../../../types/auth.types';
import { Button } from '../../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../../components/ui/card';
import { UserTableRowSkeleton } from '../../../../components/ui/skeleton';

const ROLE_OPTIONS: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All Roles', value: 'all' },
  { label: 'Shippers', value: 'shipper' },
  { label: 'Carriers', value: 'carrier' },
  { label: 'Admins', value: 'admin' },
];

const STATUS_OPTIONS: { label: string; value: boolean | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [result, setResult] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<boolean | 'all'>('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 20,
      })
      .then(setResult)
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [roleFilter, statusFilter, page]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
    load();
  }, [currentUser, load]);

  const handleToggleActive = async (user: User) => {
    setActionLoading(user.id);
    try {
      const updated = user.isActive
        ? await adminApi.deactivateUser(user.id)
        : await adminApi.activateUser(user.id);
      toast.success(`${updated.firstName} ${updated.isActive ? 'activated' : 'deactivated'}`);
      load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (user: User, newRole: UserRole) => {
    setActionLoading(user.id + '_role');
    try {
      await adminApi.changeUserRole(user.id, newRole);
      toast.success(`Role updated to ${newRole}`);
      load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {result ? `${result.total} total users` : 'Loading…'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 border border-border rounded-md overflow-hidden">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => { setRoleFilter(opt.value as UserRole | 'all'); setPage(1); }}
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
        <div className="flex gap-1 border border-border rounded-md overflow-hidden">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => { setStatusFilter(opt.value as boolean | 'all'); setPage(1); }}
              className={`px-3 py-1.5 text-sm transition-colors ${
                statusFilter === opt.value
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
      {loading ? (
        <div className="rounded-xl border bg-card shadow divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <UserTableRowSkeleton key={i} />
          ))}
        </div>
      ) : !result || result.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No users found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>
              Page {result.page} of {result.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.data.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    return (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {user.firstName} {user.lastName}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          {isSelf ? (
                            <span className="capitalize text-muted-foreground">{user.role}</span>
                          ) : (
                            <select
                              value={user.role}
                              disabled={actionLoading === user.id + '_role'}
                              onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                              className="text-sm bg-background border border-border rounded px-2 py-1 capitalize cursor-pointer"
                            >
                              <option value="shipper">Shipper</option>
                              <option value="carrier">Carrier</option>
                              <option value="admin">Admin</option>
                            </select>
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
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!isSelf && (
                            <Button
                              variant={user.isActive ? 'destructive' : 'outline'}
                              size="sm"
                              disabled={actionLoading === user.id}
                              onClick={() => handleToggleActive(user)}
                            >
                              {actionLoading === user.id
                                ? '…'
                                : user.isActive
                                ? 'Deactivate'
                                : 'Activate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
            Showing {result.data.length} of {result.total} users
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
  );
}
