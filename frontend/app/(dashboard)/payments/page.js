"use client";

import { useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Wallet,
  X,
  Clock,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Globe,
  Shield,
} from "lucide-react";

// Mock data for the payments page
const mockPaymentData = {
  balance: {
    available: 12500.0,
    pending: 3200.0,
    currency: "USD",
  },
  recentTransactions: [
    {
      id: "tx-1234",
      date: "2025-03-22T10:30:00",
      description: "Payment for Shipment #SH-9876",
      amount: -4250.0,
      status: "completed",
      type: "payment",
      method: "StarkNet Wallet",
      txHash: "0x7a9d852b43c0e500089110e9b7d7151a5eeaafb5c753a4b9d6b6c7c2d1eb3",
      currency: "USD",
    },
    {
      id: "tx-1235",
      date: "2025-03-20T14:15:00",
      description: "Refund for Cancelled Shipment #SH-9870",
      amount: 1200.0,
      status: "completed",
      type: "refund",
      method: "Credit Card",
      currency: "USD",
    },
    {
      id: "tx-1236",
      date: "2025-03-18T09:45:00",
      description: "Payment for Shipment #SH-9865",
      amount: -3800.0,
      status: "completed",
      type: "payment",
      method: "Bank Transfer",
      currency: "USD",
    },
    {
      id: "tx-1237",
      date: "2025-03-15T16:20:00",
      description: "Deposit to FreightFlow Account",
      amount: 10000.0,
      status: "completed",
      type: "deposit",
      method: "Bank Transfer",
      currency: "USD",
    },
    {
      id: "tx-1238",
      date: "2025-03-10T11:05:00",
      description: "Payment for Shipment #SH-9850",
      amount: -5200.0,
      status: "completed",
      type: "payment",
      method: "StarkNet Wallet",
      txHash:
        "0x9c2d753a4b9d6b6c7c2d1eb37a9d852b43c0e500089110e9b7d7151a5eeaafb5",
      currency: "USD",
    },
  ],
  pendingInvoices: [
    {
      id: "INV-2025-001",
      date: "2025-03-25T00:00:00",
      dueDate: "2025-04-10T00:00:00",
      description: "Shipment #SH-9880 - Express Freight",
      amount: 3200.0,
      status: "pending",
      currency: "USD",
    },
    {
      id: "INV-2025-002",
      date: "2025-03-23T00:00:00",
      dueDate: "2025-04-08T00:00:00",
      description: "Shipment #SH-9878 - Temperature-Controlled",
      amount: 4800.0,
      status: "pending",
      currency: "USD",
    },
  ],
  paymentMethods: [
    {
      id: "pm-1",
      type: "credit_card",
      name: "Corporate Visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
    {
      id: "pm-2",
      type: "bank_account",
      name: "Business Checking",
      last4: "7890",
      bankName: "Chase Bank",
      isDefault: false,
    },
    {
      id: "pm-3",
      type: "starknet_wallet",
      address:
        "0x7a9d852b43c0e500089110e9b7d7151a5eeaafb5c753a4b9d6b6c7c2d1eb3",
      name: "StarkNet Wallet",
      isDefault: false,
    },
  ],
  monthlySpending: [
    { month: "Jan", amount: 12500 },
    { month: "Feb", amount: 15800 },
    { month: "Mar", amount: 13200 },
    { month: "Apr", amount: 9800 },
    { month: "May", amount: 11500 },
    { month: "Jun", amount: 14200 },
  ],
};

const PaymentsPage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

  // State for payment methods modal
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState("credit_card");

  // State for invoice payment modal
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // State for transaction filters
  const [transactionFilters, setTransactionFilters] = useState({
    dateRange: "all",
    type: "all",
    method: "all",
    search: "",
  });

  // State for wallet connection
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // State for transaction details modal
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filtered transactions based on filters
  const filteredTransactions = mockPaymentData.recentTransactions.filter(
    (transaction) => {
      // Filter by search term
      if (
        transactionFilters.search &&
        !transaction.description
          .toLowerCase()
          .includes(transactionFilters.search.toLowerCase())
      ) {
        return false;
      }

      // Filter by type
      if (
        transactionFilters.type !== "all" &&
        transaction.type !== transactionFilters.type
      ) {
        return false;
      }

      // Filter by payment method
      if (
        transactionFilters.method !== "all" &&
        transaction.method !== transactionFilters.method
      ) {
        return false;
      }

      return true;
    }
  );

  // Format currency
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Handle paying an invoice
  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPayInvoiceModal(true);
  };

  // Handle viewing transaction details
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  // Handle connecting wallet
  const handleConnectWallet = () => {
    // In a real app, this would connect to StarkNet
    setIsWalletConnected(true);
    setWalletBalance(0.0025); // Mock ETH balance
  };

  // Handle adding a new payment method
  const handleAddPaymentMethod = () => {
    // In a real app, this would add the payment method to the database
    setShowAddPaymentModal(false);
  };

  // Handle completing invoice payment
  const handleCompletePayment = () => {
    // In a real app, this would process the payment
    setShowPayInvoiceModal(false);
  };

  // Render the overview tab
  const renderOverviewTab = () => {
    return (
      <div className="space-y-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#d9d9d9] shadow-sm">
            <h3 className="text-[#313957] text-sm font-medium mb-2">
              Available Balance
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#0c1421]">
                {formatCurrency(mockPaymentData.balance.available)}
              </span>
            </div>
            <div className="mt-4">
              <button className="bg-[#b57704] text-white px-4 py-2 rounded-md text-sm hover:bg-[#9c6503] transition-colors">
                Add Funds
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#d9d9d9] shadow-sm">
            <h3 className="text-[#313957] text-sm font-medium mb-2">
              Pending Balance
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#0c1421]">
                {formatCurrency(mockPaymentData.balance.pending)}
              </span>
            </div>
            <div className="mt-4 text-[#313957] text-sm">
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>Funds being processed</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#d9d9d9] shadow-sm">
            <h3 className="text-[#313957] text-sm font-medium mb-2">
              StarkNet Wallet
            </h3>
            {isWalletConnected ? (
              <>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-[#0c1421]">
                    {walletBalance} ETH
                  </span>
                </div>
                <div className="mt-4 text-[#313957] text-sm">
                  <div className="flex items-center">
                    <CheckCircle2 size={16} className="mr-2 text-green-500" />
                    <span>Wallet connected</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-[#313957] mb-4">
                  Connect your StarkNet wallet to pay for shipments with
                  cryptocurrency
                </div>
                <button
                  onClick={handleConnectWallet}
                  className="flex items-center bg-[#f4f6f3] text-[#0c1421] px-4 py-2 rounded-md text-sm hover:bg-[#e0e4dc] transition-colors"
                >
                  <Wallet size={16} className="mr-2" />
                  Connect Wallet
                </button>
              </>
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d9d9d9]">
            <h2 className="text-xl font-bold text-[#0c1421]">
              Pending Invoices
            </h2>
          </div>

          {mockPaymentData.pendingInvoices.length > 0 ? (
            <div className="divide-y divide-[#d9d9d9]">
              {mockPaymentData.pendingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <FileText size={18} className="text-[#b57704] mr-2" />
                      <span className="font-medium text-[#0c1421]">
                        {invoice.id}
                      </span>
                    </div>
                    <div className="text-[#313957] mt-1">
                      {invoice.description}
                    </div>
                    <div className="text-sm text-[#313957] mt-1">
                      Due: {formatDate(invoice.dueDate)}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-xl font-bold text-[#0c1421]">
                      {formatCurrency(invoice.amount)}
                    </div>
                    <button
                      onClick={() => handlePayInvoice(invoice)}
                      className="bg-[#b57704] text-white px-4 py-2 rounded-md text-sm hover:bg-[#9c6503] transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[#313957]">
              No pending invoices
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d9d9d9] flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0c1421]">
              Recent Transactions
            </h2>
            <button
              onClick={() => setActiveTab("transactions")}
              className="text-[#b57704] text-sm hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-[#d9d9d9]">
            {mockPaymentData.recentTransactions
              .slice(0, 3)
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      {transaction.type === "payment" && (
                        <ArrowUpRight size={18} className="text-red-500 mr-2" />
                      )}
                      {transaction.type === "refund" && (
                        <ArrowDownUp
                          size={18}
                          className="text-green-500 mr-2"
                        />
                      )}
                      {transaction.type === "deposit" && (
                        <ArrowDownUp
                          size={18}
                          className="text-green-500 mr-2"
                        />
                      )}
                      <span className="font-medium text-[#0c1421]">
                        {transaction.description}
                      </span>
                    </div>
                    <div className="text-sm text-[#313957] mt-1">
                      {formatDate(transaction.date)} • {transaction.method}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`text-lg font-bold ${transaction.amount < 0
                        ? "text-red-500"
                        : "text-green-500"
                        }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </div>
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-[#313957] hover:text-[#0c1421]"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Spending Analytics */}
        <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d9d9d9]">
            <h2 className="text-xl font-bold text-[#0c1421]">
              Spending Analytics
            </h2>
          </div>

          <div className="p-6">
            <div className="h-64 flex items-end justify-between">
              {mockPaymentData.monthlySpending.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-12 bg-[#b57704] rounded-t-md"
                    style={{
                      height: `${(data.amount / 20000) * 200}px`,
                      opacity: 0.6 + index / 10,
                    }}
                  ></div>
                  <div className="mt-2 text-[#313957] text-sm">
                    {data.month}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#f4f6f3] p-4 rounded-md">
                <div className="text-[#313957] text-sm">Total Spent (YTD)</div>
                <div className="text-xl font-bold text-[#0c1421] mt-1">
                  $77,000.00
                </div>
              </div>

              <div className="bg-[#f4f6f3] p-4 rounded-md">
                <div className="text-[#313957] text-sm">Avg. Per Shipment</div>
                <div className="text-xl font-bold text-[#0c1421] mt-1">
                  $4,312.50
                </div>
              </div>

              <div className="bg-[#f4f6f3] p-4 rounded-md">
                <div className="text-[#313957] text-sm">Most Used Method</div>
                <div className="text-xl font-bold text-[#0c1421] mt-1">
                  Bank Transfer
                </div>
              </div>

              <div className="bg-[#f4f6f3] p-4 rounded-md">
                <div className="text-[#313957] text-sm">
                  Blockchain Payments
                </div>
                <div className="text-xl font-bold text-[#0c1421] mt-1">32%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the transactions tab
  const renderTransactionsTab = () => {
    return (
      <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#d9d9d9]">
          <h2 className="text-xl font-bold text-[#0c1421] mb-4">
            Transaction History
          </h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#313957]"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  value={transactionFilters.search}
                  onChange={(e) =>
                    setTransactionFilters({
                      ...transactionFilters,
                      search: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                value={transactionFilters.type}
                onChange={(e) =>
                  setTransactionFilters({
                    ...transactionFilters,
                    type: e.target.value,
                  })
                }
              >
                <option value="all">All Types</option>
                <option value="payment">Payments</option>
                <option value="refund">Refunds</option>
                <option value="deposit">Deposits</option>
              </select>

              <select
                className="px-3 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                value={transactionFilters.method}
                onChange={(e) =>
                  setTransactionFilters({
                    ...transactionFilters,
                    method: e.target.value,
                  })
                }
              >
                <option value="all">All Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="StarkNet Wallet">StarkNet Wallet</option>
              </select>

              <button className="flex items-center px-3 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957]">
                <Calendar size={18} className="mr-2" />
                <span>Date</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f4f6f3] border-b border-[#d9d9d9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9d9d9]">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#f4f6f3]/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0c1421]">
                    <div className="flex items-center">
                      {transaction.type === "payment" && (
                        <ArrowUpRight size={16} className="text-red-500 mr-2" />
                      )}
                      {transaction.type === "refund" && (
                        <ArrowDownUp
                          size={16}
                          className="text-green-500 mr-2"
                        />
                      )}
                      {transaction.type === "deposit" && (
                        <ArrowDownUp
                          size={16}
                          className="text-green-500 mr-2"
                        />
                      )}
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                    {transaction.method}
                    {transaction.method === "StarkNet Wallet" && (
                      <div className="text-xs text-[#b57704]">
                        Blockchain verified
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <span
                      className={
                        transaction.amount < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957] text-right">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-[#b57704] hover:text-[#9c6503]"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-6 text-center text-[#313957]">
            No transactions found matching your filters
          </div>
        )}

        <div className="p-4 border-t border-[#d9d9d9] flex justify-between items-center">
          <div className="text-sm text-[#313957]">
            Showing {filteredTransactions.length} of{" "}
            {mockPaymentData.recentTransactions.length} transactions
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957]">
              Previous
            </button>
            <button className="px-3 py-1 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957]">
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the payment methods tab
  const renderPaymentMethodsTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d9d9d9] flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0c1421]">
              Payment Methods
            </h2>
            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="flex items-center bg-[#b57704] text-white px-4 py-2 rounded-md text-sm hover:bg-[#9c6503] transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Payment Method
            </button>
          </div>

          <div className="divide-y divide-[#d9d9d9]">
            {mockPaymentData.paymentMethods.map((method) => (
              <div
                key={method.id}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center mb-4 md:mb-0">
                  {method.type === "credit_card" && (
                    <CreditCard size={24} className="text-[#b57704] mr-4" />
                  )}
                  {method.type === "bank_account" && (
                    <Globe size={24} className="text-[#b57704] mr-4" />
                  )}
                  {method.type === "starknet_wallet" && (
                    <Wallet size={24} className="text-[#b57704] mr-4" />
                  )}

                  <div>
                    <div className="font-medium text-[#0c1421]">
                      {method.name}
                    </div>
                    {method.type === "credit_card" && (
                      <div className="text-sm text-[#313957]">
                        •••• {method.last4} | Expires {method.expiryMonth}/
                        {method.expiryYear}
                      </div>
                    )}
                    {method.type === "bank_account" && (
                      <div className="text-sm text-[#313957]">
                        {method.bankName} •••• {method.last4}
                      </div>
                    )}
                    {method.type === "starknet_wallet" && (
                      <div className="text-sm text-[#313957]">
                        {method.address.substring(0, 6)}...
                        {method.address.substring(method.address.length - 4)}
                      </div>
                    )}
                  </div>

                  {method.isDefault && (
                    <span className="ml-4 px-2 py-1 text-xs font-medium bg-[#f4f6f3] text-[#313957] rounded">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button className="text-sm text-[#313957] hover:text-[#0c1421]">
                      Set as Default
                    </button>
                  )}
                  <button className="text-sm text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d9d9d9]">
            <h2 className="text-xl font-bold text-[#0c1421]">
              StarkNet Integration
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="bg-[#f4f6f3] p-4 rounded-lg">
                <Wallet size={40} className="text-[#b57704]" />
              </div>

              <div className="flex-1">
                <h />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#0c1421] mb-2">
                  Connect Your StarkNet Wallet
                </h3>
                <p className="text-[#313957] mb-4">
                  Connect your StarkNet wallet to enable blockchain-based
                  payments, enhanced security, and transparent transaction
                  verification.
                </p>

                {isWalletConnected ? (
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 size={20} className="mr-2" />
                      <span>Wallet Connected</span>
                    </div>
                    <div className="text-[#313957]">
                      Balance: {walletBalance} ETH
                    </div>
                    <button className="text-[#b57704] hover:text-[#9c6503]">
                      View on StarkScan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    className="bg-[#b57704] text-white px-4 py-2 rounded-md hover:bg-[#9c6503] transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-[#d9d9d9] pt-6">
              <h3 className="text-lg font-medium text-[#0c1421] mb-4">
                Benefits of StarkNet Payments
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#f4f6f3] p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield size={20} className="text-[#b57704] mr-2" />
                    <span className="font-medium text-[#0c1421]">
                      Enhanced Security
                    </span>
                  </div>
                  <p className="text-sm text-[#313957]">
                    Blockchain-based payments provide cryptographic security and
                    immutable transaction records.
                  </p>
                </div>

                <div className="bg-[#f4f6f3] p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ArrowDownUp size={20} className="text-[#b57704] mr-2" />
                    <span className="font-medium text-[#0c1421]">
                      Lower Fees
                    </span>
                  </div>
                  <p className="text-sm text-[#313957]">
                    Save on transaction fees compared to traditional payment
                    processors, especially for international shipments.
                  </p>
                </div>

                <div className="bg-[#f4f6f3] p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock size={20} className="text-[#b57704] mr-2" />
                    <span className="font-medium text-[#0c1421]">
                      Faster Settlement
                    </span>
                  </div>
                  <p className="text-sm text-[#313957]">
                    Payments settle quickly on StarkNet, reducing delays in
                    shipment processing and improving cash flow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the invoices tab
  const renderInvoicesTab = () => {
    return (
      <div className="bg-white rounded-xl border border-[#d9d9d9] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#d9d9d9] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0c1421]">Invoices</h2>

          <div className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#313957]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
              />
            </div>

            <button className="flex items-center px-3 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957]">
              <Filter size={18} className="mr-2" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f4f6f3] border-b border-[#d9d9d9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#313957] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9d9d9]">
              {/* Pending Invoices */}
              {mockPaymentData.pendingInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#f4f6f3]/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0c1421]">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#313957]">
                    {invoice.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        className="text-[#b57704] hover:text-[#9c6503]"
                      >
                        Pay
                      </button>
                      <button className="text-[#313957] hover:text-[#0c1421]">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Paid Invoices (Mock) */}
              <tr className="hover:bg-[#f4f6f3]/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0c1421]">
                  INV-2025-000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                  Mar 15, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                  Mar 30, 2025
                </td>
                <td className="px-6 py-4 text-sm text-[#313957]">
                  Shipment #SH-9850 - Standard Freight
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  $5,200.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-[#313957] hover:text-[#0c1421]">
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-[#f4f6f3]/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0c1421]">
                  INV-2024-099
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                  Mar 10, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#313957]">
                  Mar 25, 2025
                </td>
                <td className="px-6 py-4 text-sm text-[#313957]">
                  Shipment #SH-9845 - Express Shipping
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  $3,800.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-[#313957] hover:text-[#0c1421]">
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#d9d9d9] flex justify-between items-center">
          <div className="text-sm text-[#313957]">Showing 4 of 24 invoices</div>

          <div className="flex gap-2">
            <button className="px-3 py-1 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957]">
              Previous
            </button>
            <button className="px-3 py-1 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957]">
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

};

export default PaymentsPage;