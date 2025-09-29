import React, { useState } from 'react';

const shipmentTypes = [
  { label: 'Small Parcel', value: 'small_parcel', base: 10 },
  { label: 'Container', value: 'container', base: 50 },
  { label: 'Bulk', value: 'bulk', base: 100 },
];

const deliverySpeeds = [
  { label: 'Standard', value: 'standard', multiplier: 1 },
  { label: 'Express', value: 'express', multiplier: 1.5 },
];

function estimateCost(type, speed) {
  const typeObj = shipmentTypes.find(t => t.value === type);
  const speedObj = deliverySpeeds.find(s => s.value === speed);
  if (!typeObj || !speedObj) return 0;
  return typeObj.base * speedObj.multiplier;
}

export default function BookShipmentForm() {
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [type, setType] = useState('small_parcel');
  const [speed, setSpeed] = useState('standard');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    var errs = {};
    if (!pickup.trim()) errs.pickup = 'Pickup location required';
    if (!delivery.trim()) errs.delivery = 'Delivery location required';
    if (!type) errs.type = 'Shipment type required';
    if (!speed) errs.speed = 'Delivery speed required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
      // Submit logic here
    }
  }

  const cost = estimateCost(type, speed);

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Book a Shipment</h2>
      <div className="mb-3">
        <label className="block mb-1">Pickup Location</label>
        <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} className="w-full border rounded p-2" />
        {errors.pickup && <div className="text-red-500 text-sm">{errors.pickup}</div>}
      </div>
      <div className="mb-3">
        <label className="block mb-1">Delivery Location</label>
        <input type="text" value={delivery} onChange={e => setDelivery(e.target.value)} className="w-full border rounded p-2" />
        {errors.delivery && <div className="text-red-500 text-sm">{errors.delivery}</div>}
      </div>
      <div className="mb-3">
        <label className="block mb-1">Shipment Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded p-2">
          {shipmentTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
      </div>
      <div className="mb-3">
        <label className="block mb-1">Delivery Speed</label>
        <select value={speed} onChange={e => setSpeed(e.target.value)} className="w-full border rounded p-2">
          {deliverySpeeds.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.speed && <div className="text-red-500 text-sm">{errors.speed}</div>}
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-semibold">Estimated Cost: </label>
        <span className="text-blue-700 font-bold">${cost.toFixed(2)}</span>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Book Shipment</button>
      {submitted && <div className="mt-3 text-green-600">Shipment booked successfully!</div>}
    </form>
  );
}
