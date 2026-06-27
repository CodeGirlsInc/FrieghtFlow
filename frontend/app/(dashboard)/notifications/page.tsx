'use client';
// #973 – Notifications inbox: list, mark-as-read & mark-all-read
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api/client';

interface Notification { id: string; type: string; message: string; read: boolean; createdAt: string; }

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Notification[]>('/notifications').then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await apiClient(`/notifications/${id}/read`, { method: 'PATCH' });
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    await apiClient('/notifications/read-all', { method: 'PATCH' });
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAll} className="text-sm text-blue-600 underline">Mark all as read</button>
      </div>
      {items.length === 0 ? <p className="text-gray-400">No notifications.</p> : (
        <ul className="divide-y rounded border">
          {items.map(n => (
            <li key={n.id} className={`flex items-start justify-between p-4 gap-3 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
              <div><p className="text-sm">{n.message}</p><p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p></div>
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 underline shrink-0">Mark read</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
