"use client";
import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

// Mock data for shipments
const mockShipments = [
  {
    id: "FRGHT-SN2024-00789",
    status: "In Transit",
    origin: "Rotterdam, NL",
    destination: "Singapore, SG",
    date: "2024-03-20T09:00:00Z",
    eta: "2024-04-15T18:30:00Z",
    progress: 65,
    currentLocation: "Suez Canal, EG",
    contents: ["Electronic Components", "Machinery Parts"],
    weight: 2500,
    volume: 45,
    containerType: "40ft Standard",
    blockchain: {
      transactionHash: "0x1234abcd...",
      network: "StarkNet",
    },
  },
  {
    id: "FRGHT-SN2024-00790",
    status: "Pending Pickup",
    origin: "Hamburg, DE",
    destination: "Mumbai, IN",
    date: "2024-04-01T14:00:00Z",
    eta: "2024-04-25T10:00:00Z",
    progress: 20,
    currentLocation: "Origin Warehouse",
    contents: ["Automotive Parts"],
    weight: 1800,
    volume: 32,
    containerType: "20ft Standard",
    blockchain: {
      transactionHash: "0x5678efgh...",
      network: "StarkNet",
    },
  },
  {
    id: "FRGHT-SN2024-00791",
    status: "Completed",
    origin: "Shanghai, CN",
    destination: "Los Angeles, US",
    date: "2024-03-10T11:00:00Z",
    eta: "2024-03-30T16:45:00Z",
    progress: 100,
    currentLocation: "Destination Warehouse",
    contents: ["Consumer Electronics"],
    weight: 1200,
    volume: 25,
    containerType: "40ft High Cube",
    blockchain: {
      transactionHash: "0x9012ijkl...",
      network: "StarkNet",
    },
  },
];

const ShipmentsManagementPage = () => {
  const [shipments, setShipments] = useState(mockShipments);
  const [filteredShipments, setFilteredShipments] = useState(mockShipments);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and search shipments
  useEffect(() => {
    let result = shipments;

    // Filter by status
    if (filterStatus !== "All") {
      result = result.filter((shipment) => shipment.status === filterStatus);
    }

    // Search by tracking number, origin, or destination
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(
        (shipment) =>
          shipment.id.toLowerCase().includes(searchTermLower) ||
          shipment.origin.toLowerCase().includes(searchTermLower) ||
          shipment.destination.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredShipments(result);
  }, [filterStatus, searchTerm, shipments]);

  // Calculate time remaining or passed
  const calculateTimeStatus = (date) => {
    const shipmentDate = new Date(date);
    const now = new Date();
    const difference = shipmentDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      return `${days} days remaining`;
    } else {
      const daysPassed = Math.abs(
        Math.floor(difference / (1000 * 60 * 60 * 24))
      );
      return `${daysPassed} days ago`;
    }
  };

  // Render shipment details modal
  const renderShipmentDetails = () => {
    if (!selectedShipment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="bg-[#f4f6f3] p-6 border-b border-[#d9d9d9] flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0c1421]">
              Shipment Details: {selectedShipment.id}
            </h2>
            <button
              onClick={() => setSelectedShipment(null)}
              className="text-[#313957] hover:text-[#b57704]"
            >
              ✕
            </button>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-[#0c1421] mb-4">
                Shipment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Status</span>
                  <span
                    className={`
                    font-medium
                    ${
                      selectedShipment.status === "In Transit"
                        ? "text-green-600"
                        : selectedShipment.status === "Completed"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }
                  `}
                  >
                    {selectedShipment.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Origin</span>
                  <span className="font-medium">{selectedShipment.origin}</span>
                </div>
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Destination</span>
                  <span className="font-medium">
                    {selectedShipment.destination}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Shipment Date</span>
                  <span className="font-medium">
                    {new Date(selectedShipment.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#0c1421] mb-4">
                Additional Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Weight</span>
                  <span className="font-medium">
                    {selectedShipment.weight} kg
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Volume</span>
                  <span className="font-medium">
                    {selectedShipment.volume} m³
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Container Type</span>
                  <span className="font-medium">
                    {selectedShipment.containerType}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d9d9d9] pb-2">
                  <span className="text-[#313957]">Contents</span>
                  <span className="font-medium">
                    {selectedShipment.contents.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#f4f6f3] border-t border-[#d9d9d9]">
            <h3 className="text-xl font-semibold text-[#0c1421] mb-4">
              Blockchain Verification
            </h3>

{/* 2ND CODE */}



            <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
              <div className="flex justify-between">
                <div>
                  <p className="text-[#313957]">Transaction Hash</p>
                  <p className="font-medium text-[#0c1421] truncate">
                    {selectedShipment.blockchain.transactionHash}
                  </p>
                </div>
                <div>
                  <p className="text-[#313957]">Blockchain Network</p>
                  <p className="font-medium text-[#0c1421]">
                    {selectedShipment.blockchain.network}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white border border-[#d9d9d9] rounded-2xl shadow-lg">
          {/* Header */}
          <div className="bg-[#f4f6f3] p-6 border-b border-[#d9d9d9] flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#0c1421]">
                My Shipments
              </h1>
              <p className="text-[#313957] mt-2">
                Manage and track your ongoing shipments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={"/shipments/create-new-shipment"}>
                <button className="bg-[#b57704] text-white px-4 py-2 rounded-md hover:bg-[#9c6503]">
                  Create New Shipment
                </button>
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-[#d9d9d9] flex justify-between items-center">
            <div className="flex space-x-4">
              {["All", "Pending Pickup", "In Transit", "Completed"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`
                    px-4 py-2 rounded-md
                    ${
                      filterStatus === status
                        ? "bg-[#b57704] text-white"
                        : "bg-[#f4f6f3] text-[#313957] hover:bg-[#e0e4dc]"
                    }
                  `}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] text-[#313957] focus:outline-none focus:ring-2 focus:ring-[#b57704]"
              />
            </div>
          </div>

          {/* Shipments List */}
          <div>
            {filteredShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="p-6 border-b border-[#d9d9d9] flex justify-between items-center hover:bg-[#f4f6f3] cursor-pointer"
                onClick={() => setSelectedShipment(shipment)}
              >
                <div className="flex items-center space-x-6">
                  <QRCodeSVG
                    value={shipment.id}
                    size={64}
                    className="bg-white p-1 border border-[#d9d9d9] rounded"
                  />
                  <div>
                    <p className="text-lg font-semibold text-[#0c1421]">
                      {shipment.id}
                    </p>
                    <p className="text-[#313957]">
                      {shipment.origin} → {shipment.destination}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div>
                    <p
                      className={`
                      font-medium
                      ${
                        shipment.status === "In Transit"
                          ? "text-green-600"
                          : shipment.status === "Completed"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }
                    `}
                    >
                      {shipment.status}
                    </p>
                    <p className="text-[#313957]">
                      {calculateTimeStatus(shipment.eta)}
                    </p>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-[#b57704] h-4 rounded-full"
                      style={{ width: `${shipment.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipment Details Modal */}
        {selectedShipment && renderShipmentDetails()}
      </div>
    </div>
  );
};

export default ShipmentsManagementPage;
