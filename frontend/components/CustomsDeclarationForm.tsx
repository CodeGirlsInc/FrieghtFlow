'use client';

import { useState } from 'react';

export default function CustomsDeclarationForm() {
  const [formData, setFormData] = useState({
    itemDescription: '',
    quantity: '',
    weight: '',
    value: '',
    hsCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Declaration submitted:', formData);
    setFormData({ itemDescription: '', quantity: '', weight: '', value: '', hsCode: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-white max-w-2xl">
      <h3 className="text-lg font-bold mb-4">Customs Declaration</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Item Description</label>
          <textarea name="itemDescription" value={formData.itemDescription} onChange={handleChange} placeholder="Describe the items" className="border p-2 w-full rounded" rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="0" className="border p-2 w-full rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Value (USD)</label>
            <input type="number" name="value" value={formData.value} onChange={handleChange} placeholder="0" className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HS Code</label>
            <input type="text" name="hsCode" value={formData.hsCode} onChange={handleChange} placeholder="Enter HS Code" className="border p-2 w-full rounded" />
          </div>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold">
          Submit Declaration
        </button>
      </div>
    </form>
  );
}
