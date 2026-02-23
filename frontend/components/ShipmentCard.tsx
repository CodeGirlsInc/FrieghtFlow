import React from 'react';

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  weight?: number;
  price?: number;
  pickupDate?: string;
}

interface Props {
  shipment: Shipment;
}

const ShipmentCard: React.FC<Props> = ({ shipment }) => {
  return (
    <div className="border rounded shadow-sm p-4 bg-white">
      <h2 className="text-lg font-semibold mb-2">
        {shipment.origin} → {shipment.destination}
      </h2>
      <ul className="text-sm text-gray-600 space-y-1">
        {shipment.weight && <li>Weight: {shipment.weight} kg</li>}
        {shipment.price && <li>Price: ${shipment.price}</li>}
        {shipment.pickupDate && <li>Pickup: {new Date(shipment.pickupDate).toLocaleDateString()}</li>}
