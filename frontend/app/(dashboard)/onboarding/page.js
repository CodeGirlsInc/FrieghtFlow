'use client';

import React from 'react';
import { useWalletStore } from '@/stores/walletStore';

export default function OnboardingPage() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWalletStore();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Wallet Onboarding & Escrow Setup</h1>
        <p className="text-gray-600 mt-2">
          Connect your non-custodial Stellar wallet to fund shipments, manage escrow payments, and receive payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 bg-white shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
          <h3 className="font-semibold text-lg text-gray-900">Connect Wallet</h3>
          <p className="text-sm text-gray-600">
            Use Freighter or any SEP-41 supported Stellar wallet to securely sign transactions without sharing private keys.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
          <h3 className="font-semibold text-lg text-gray-900">Get Testnet Tokens</h3>
          <p className="text-sm text-gray-600">
            Acquire testnet XLM and USDC tokens via Stellar Friendbot for zero-risk testing of escrow funding.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
          <h3 className="font-semibold text-lg text-gray-900">Fund Escrow</h3>
          <p className="text-sm text-gray-600">
            Fund shipments up front. Funds remain locked in smart contract escrow until delivery is confirmed by the carrier.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-gray-900">Wallet Status</h4>
          <p className="text-sm text-gray-600 font-mono mt-1">
            {isConnected ? `Connected: ${walletAddress}` : 'No wallet connected'}
          </p>
        </div>

        {isConnected ? (
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm transition-colors"
          >
            Disconnect Wallet
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
          >
            Connect Freighter Wallet
          </button>
        )}
      </div>
    </div>
  );
}
