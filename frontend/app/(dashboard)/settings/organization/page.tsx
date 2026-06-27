'use client';
// #997 – Organization settings: team management & member invite flow
import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/api/client';

interface Member { userId: string; role: string; email?: string; }
interface Org { id: string; name: string; members: Member[]; }

export default function OrganizationSettingsPage() {
  const [org, setOrg] = useState<Org | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Org>('/organizations/mine').then(setOrg).catch(console.error).finally(() => setLoading(false));
  }, []);

  const invite = async () => {
    if (!org || !inviteEmail) return;
    await apiClient(`/organizations/${org.id}/invite`, { method: 'POST', body: JSON.stringify({ email: inviteEmail, role: 'member' }) });
    setInviteEmail('');
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (!org) return <div className="p-6 text-sm text-gray-400">No organization found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">{org.name}</h1>
      <ul className="divide-y rounded border">
        {org.members.map(m => (
          <li key={m.userId} className="flex justify-between p-3 text-sm"><span>{m.email ?? m.userId}</span><span className="text-gray-400">{m.role}</span></li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email to invite" className="flex-1 rounded border px-3 py-2 text-sm"/>
        <button onClick={invite} className="rounded bg-blue-600 px-4 py-2 text-sm text-white">Invite</button>
      </div>
    </div>
  );
}
