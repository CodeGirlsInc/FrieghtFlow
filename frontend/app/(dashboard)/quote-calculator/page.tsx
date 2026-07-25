'use client';

import { useState } from 'react';

export default function QuoteCalculatorPage() {
  const [formData, setFormData] = useState({
    weight: '',
    distance: '',
    serviceType: 'standard',
  });

  const [quote, setQuote] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateQuote = () => {
    const weight = parseFloat(formData.weight) || 0;
    const distance = parseFloat(formData.distance) || 0;
    const multiplier = formData.serviceType === 'express' ? 1.5 : 1;
    const baseRate = weight * 0.5 + distance * 0.1;
    setQuote(baseRate * multiplier);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Quote Calculator</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Enter weight" className="border p-2 w-full rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Distance (km)</label>
            <input type="number" name="distance" value={formData.distance} onChange={handleChange} placeholder="Enter distance" className="border p-2 w-full rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Type</label>
            <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="border p-2 w-full rounded">
              <option value="standard">Standard (1-3 days)</option>
              <option value="express">Express (24 hours)</option>
            </select>
          </div>

          <button onClick={calculateQuote} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">
            Calculate Quote
          </button>
        </div>
      </div>

      {quote !== null && (
        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Estimated Shipping Cost</p>
          <p className="text-4xl font-bold text-green-600">${quote.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
