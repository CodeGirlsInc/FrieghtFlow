"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, Wallet, ArrowUpDown, Filter, Send, CheckCircle, Clock, XCircle } from 'lucide-react';

// Mock data for demonstration
const mockTransactions = [
  {
    id: 'TXN-001',
    date: '2024-01-15T10:30:00Z',
    amount: 2500.00,
    status: 'completed',
    type: 'payment',
    description: 'Freight payment - Route NYC-LA'
  },
  {
    id: 'TXN-002',
    date: '2024-01-14T15:45:00Z',
    amount: 1800.50,
    status: 'pending',
    type: 'payout',
    description: 'Payout request to Bank Account'
  },
  {
    id: 'TXN-003',
    date: '2024-01-13T09:15:00Z',
    amount: 3200.75,
    status: 'completed',
    type: 'payment',
    description: 'Freight payment - Route CHI-MIA'
  },
  {
    id: 'TXN-004',
    date: '2024-01-12T14:20:00Z',
    amount: 950.00,
    status: 'failed',
    type: 'payout',
    description: 'Failed payout - Insufficient funds'
  },
  {
    id: 'TXN-005',
    date: '2024-01-11T11:30:00Z',
    amount: 4100.25,
    status: 'completed',
    type: 'payment',
    description: 'Freight payment - Route SEA-DEN'
  }
];

const mockAccounts = [
  { id: 'acc-1', name: 'Primary Bank Account', type: 'bank', number: '****1234' },
  { id: 'acc-2', name: 'Business Savings', type: 'bank', number: '****5678' },
  { id: 'acc-3', name: 'PayPal Account', type: 'paypal', number: 'user@example.com' }
];

export default function Dashboard() {
  const [walletBalance, setWalletBalance] = useState(15750.50);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [amountError, setAmountError] = useState('');

  const itemsPerPage = 3;

  // Refresh wallet balance
  const refreshBalance = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setWalletBalance(prev => prev + Math.random() * 100 - 50);
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(txn => filterStatus === 'all' || txn.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Validate payout amount
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    if (numAmount > walletBalance) {
      return 'Amount exceeds wallet balance';
    }
    return '';
  };

  // Handle payout submission
  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    const error = validateAmount(payoutAmount);
    if (error) {
      setAmountError(error);
      return;
    }
    if (!selectedAccount) {
      alert('Please select a destination account');
      return;
    }

    setPayoutStatus('processing');
    // Simulate payout processing
    setTimeout(() => {
      setPayoutStatus('success');
      setWalletBalance(prev => prev - parseFloat(payoutAmount));
      setPayoutAmount('');
      setSelectedAccount('');
      setAmountError('');
      
      // Add new transaction
      const newTransaction = {
        id: `TXN-${Date.now()}`,
        date: new Date().toISOString(),
        amount: parseFloat(payoutAmount),
        status: 'pending',
        type: 'payout',
        description: `Payout to ${mockAccounts.find(acc => acc.id === selectedAccount)?.name}`
      };
      setTransactions(prev => [newTransaction, ...prev]);
      
      setTimeout(() => setPayoutStatus(null), 3000);
    }, 2000);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      completed: { variant: 'default', icon: CheckCircle, text: 'Completed' },
      pending: { variant: 'secondary', icon: Clock, text: 'Pending' },
      failed: { variant: 'destructive', icon: XCircle, text: 'Failed' }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your FreightFlow wallet and transactions</p>
        </div>

        {/* Wallet Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="w-6 h-6" />
              FreightFlow Wallet
            </CardTitle>
            <CardDescription className="text-blue-100">
              Your current balance and wallet overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">Current Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(walletBalance)}</p>
              </div>
              <Button
                onClick={refreshBalance}
                disabled={isRefreshing}
                variant="secondary"
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction History Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Transaction History
              </CardTitle>
              <CardDescription>
                View and manage your payment transactions
              </CardDescription>
              
              {/* Filters and Sorting */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-w-[120px]"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {paginatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {transaction.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
                        <StatusBadge status={transaction.status} />
                      </div>
                    </div>
                  </div>
                ))}
                
                {paginatedTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout Request Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Request Payout
              </CardTitle>
              <CardDescription>
                Transfer funds from your wallet to your bank account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {payoutStatus === 'processing' && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4 animate-pulse" />
                    Processing your payout request...
                  </div>
                </div>
              )}
              
              {payoutStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    Payout request submitted successfully!
                  </div>
                </div>
              )}
              
              <form onSubmit={handlePayoutSubmit} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => {
                      setPayoutAmount(e.target.value);
                      if (amountError) setAmountError('');
                    }}
                    className={amountError ? 'border-red-500' : ''}
                    disabled={payoutStatus === 'processing'}
                  />
                  {amountError && (
                    <p className="text-red-500 text-sm mt-1">{amountError}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {formatCurrency(walletBalance)}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Account
                  </label>
                  <Select
                    id="account"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    disabled={payoutStatus === 'processing'}
                  >
                    <option value="">Select an account</option>
                    {mockAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.number})
                      </option>
                    ))}
                  </Select>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!payoutAmount || !selectedAccount || payoutStatus === 'processing'}
                >
                  {payoutStatus === 'processing' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Request Payout
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}