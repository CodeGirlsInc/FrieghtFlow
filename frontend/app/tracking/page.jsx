'use client';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { QRCodeSVG } from 'qrcode.react';

// Expanded mock tracking data
const mockTrackingData = {
  trackingNumber: 'FRGHT-SN2024-00789',
  shipmentStatus: 'In Transit',
  origin: {
    city: 'Rotterdam, NL',
    coordinates: [51.9228, 4.4799],
    details: {
      warehouse: 'Global Logistics Hub',
      contact: '+31 20 123 4567',
      date: '2024-03-20T09:00:00Z',
    },
  },
  destination: {
    city: 'Singapore, SG',
    coordinates: [1.3521, 103.8198],
    details: {
      warehouse: 'Asia Pacific Distribution Center',
      contact: '+65 6789 0123',
      expectedDelivery: '2024-04-15T18:30:00Z',
    },
  },
  currentLocation: {
    city: 'Suez Canal, EG',
    coordinates: [30.5852, 32.5498],
  },
  estimatedArrival: '2024-04-15T18:30:00Z',
  stages: [
    {
      name: 'Pickup',
      status: 'Completed',
      timestamp: '2024-03-20T09:00:00Z',
      location: 'Rotterdam Port',
      details: 'Cargo loaded and initial checks completed',
    },
    {
      name: 'Sea Freight',
      status: 'In Progress',
      timestamp: '2024-03-22T14:45:00Z',
      location: 'Mediterranean Sea',
      details: 'Vessel MV FreightFlow-789 en route',
    },
    {
      name: 'Customs Clearance',
      status: 'Pending',
      timestamp: null,
      location: 'Not Started',
      details: 'Awaiting documentation processing',
    },
    {
      name: 'Delivery',
      status: 'Not Started',
      timestamp: null,
      location: 'Not Started',
      details: 'Final destination delivery not yet initiated',
    },
  ],
  shipmentDetails: {
    weight: 2500, // in kg
    volume: 45, // in cubic meters
    containerType: '40ft Standard',
    contents: ['Electronic Components', 'Machinery Parts'],
    insuranceValue: 250000, // in USD
    specialInstructions: 'Fragile electronic equipment, handle with care',
  },
  blockchain: {
    transactionHash: '0x1234abcd...',
    contractAddress: '0x5678efgh...',
    network: 'StarkNet',
    verification: 'Fully Verified',
  },
  documents: [
    {
      name: 'Commercial Invoice',
      type: 'PDF',
      uploadDate: '2024-03-19T15:30:00Z',
      downloadLink: '#',
    },
    {
      name: 'Packing List',
      type: 'PDF',
      uploadDate: '2024-03-19T15:35:00Z',
      downloadLink: '#',
    },
  ],
  alerts: [
    {
      type: 'warning',
      message: 'Potential customs delay expected',
      timestamp: '2024-03-25T10:15:00Z',
    },
  ],
};

const FreightTrackingPage = () => {
  const [trackingInfo, setTrackingInfo] = useState(mockTrackingData);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate shipment progress
  const calculateProgress = () => {
    const completedStages = trackingInfo.stages.filter(
      (stage) => stage.status === 'Completed'
    ).length;
    return (completedStages / trackingInfo.stages.length) * 100;
  };

  // Countdown to estimated arrival
  const [timeRemaining, setTimeRemaining] = useState('');
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const arrival = new Date(trackingInfo.estimatedArrival);
      const now = new Date();
      const difference = arrival - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeRemaining('Arrived');
      }
    };

    const timer = setInterval(calculateTimeRemaining, 1000);
    calculateTimeRemaining();

    return () => clearInterval(timer);
  }, [trackingInfo.estimatedArrival]);

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white border border-[#d9d9d9] rounded-2xl shadow-lg">
          {/* Header Section */}
          <div className="bg-[#f4f6f3] p-6 border-b border-[#d9d9d9]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#0c1421]">
                  Shipment Tracking
                </h1>
                <p className="text-[#313957] mt-2">
                  Tracking Number:
                  <span className="font-semibold ml-2">
                    {trackingInfo.trackingNumber}
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`
                  px-4 py-2 rounded-full text-sm font-semibold
                  ${
                    trackingInfo.shipmentStatus === 'In Transit'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {trackingInfo.shipmentStatus}
                </span>
                <QRCodeSVG
                  value={trackingInfo.trackingNumber}
                  size={64}
                  className="bg-white p-1 border border-[#d9d9d9] rounded"
                />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#d9d9d9]">
            {['overview', 'details', 'documents', 'blockchain', 'route'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                  px-6 py-3 capitalize text-[#313957] font-medium
                  ${
                    activeTab === tab
                      ? 'border-b-2 border-[#b57704] text-[#b57704]'
                      : 'hover:bg-[#f4f6f3]'
                  }
                `}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipment Progress */}
                <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9]">
                  <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                    Shipment Progress
                  </h2>
                  <div className="w-full bg-white border border-[#d9d9d9] rounded-full h-4 mb-4">
                    <div
                      className="bg-[#b57704] h-4 rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>

                  {trackingInfo.stages.map((stage, index) => (
                    <div key={stage.name} className="flex items-center mb-3">
                      <span
                        className={`
                          w-4 h-4 mr-3 rounded-full
                          ${
                            stage.status === 'Completed'
                              ? 'bg-green-500'
                              : stage.status === 'In Progress'
                              ? 'bg-[#b57704]'
                              : 'bg-gray-300'
                          }
                        `}
                      />
                      <div>
                        <p className="font-medium text-[#0c1421]">
                          {stage.name}
                        </p>
                        <p className="text-xs text-[#313957]">
                          {stage.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Estimated Arrival & Alerts */}
                <div>
                  {/* Estimated Arrival */}
                  <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9] mb-6">
                    <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                      Estimated Arrival
                    </h2>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#b57704] mb-4">
                        {timeRemaining}
                      </p>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-[#313957]">From</p>
                          <p className="font-medium">
                            {trackingInfo.origin.city}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#313957]">To</p>
                          <p className="font-medium">
                            {trackingInfo.destination.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {trackingInfo.alerts.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                      <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                        <i className="mr-2">⚠️</i>Active Alerts
                      </h2>
                      {trackingInfo.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="bg-yellow-100 border border-yellow-300 p-3 rounded-md mb-2"
                        >
                          <p className="text-yellow-800">{alert.message}</p>
                          <p className="text-xs text-yellow-600 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Shipment Details */}
                <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9]">
                  <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                    Shipment Details
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                      <span className="text-[#313957]">Weight</span>
                      <span className="font-medium">
                        {trackingInfo.shipmentDetails.weight} kg
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                      <span className="text-[#313957]">Volume</span>
                      <span className="font-medium">
                        {trackingInfo.shipmentDetails.volume} m³
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                      <span className="text-[#313957]">Container Type</span>
                      <span className="font-medium">
                        {trackingInfo.shipmentDetails.containerType}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                      <span className="text-[#313957]">Contents</span>
                      <span className="font-medium">
                        {trackingInfo.shipmentDetails.contents.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                      <span className="text-[#313957]">Insurance Value</span>
                      <span className="font-medium">
                        $
                        {trackingInfo.shipmentDetails.insuranceValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9]">
                  <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                    Special Instructions
                  </h2>
                  <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
                    <p className="text-[#313957]">
                      {trackingInfo.shipmentDetails.specialInstructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9]">
                <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                  Shipment Documents
                </h2>
                <div className="space-y-3">
                  {trackingInfo.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-[#d9d9d9] flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-[#0c1421]">{doc.name}</p>
                        <p className="text-sm text-[#313957]">
                          Uploaded: {new Date(doc.uploadDate).toLocaleString()}
                        </p>
                      </div>
                      <button className="bg-[#b57704] text-white px-4 py-2 rounded-md hover:bg-[#9c6503]">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous blockchain and route tabs remain the same */}
            {activeTab === 'blockchain' && (
              <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9]">
                <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                  Blockchain Verification
                </h2>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
                    <p className="text-[#313957]">Transaction Hash</p>
                    <p className="font-medium text-[#0c1421] truncate">
                      {trackingInfo.blockchain.transactionHash}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
                    <p className="text-[#313957]">Contract Address</p>
                    <p className="font-medium text-[#0c1421] truncate">
                      {trackingInfo.blockchain.contractAddress}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
                    <p className="text-[#313957]">Network</p>
                    <p className="font-medium text-[#0c1421]">
                      {trackingInfo.blockchain.network}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
                    <p className="text-[#313957]">Verification Status</p>
                    <p className="font-medium text-green-600">
                      {trackingInfo.blockchain.verification}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'route' && (
              <div className="bg-[#f4f6f3] rounded-lg p-5 border border-[#d9d9d9] h-[500px]">
                <h2 className="text-xl font-semibold text-[#0c1421] mb-4">
                  Shipment Route
                </h2>
                <MapContainer
                  center={trackingInfo.currentLocation.coordinates}
                  zoom={4}
                  className="h-full w-full rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Map markers and polyline remain the same */}
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightTrackingPage;
