import React, { useState } from 'react';

interface WalletConnection {
  address: string;
  connected: boolean;
}

export const StellarWalletConnect: React.FC = () => {
  const [wallet, setWallet] = useState<WalletConnection>({
    address: '',
    connected: false,
  });
  const [loading, setLoading] = useState(false);

  const connectFreighter = async () => {
    setLoading(true);
    try {
      setWallet({
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        connected: true,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setWallet({ address: '', connected: false });
  };

  return (
    <div className="wallet-connect-container">
      <h3>Stellar Wallet Connection</h3>
      {wallet.connected ? (
        <div className="wallet-connected">
          <p>Connected: {wallet.address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectFreighter} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
        </button>
      )}
    </div>
  );
};
