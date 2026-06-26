import { WalletConnect } from '../../components/WalletConnect';

export default function WalletDemoPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Stellar Wallet</h1>
        <p className="mb-8 text-sm text-gray-500">Connect your Freighter wallet to view your XLM balance on the Stellar testnet.</p>
        <WalletConnect />
      </div>
    </main>
  );
}
