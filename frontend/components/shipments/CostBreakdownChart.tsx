// frontend/components/shipments/CostBreakdownChart.tsx
import React from 'react';

export interface CostItem {
  category: string;
  amount: number;
  currency: string;
}

export interface CostBreakdownProps {
  items: CostItem[];
  totalAmount: number;
  currency: string;
}

export const CostBreakdownChart: React.FC<CostBreakdownProps> = ({ items, totalAmount, currency }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{item.category}</span>
            <span className="font-medium text-gray-900">
              {item.amount.toFixed(2)} {item.currency}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center font-bold text-gray-900">
        <span>Total</span>
        <span>{totalAmount.toFixed(2)} {currency}</span>
      </div>
    </div>
  );
};