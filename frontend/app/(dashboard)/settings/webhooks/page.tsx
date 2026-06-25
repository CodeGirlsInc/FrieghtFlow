'use client';

import { useEffect, useState } from 'react';
import { webhookApi, Webhook, WEBHOOK_EVENTS } from '../../../../lib/api/webhook.api';

function StatusBadge({ status }: { status: Webhook['lastDeliveryStatus'] }) {
  if (status === 'success') return <span className="text-xs text-green-600 font-medium">Success</span>;
  if (status === 'failed') return <span className="text-xs text-red-600 font-medium">Failed</span>;
  return <span className="text-xs text-muted-foreground">Never triggered</span>;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [urlError, setUrlError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { delivered: boolean; statusCode: number; responseTimeMs: number }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    webhookApi.list().then(setWebhooks).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function validateUrl(v: string) {
    try {
      const u = new URL(v);
      return u.protocol === 'https:' ? '' : 'URL must use HTTPS';
    } catch {
      return 'Enter a valid URL';
    }
  }

  async function handleRegister() {
    const err = validateUrl(url);
    if (err) { setUrlError(err); return; }
    if (!selectedEvents.length) { setUrlError('Select at least one event'); return; }
    setSaving(true);
    try {
      await webhookApi.register({ url, events: selectedEvents });
      setShowModal(false);
      setUrl('');
      setSelectedEvents([]);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handlePing(id: string) {
    const result = await webhookApi.testPing(id);
    setPingResults((prev) => ({ ...prev, [id]: result }));
  }

  async function handleCopySecret(id: string) {
    const { secret } = await webhookApi.getSecret(id);
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(id: string) {
    await webhookApi.delete(id);
    setDeleteId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground">Receive HTTP callbacks when shipment events occur.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm">
          + Add Webhook
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div>
      ) : webhooks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No webhooks registered yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                {['URL', 'Created', 'Last Delivery', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {webhooks.map((wh) => (
                <>
                  <tr key={wh.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 max-w-xs">
                      <span title={wh.url} className="truncate block">{wh.url}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(wh.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={wh.lastDeliveryStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => handlePing(wh.id)} className="text-xs text-primary hover:underline">Test Ping</button>
                        <button onClick={() => handleCopySecret(wh.id)} className="text-xs text-primary hover:underline">
                          {copiedId === wh.id ? 'Copied!' : 'Copy Secret'}
                        </button>
                        <button onClick={() => setDeleteId(wh.id)} className="text-xs text-destructive hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                  {pingResults[wh.id] && (
                    <tr key={wh.id + '-ping'} className="bg-muted/20">
                      <td colSpan={4} className="px-4 py-2 text-xs">
                        {pingResults[wh.id].delivered
                          ? <span className="text-green-600">✓ Delivered — HTTP {pingResults[wh.id].statusCode} in {pingResults[wh.id].responseTimeMs}ms</span>
                          : <span className="text-red-600">✗ Failed — HTTP {pingResults[wh.id].statusCode} in {pingResults[wh.id].responseTimeMs}ms</span>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-96 space-y-4 shadow-xl">
            <h2 className="font-semibold text-lg">Register Webhook</h2>
            <div>
              <label className="text-sm font-medium">HTTPS URL</label>
              <input
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                placeholder="https://example.com/webhook"
                className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm"
              />
              {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Events</p>
              <div className="grid grid-cols-2 gap-1">
                {WEBHOOK_EVENTS.map((ev) => (
                  <label key={ev} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev)}
                      onChange={(e) =>
                        setSelectedEvents((prev) =>
                          e.target.checked ? [...prev, ev] : prev.filter((x) => x !== ev)
                        )
                      }
                    />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded border">Cancel</button>
              <button onClick={handleRegister} disabled={saving} className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground disabled:opacity-50">
                {saving ? 'Saving…' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-80 space-y-4 shadow-xl">
            <p className="font-semibold">Delete webhook?</p>
            <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded border">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm rounded bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
