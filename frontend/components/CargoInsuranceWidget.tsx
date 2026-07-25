'use client';

import { useState } from 'react';

interface InsurancePlan {
  id: string;
  name: string;
  coverage: string;
  price: number;
}

export default function CargoInsuranceWidget() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: InsurancePlan[] = [
    { id: 'basic', name: 'Basic Coverage', coverage: 'Up to $10,000', price: 25 },
    { id: 'standard', name: 'Standard Coverage', coverage: 'Up to $50,000', price: 75 },
    { id: 'premium', name: 'Premium Coverage', coverage: 'Unlimited', price: 150 },
  ];

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-bold mb-4">Cargo Insurance</h3>

      <div className="space-y-3">
        {plans.map((plan) => (
          <label key={plan.id} className="flex items-center p-3 border rounded cursor-pointer hover:bg-blue-50">
            <input
              type="radio"
              name="insurance"
              value={plan.id}
              checked={selectedPlan === plan.id}
              onChange={() => setSelectedPlan(plan.id)}
              className="mr-3"
            />
            <div className="flex-1">
              <p className="font-semibold">{plan.name}</p>
              <p className="text-sm text-gray-600">{plan.coverage}</p>
            </div>
            <p className="font-bold text-green-600">${plan.price}</p>
          </label>
        ))}
      </div>

      {selectedPlan && (
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add to Quote
        </button>
      )}
    </div>
  );
}
