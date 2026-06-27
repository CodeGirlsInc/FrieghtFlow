'use client';

import { useState } from 'react';
import { Wallet, LogOut, ExternalLink, Loader2 } from 'lucide-react';

interface WalletState { address: string; balance: string | null }

function truncate(addr: string) { return `${addr.slice(0, 6)}...${addr.slice(-6)}`; }

async function fetchBalance(publicKey: string): Promise<string> {
  const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
  if (!res.ok) return '0';
  const data = await res.json();
  const native = (data.balances as { asset_type: string; balance: string }[]).find((b) => b.asset_type === 'native');
  return native ? parseFloat(native.balance).toFixed(2) : '0';
}

export function WalletConnect() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasFreighter = typeof window !== 'undefined' && Boolean((window as any).freighter);

  async function connect() {
    setLoading(true); setError(null);
    try {
      const { getAddress } = await import('@stellar/freighter-api');
      const { address } = await getAddress();
      const balance = await fetchBalance(address).catch(() => null);
      setWallet({ address, balance });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  }

  if (!hasFreighter) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center">
        <Wallet className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
        <p className="mb-1 font-semibold text-yellow-900">Freighter not detected</p>
        <p className="mb-4 text-sm text-yellow-700">Install the Freighter browser extension to connect your Stellar wallet.</p>
        <a href="https://freighter.app" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600">
          Install Freighter <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  if (wallet) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200">
            <Wallet className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="text-xs font-medium text-green-700">Connected</p>
            <p className="font-mono text-sm font-semibold text-green-900">{truncate(wallet.address)}</p>
          </div>
        </div>
        {wallet.balance !== null && (
          <p className="mb-4 text-sm text-green-800">Balance: <span className="font-bold">{wallet.balance} XLM</span></p>
        )}
        <button onClick={() => setWallet(null)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100">
          <LogOut className="h-3.5 w-3.5" /> Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
      <Wallet className="mx-auto mb-3 h-8 w-8 text-gray-400" />
      <p className="mb-1 font-semibold text-gray-900">Connect Stellar Wallet</p>
      <p className="mb-4 text-sm text-gray-500">Link your Freighter wallet to view your XLM balance.</p>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
      <button onClick={connect} disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {loading ? 'Connecting…' : 'Connect Wallet'}
      </button>
    </div>
  );
}
