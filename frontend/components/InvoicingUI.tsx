'use client';

import { useState } from 'react';

export default function InvoicingUI() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateInvoice = () => {
    if (amount && description) {
      setInvoices([...invoices, { id: Date.now(), amount, description, status: 'pending' }]);
      setAmount('');
      setDescription('');
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Invoicing & Payments</h1>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">Total Amount</p>
        <p className="text-3xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 w-full mb-2 rounded" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 w-full mb-2 rounded" rows={3} />
        <button onClick={handleCreateInvoice} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Invoice</button>
      </div>

      <div className="space-y-2">
        {invoices.map((inv) => (
          <div key={inv.id} className="border rounded p-3 bg-gray-50 flex justify-between">
            <div>
              <p className="font-semibold">${inv.amount}</p>
              <p className="text-sm text-gray-600">{inv.description}</p>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{inv.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
