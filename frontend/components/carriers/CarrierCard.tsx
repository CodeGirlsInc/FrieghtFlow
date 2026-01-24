'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Carrier,
  vehicleTypeLabels,
  cargoSpecializationLabels,
} from './types';

interface CarrierCardProps {
  carrier: Carrier;
  viewMode: 'grid' | 'list';
  onContact: (carrier: Carrier) => void;
  onToggleFavorite: (carrierId: string) => void;
  onCompare: (carrierId: string) => void;
  isSelected?: boolean;
}

// Star rating component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            'w-4 h-4',
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export function CarrierCard({
  carrier,
  viewMode,
  onContact,
  onToggleFavorite,
  onCompare,
  isSelected = false,
}: CarrierCardProps) {
  const isGrid = viewMode === 'grid';

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border transition-all hover:shadow-lg',
        isGrid ? 'p-4' : 'p-4 flex gap-6 items-start',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 dark:border-gray-700'
      )}
    >
      {/* Header with logo and favorite */}
      <div className={cn('flex items-start gap-4', isGrid ? 'mb-4' : 'flex-shrink-0')}>
        {/* Logo placeholder */}
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
          {carrier.logo ? (
            <img
              src={carrier.logo}
              alt={carrier.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            carrier.name.charAt(0).toUpperCase()
          )}
        </div>
        {isGrid && (
          <button
            onClick={() => onToggleFavorite(carrier.id)}
            className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label={carrier.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={cn(
                'w-5 h-5',
                carrier.isFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-400'
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      {/* Main content */}
      <div className={cn('flex-1', isGrid ? '' : 'min-w-0')}>
        {/* Name and badges */}
        <div className="flex items-start gap-2 flex-wrap mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {carrier.name}
          </h3>
          {carrier.isVerified && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
          {carrier.isAvailableNow && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
              Available
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={carrier.rating} />
          <span className="text-sm text-gray-500">
            {carrier.reviewCount} reviews
          </span>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <svg
            className="w-4 h-4 inline-block mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {carrier.location}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>{carrier.completedDeliveries} deliveries</span>
          <span>{carrier.onTimeRate}% on-time</span>
          <span>{carrier.yearsInBusiness} years in business</span>
        </div>

        {/* Vehicle types */}
        <div className="flex flex-wrap gap-1 mb-3">
          {carrier.vehicleTypes.slice(0, 3).map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {vehicleTypeLabels[type]}
            </span>
          ))}
          {carrier.vehicleTypes.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
              +{carrier.vehicleTypes.length - 3} more
            </span>
          )}
        </div>

        {/* Cargo specializations */}
        <div className="flex flex-wrap gap-1 mb-4">
          {carrier.cargoSpecializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
            >
              {cargoSpecializationLabels[spec]}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${carrier.pricePerMile.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/mile</span>
          {carrier.hasInsurance && (
            <span className="ml-2 text-xs text-green-600">
              <svg className="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Insured
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex gap-2',
        isGrid ? 'mt-4' : 'flex-shrink-0 flex-col'
      )}>
        {!isGrid && (
          <button
            onClick={() => onToggleFavorite(carrier.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label={carrier.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={cn(
                'w-5 h-5',
                carrier.isFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-400'
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onCompare(carrier.id)}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            isSelected
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          {isSelected ? 'Selected' : 'Compare'}
        </button>
        <button
          onClick={() => onContact(carrier)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Contact
        </button>
      </div>
    </div>
  );
}

export default CarrierCard;
