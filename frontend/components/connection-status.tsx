'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '../../lib/socket';

export function ConnectionStatus() {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const check = () => {
      const s = getSocket();
      setConnected(s?.connected ?? true);
    };

    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  if (connected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-yellow-500/90 text-white text-sm font-medium shadow-lg"
    >
      Reconnecting to server...
    </div>
  );
}
