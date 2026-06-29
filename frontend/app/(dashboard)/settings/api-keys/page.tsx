'use client';

import { useEffect, useState } from 'react';
import { apiKeysApi, ApiKey, GenerateApiKeyResponse } from '../../../../lib/api/api-keys.api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<GenerateApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    apiKeysApi.list().then(setKeys).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    if (!name.trim()) return;
    setGenerating(true);
    try {
      const result = await apiKeysApi.generate({ name: name.trim() });
      setNewKey(result);
      load();
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleRevoke(id: string) {
    await apiKeysApi.revoke(id);
    setRevokeId(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground">Programmatic access to the FreightFlow API.</p>
        </div>
        <button onClick={() => { setShowModal(true); setNewKey(null); setName(''); }} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm">
          + Generate Key
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div>
      ) : keys.length === 0 ? (
        <p className="text-muted-foreground text-sm">No API keys yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                {['Name', 'Key Prefix', 'Created', 'Last Used', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.prefix}…</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    {k.status === 'active'
                      ? <span className="text-xs text-green-600 font-medium">Active</span>
                      : <span className="text-xs text-muted-foreground">Revoked</span>}
                  </td>
                  <td className="px-4 py-3">
                    {k.status === 'active' && (
                      <button onClick={() => setRevokeId(k.id)} className="text-xs text-destructive hover:underline">Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-96 space-y-4 shadow-xl">
            {!newKey ? (
              <>
                <h2 className="font-semibold text-lg">Generate API Key</h2>
                <div>
                  <label className="text-sm font-medium">Key Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Production integration"
                    className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded border">Cancel</button>
                  <button onClick={handleGenerate} disabled={generating || !name.trim()} className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground disabled:opacity-50">
                    {generating ? 'Generating…' : 'Generate'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-lg">API Key Generated</h2>
                <p className="text-sm text-muted-foreground">Copy this key now — it will not be shown again.</p>
                <div className="flex items-center gap-2 rounded border bg-muted p-3">
                  <code className="flex-1 text-xs font-mono break-all">{newKey.key}</code>
                  <button onClick={handleCopy} className="shrink-0 text-xs text-primary">{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground">Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Revoke confirmation */}
      {revokeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-80 space-y-4 shadow-xl">
            <p className="font-semibold">Revoke API key?</p>
            <p className="text-sm text-muted-foreground">Any integrations using this key will stop working immediately.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRevokeId(null)} className="px-4 py-2 text-sm rounded border">Cancel</button>
              <button onClick={() => handleRevoke(revokeId)} className="px-4 py-2 text-sm rounded bg-destructive text-destructive-foreground">Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
