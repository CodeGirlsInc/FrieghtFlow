import React from 'react';

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  description?: string;
  weight?: number;
  volume?: number;
  price?: number;
  pickupDate?: string;
  shipperName?: string;
  carrierName?: string;
  status?: string; // optional for detail page context
}

interface Props {
  shipment: Shipment;
  onClick?: (id: string) => void; // optional handler for navigation
}

const ShipmentCard: React.FC<Props> = ({ shipment, onClick }) => {
  return (
    <div
      className="border rounded shadow-sm p-4 bg-white cursor-pointer hover:shadow-md transition"
      onClick={() => onClick?.(shipment.id)}
    >
      {/* Header */}
      <h2 className="text-lg font-semibold mb-2">
        {shipment.origin} → {shipment.destination}
      </h2>

      {/* Cargo Details */}
      <ul className="text-sm text-gray-600 space-y-1">
        {shipment.description && <li>Description: {shipment.description}</li>}
        {shipment.weight && <li>Weight: {shipment.weight} kg</li>}
        {shipment.volume && <li>Volume: {shipment.volume} m³</li>}
        {shipment.price && <li>Price: ${shipment.price}</li>}
        {shipment.pickupDate && (
          <li>Pickup: {new Date(shipment.pickupDate).toLocaleDateString()}</li>
        )}
      </ul>

      {/* Parties */}
      {(shipment.shipperName || shipment.carrierName) && (
        <div className="mt-3 text-sm text-gray-700">
          <p>Shipper: {shipment.shipperName || '—'}</p>
          <p>Carrier: {shipment.carrierName || '—'}</p>
        </div>
      )}

      {/* Status */}
      {shipment.status && (
        <p className="mt-2 text-xs font-medium text-gray-500">
          Status: {shipment.status}
        </p>
      )}

      {/* Action */}
      <button
        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => onClick?.(shipment.id)}
      >
        View Details
      </button>
    </div>
  );
};

export default ShipmentCard;
