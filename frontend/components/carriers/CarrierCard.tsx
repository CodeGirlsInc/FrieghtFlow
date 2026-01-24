"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Carrier,
  vehicleTypeLabels,
  cargoSpecializationLabels,
  ViewMode,
} from "@/types/carrier";

interface CarrierCardProps {
  carrier: Carrier;
  viewMode: ViewMode;
  onContact: (carrier: Carrier) => void;
  onBookmark: (carrierId: string) => void;
  onCompare: (carrierId: string) => void;
  isBookmarked: boolean;
  isComparing: boolean;
}

const StarRating: React.FC<{ rating: number; size?: "sm" | "md" }> = ({
  rating,
  size = "md",
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            size === "sm" ? "w-4 h-4" : "w-5 h-5",
            star <= fullStars
              ? "text-yellow-400 fill-current"
              : star === fullStars + 1 && hasHalfStar
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const CarrierCard: React.FC<CarrierCardProps> = ({
  carrier,
  viewMode,
  onContact,
  onBookmark,
  onCompare,
  isBookmarked,
  isComparing,
}) => {
  const isGrid = viewMode === "grid";

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg",
        isGrid ? "flex flex-col" : "flex flex-row items-start gap-4"
      )}
    >
      {/* Header section with logo and status */}
      <div
        className={cn(
          "relative",
          isGrid ? "p-4 pb-2" : "p-4 min-w-[200px]"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Logo/Avatar */}
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {carrier.name}
              </h3>
              {carrier.isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={carrier.rating} size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({carrier.reviewCount})
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="inline-flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {carrier.location}
              </span>
            </p>
          </div>
        </div>

        {/* Availability badge */}
        <div className="absolute top-3 right-3">
          {carrier.isAvailable ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Busy
            </span>
          )}
        </div>
      </div>

      {/* Content section */}
      <div className={cn("flex-1", isGrid ? "px-4" : "py-4")}>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
          {carrier.description}
        </p>

        {/* Vehicle types */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {carrier.vehicleTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                {vehicleTypeLabels[type]}
              </span>
            ))}
            {carrier.vehicleTypes.length > 3 && (
              <span className="text-xs text-gray-500">
                +{carrier.vehicleTypes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Cargo specializations */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {carrier.cargoSpecializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
              >
                {cargoSpecializationLabels[spec]}
              </span>
            ))}
            {carrier.cargoSpecializations.length > 3 && (
              <span className="text-xs text-gray-500">
                +{carrier.cargoSpecializations.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {carrier.yearsInBusiness} yrs
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {carrier.completedShipments} shipments
          </span>
          {carrier.hasInsurance && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Insured
            </span>
          )}
        </div>
      </div>

      {/* Footer/Actions section */}
      <div
        className={cn(
          "border-t border-gray-100 dark:border-gray-800",
          isGrid
            ? "p-4 flex items-center justify-between"
            : "p-4 flex flex-col gap-2 min-w-[180px] border-l border-t-0"
        )}
      >
        <div className={cn(isGrid ? "" : "text-center mb-2")}>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${carrier.pricePerMile.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            /mile
          </span>
        </div>

        <div className={cn("flex gap-2", isGrid ? "" : "flex-col")}>
          <button
            onClick={() => onContact(carrier)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Contact
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onBookmark(carrier.id)}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                isBookmarked
                  ? "border-yellow-400 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
              title={isBookmarked ? "Remove bookmark" : "Bookmark carrier"}
            >
              <svg
                className="w-5 h-5"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>

            <button
              onClick={() => onCompare(carrier.id)}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                isComparing
                  ? "border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
              title={isComparing ? "Remove from comparison" : "Add to comparison"}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrierCard;
