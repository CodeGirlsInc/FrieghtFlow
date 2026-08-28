'use client';

import { create } from 'zustand';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface SocketStatusState {
  status: SocketStatus;
  setStatus: (status: SocketStatus) => void;
}

/**
 * Tracks the real-time shipment-update socket's connection state so it can
 * be surfaced to the user (FE-109) — e.g. a subtle indicator in the
 * notification bell — instead of a dropped connection being entirely
 * invisible.
 */
export const useSocketStatusStore = create<SocketStatusState>((set) => ({
  status: 'disconnected',
  setStatus: (status) => set({ status }),
}));
