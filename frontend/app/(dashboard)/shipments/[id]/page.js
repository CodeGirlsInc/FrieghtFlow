'use client';

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';

export default function ShipmentDetailPage({ params }) {
  const shipmentId = params?.id || 'ship-sample-123';
  const { isConnected, walletAddress, connectWallet } = useWalletStore();

  const [paymentState, setPaymentState] = useState({
    status: 'INITIATED', // INITIATED, SUBMITTED, CONFIRMING, CONFIRMED, FAILED
    amount: 1200.0,
    feeAmount: 60.0,
    insurancePremium: 24.0,
    txHash: null,
    error: null,
    isSigning: false,
  });

  // Handle funding escrow
  const handleFundEscrow = async () => {
    if (!isConnected) {
      alert('Please connect your Stellar wallet first.');
      return;
    }

    try {
      setPaymentState((prev) => ({ ...prev, isSigning: true, error: null }));

      // Step 1: Request unsigned XDR from backend (simulated)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Prompt wallet signature via Freighter (simulated)
      const mockTxHash = `tx_hash_fund_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setPaymentState((prev) => ({
        ...prev,
        status: 'SUBMITTED',
        txHash: mockTxHash,
        isSigning: false,
      }));

      // Step 3: Watch status transition Confirming -> Confirmed via live status poller/WebSocket
      setTimeout(() => {
        setPaymentState((prev) => ({ ...prev, status: 'CONFIRMING' }));
      }, 1500);

      setTimeout(() => {
        setPaymentState((prev) => ({ ...prev, status: 'CONFIRMED' }));
      }, 3500);
    } catch (err) {
      setPaymentState((prev) => ({
        ...prev,
        status: 'FAILED',
        error: err.message || 'Signature rejected or insufficient balance/allowance',
        isSigning: false,
      }));
    }
  };

  const totalLockAmount = paymentState.amount + paymentState.feeAmount + paymentState.insurancePremium;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Shipment Header */}
      <div className="bg-white border rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
            Accepted Bid
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Shipment #{shipmentId}</h1>
          <p className="text-sm text-gray-600">Route: Los Angeles, CA → Chicago, IL (Freight: 42,000 lbs)</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">${totalLockAmount.toFixed(2)} USDC</div>
          <p className="text-xs text-gray-500">Includes $60 fee & $24 insurance</p>
        </div>
      </div>

      {/* Escrow Funding Section (Shipper View) */}
      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Escrow Funding & Live Status</h2>

        {/* Live Status Badge */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment Status</span>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  paymentState.status === 'CONFIRMED'
                    ? 'bg-green-500'
                    : paymentState.status === 'FAILED'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`}
              />
              <span className="font-bold text-gray-800">{paymentState.status}</span>
            </div>
          </div>

          {paymentState.txHash && (
            <div className="text-right">
              <span className="text-xs text-gray-500">Transaction Hash</span>
              <p className="text-xs font-mono text-blue-600 truncate max-w-[200px]">{paymentState.txHash}</p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {paymentState.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {paymentState.error}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
            >
              Connect Wallet to Fund Escrow
            </button>
          ) : paymentState.status === 'INITIATED' ? (
            <button
              onClick={handleFundEscrow}
              disabled={paymentState.isSigning}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm transition-colors flex items-center space-x-2"
            >
              {paymentState.isSigning ? 'Requesting Signature...' : 'Fund Escrow ($1,284.00 USDC)'}
            </button>
          ) : (
            <div className="text-sm text-green-700 font-medium bg-green-50 px-4 py-2 rounded-md border border-green-200">
              ✓ Escrow funded and locked in Soroban smart contract
            </div>
          )}
        </div>
      </div>

      {/* Carrier Payout Status View */}
      <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Carrier Payout View</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-md">
            <span className="text-xs text-gray-500">Carrier Payout Share</span>
            <p className="font-semibold text-gray-900 text-base mt-1">$1,200.00 USDC</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <span className="text-xs text-gray-500">Payout Release Trigger</span>
            <p className="font-semibold text-gray-900 text-base mt-1">Automatic upon Delivery Proof</p>
          </div>
        </div>
      </div>
    </div>
  );
}
