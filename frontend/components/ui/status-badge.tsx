import React from "react";

export type ShipmentStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

type Size = "sm" | "md" | "lg";

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: Size;
}

const colorMap: Record<ShipmentStatus, string> = {
  PENDING:    "bg-gray-100 text-gray-700",
  ACCEPTED:   "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-yellow-100 text-yellow-700",
  DELIVERED:  "bg-teal-100 text-teal-700",
  COMPLETED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
  DISPUTED:   "bg-orange-100 text-orange-700",
};

const sizeMap: Record<Size, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

const label: Record<ShipmentStatus, string> = {
  PENDING:    "Pending",
  ACCEPTED:   "Accepted",
  IN_TRANSIT: "In Transit",
  DELIVERED:  "Delivered",
  COMPLETED:  "Completed",
  CANCELLED:  "Cancelled",
  DISPUTED:   "Disputed",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Shipment status: ${label[status]}`}
      className={`inline-flex items-center rounded-full font-medium ${colorMap[status]} ${sizeMap[size]}`}
    >
      {label[status]}
    </span>
  );
}
