"use client";

import React, { useState } from 'react';

export default function CargoDeliveryForm() {
  const [transportType, setTransportType] = useState('ship');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [shippingItem, setShippingItem] = useState('');
  const [calculationUnit, setCalculationUnit] = useState('');

  const handleCalculate = () => {
    // Calculation logic would go here
    console.log({
      transportType,
      pickupLocation,
      deliveryLocation,
      shippingItem,
      calculationUnit
    });
    alert('Calculation requested! Check console for details.');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-[7rem]">
        {/* Left section - Heading and description */}
        <div className="md:w-1/3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Delivering your Cargo
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-amber-600 mb-6">
            Worldwide
          </h2>
          <p className="text-gray-700 mb-4">
            We provide efficient and reliable cargo delivery services to destinations all around the globe. With our extensive network of transportation options, we ensure your cargo reaches its destination safely and on time.
          </p>
          <p className="text-gray-700">
            Choose from our variety of transportation methods including sea, air, and road to meet your specific delivery needs and budget requirements.
          </p>
        </div>

        {/* Right section - Form */}
        <div className="md:w-2/3 bg-white p-4 md:p-6 rounded-lg">
          {/* Transport Type Selector */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                className={`pb-4 px-1 ${transportType === 'ship' ? 'text-amber-600 border-b-2 border-amber-600 font-medium' : 'text-gray-500'}`}
                onClick={() => setTransportType('ship')}
              >
                Ship Transport
              </button>
              <button
                className={`pb-4 px-1 ${transportType === 'air' ? 'text-amber-600 border-b-2 border-amber-600 font-medium' : 'text-gray-500'}`}
                onClick={() => setTransportType('air')}
              >
                Air Transport
              </button>
              <button
                className={`pb-4 px-1 ${transportType === 'road' ? 'text-amber-600 border-b-2 border-amber-600 font-medium' : 'text-gray-500'}`}
                onClick={() => setTransportType('road')}
              >
                Road Transport
              </button>
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Delivery Destination</h3>
            
            <div className="mb-4 relative">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-gray-900 mr-2"></div>
                <span className="text-gray-600">Pickup Location</span>
              </div>
              <input
                type="text"
                className="w-full p-2 border-b border-gray-300 focus:border-amber-600 focus:outline-none"
                placeholder="Enter pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-amber-600 mr-2"></div>
                <span className="text-gray-600">Delivery Location</span>
              </div>
              <input
                type="text"
                className="w-full p-2 border-b border-gray-300 focus:border-amber-600 focus:outline-none"
                placeholder="Enter delivery location"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Shipping Item</h3>
              <div className="relative">
                <select
                  className="w-full p-2 appearance-none border-b border-gray-300 focus:border-amber-600 focus:outline-none bg-transparent"
                  value={shippingItem}
                  onChange={(e) => setShippingItem(e.target.value)}
                >
                  <option value="" disabled selected>Choose</option>
                  <option value="documents">Documents</option>
                  <option value="parcel">Parcel</option>
                  <option value="freight">Freight</option>
                  <option value="heavy">Heavy Equipment</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Calculate</h3>
              <div className="relative">
                <select
                  className="w-full p-2 appearance-none border-b border-gray-300 focus:border-amber-600 focus:outline-none bg-transparent"
                  value={calculationUnit}
                  onChange={(e) => setCalculationUnit(e.target.value)}
                >
                  <option value="" disabled selected>kg/ton</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ton">Tons</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-amber-600 text-white py-4 rounded hover:bg-amber-700 transition duration-300"
          >
            Calculate
          </button>
        </div>
      </div>
    </div>
  );
}