'use client';

import React from 'react';
import { Carrier } from './types';

interface CarrierComparisonModalProps {
  carriers: Carrier[];
  onClose: () => void;
  onRemoveCarrier: (carrierId: string) => void;
}

export function CarrierComparisonModal({
  carriers,
  onClose,
  onRemoveCarrier,
}: CarrierComparisonModalProps) {
  if (carriers.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Compare Carriers ({carriers.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Attribute
                </th>
                {carriers.map((carrier) => (
                  <th key={carrier.id} className="px-4 py-3 text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl font-bold text-gray-400">
                        {carrier.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {carrier.name}
                      </span>
                      <button
                        onClick={() => onRemoveCarrier(carrier.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Rating */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {carrier.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({carrier.reviewCount})
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price per Mile
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      ${carrier.pricePerMile.toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* On-time rate */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  On-time Rate
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {carrier.onTimeRate}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Completed Deliveries */}
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Completed Deliveries
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {carrier.completedDeliveries.toLocaleString()}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Years in Business */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Years in Business
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {carrier.yearsInBusiness}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Verified */}
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Verified
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    {carrier.isVerified ? (
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                ))}
              </tr>

              {/* Insurance */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Insurance
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center">
                    {carrier.hasInsurance ? (
                      <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {carrier.location}
                  </td>
                ))}
              </tr>

              {/* Vehicle Types */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vehicle Types
                </td>
                {carriers.map((carrier) => (
                  <td key={carrier.id} className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                    {carrier.vehicleTypes.length} types
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CarrierComparisonModal;
