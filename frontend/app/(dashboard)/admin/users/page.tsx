'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi } from '../../../../lib/api/admin.api';
import { User } from '../../../../types/auth.types';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers(page, roleFilter, statusFilter);
      setUsers(res.users || []);
      setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.total || 0) / (res.limit || 10))));
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    } else if (user) {
      loadUsers();
    }
  }, [user, router, loadUsers]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      await adminApi.changeUserRole(targetUserId, newRole);
      toast.success('User role updated');
      loadUsers();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to change role');
    }
  };

  const handleStatusToggle = async (targetUser: User) => {
    try {
      if (targetUser.isActive) {
        await adminApi.deactivateUser(targetUser.id);
        toast.success('User deactivated');
      } else {
        await adminApi.activateUser(targetUser.id);
        toast.success('User activated');
      }
      loadUsers();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update status');
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Don't render while redirecting or loading auth
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground mt-1">View and manage all users on the platform.</p>
      </div>

      <Card className="p-4 border shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium mr-2">Role:</span>
          {['All Roles', 'Shippers', 'Carriers', 'Admins'].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setRoleFilter(role);
                setPage(1);
              }}
            >
              {role}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium mr-2">Status:</span>
          {['All', 'Active', 'Inactive'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {status}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="border shadow-sm overflow-x-auto text-sm">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 font-medium">Name</th>
              <th className="h-12 px-4 font-medium">Email</th>
              <th className="h-12 px-4 font-medium">Role</th>
              <th className="h-12 px-4 font-medium">Status</th>
              <th className="h-12 px-4 font-medium">Joined Date</th>
              <th className="h-12 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y relative">
            {loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => {
              const isSelf = u.id === user.id;
              
              return (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">
                    {u.firstName} {u.lastName} {isSelf && <span className="text-muted-foreground ml-1 font-normal">(you)</span>}
                  </td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    {isSelf ? (
                      <span className="capitalize">{u.role}</span>
                    ) : (
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={loading && users.length > 0} // disable while loading new data
                      >
                        <option value="admin">Admin</option>
                        <option value="shipper">Shipper</option>
                        <option value="carrier">Carrier</option>
                      </select>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                        u.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {!isSelf && (
                      <Button
                        variant={u.isActive ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => handleStatusToggle(u)}
                        disabled={loading && users.length > 0}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
