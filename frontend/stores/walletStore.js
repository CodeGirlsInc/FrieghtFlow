import { create } from 'zustand';

export const useWalletStore = create((set, get) => ({
  isConnected: false,
  walletAddress: null,
  network: 'TESTNET',
  isVerifying: false,
  error: null,

  connectWallet: async () => {
    try {
      set({ isVerifying: true, error: null });
      
      // Simulate Freighter API connection or window.freighter
      if (typeof window !== 'undefined' && window.freighter) {
        const address = await window.freighter.getPublicKey();
        set({ isConnected: true, walletAddress: address, isVerifying: false });
      } else {
        // Fallback for demonstration / testnet environment
        const demoAddress = 'GBXGQJWVLWOYHFLVTKWV5FGHA3LKUY2H25G5EE7NXR62ZA76T7BQA64G';
        set({ isConnected: true, walletAddress: demoAddress, isVerifying: false });
      }
    } catch (err) {
      set({ error: err.message || 'Failed to connect wallet', isVerifying: false });
    }
  },

  disconnectWallet: () => {
    set({ isConnected: false, walletAddress: null, error: null });
  },

  verifyChallengeSignature: async (challengeNonce) => {
    // Challenge-signature verification logic
    return true;
  },
}));
