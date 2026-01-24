"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Carrier,
  vehicleTypeLabels,
  cargoSpecializationLabels,
} from "@/types/carrier";

interface CarrierComparisonModalProps {
  carriers: Carrier[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveCarrier: (carrierId: string) => void;
  onContactCarrier: (carrier: Carrier) => void;
}

const CarrierComparisonModal: React.FC<CarrierComparisonModalProps> = ({
  carriers,
  isOpen,
  onClose,
  onRemoveCarrier,
  onContactCarrier,
}) => {
  if (!isOpen) return null;

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              "w-4 h-4",
              star <= Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const ComparisonRow: React.FC<{
    label: string;
    values: React.ReactNode[];
  }> = ({ label, values }) => (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
        {label}
      </td>
      {values.map((value, index) => (
        <td
          key={index}
          className="py-3 px-4 text-center text-gray-900 dark:text-white"
        >
          {value}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Compare Carriers ({carriers.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {carriers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>No carriers selected for comparison.</p>
              <p className="text-sm mt-1">
                Click the compare button on carrier cards to add them.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-4 text-left font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
                    Carrier
                  </th>
                  {carriers.map((carrier) => (
                    <th
                      key={carrier.id}
                      className="py-4 px-4 min-w-[200px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {carrier.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {carrier.name}
                        </span>
                        <button
                          onClick={() => onRemoveCarrier(carrier.id)}
                          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="Rating"
                  values={carriers.map((c) => (
                    <StarRating key={c.id} rating={c.rating} />
                  ))}
                />
                <ComparisonRow
                  label="Price per Mile"
                  values={carriers.map((c) => (
                    <span key={c.id} className="font-semibold text-lg">
                      ${c.pricePerMile.toFixed(2)}
                    </span>
                  ))}
                />
                <ComparisonRow
                  label="Location"
                  values={carriers.map((c) => c.location)}
                />
                <ComparisonRow
                  label="Verified"
                  values={carriers.map((c) =>
                    c.isVerified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Verified
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  )}
                />
                <ComparisonRow
                  label="Insurance"
                  values={carriers.map((c) =>
                    c.hasInsurance ? (
                      <span className="text-green-600 dark:text-green-400">
                        Covered
                      </span>
                    ) : (
                      <span className="text-gray-400">Not covered</span>
                    )
                  )}
                />
                <ComparisonRow
                  label="Availability"
                  values={carriers.map((c) =>
                    c.isAvailable ? (
                      <span className="inline-flex items-center text-green-600 dark:text-green-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                        Available
                      </span>
                    ) : (
                      <span className="text-gray-400">Busy</span>
                    )
                  )}
                />
                <ComparisonRow
                  label="Years in Business"
                  values={carriers.map((c) => `${c.yearsInBusiness} years`)}
                />
                <ComparisonRow
                  label="Completed Shipments"
                  values={carriers.map((c) =>
                    c.completedShipments.toLocaleString()
                  )}
                />
                <ComparisonRow
                  label="Vehicle Types"
                  values={carriers.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap gap-1 justify-center"
                    >
                      {c.vehicleTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        >
                          {vehicleTypeLabels[type]}
                        </span>
                      ))}
                    </div>
                  ))}
                />
                <ComparisonRow
                  label="Specializations"
                  values={carriers.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap gap-1 justify-center"
                    >
                      {c.cargoSpecializations.map((spec) => (
                        <span
                          key={spec}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        >
                          {cargoSpecializationLabels[spec]}
                        </span>
                      ))}
                    </div>
                  ))}
                />
                <tr>
                  <td className="py-4 px-4 bg-gray-50 dark:bg-gray-800/50" />
                  {carriers.map((carrier) => (
                    <td key={carrier.id} className="py-4 px-4 text-center">
                      <button
                        onClick={() => onContactCarrier(carrier)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                      >
                        Contact
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierComparisonModal;
