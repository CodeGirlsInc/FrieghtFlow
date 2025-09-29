"use client";

import { useState } from "react";

type Shipment = {
  id: string;
  status: "In Transit" | "Out for Delivery" | "Delivered";
  origin: string;
  destination: string;
  date: string;
};

const currentShipments: Shipment[] = [
  {
    id: "SHP123",
    status: "In Transit",
    origin: "Lagos",
    destination: "Kaduna",
    date: "2025-09-10",
  },
  {
    id: "SHP124",
    status: "Out for Delivery",
    origin: "Abuja",
    destination: "Kano",
    date: "2025-09-12",
  },
];

const pastShipments: Shipment[] = [
  {
    id: "SHP100",
    status: "Delivered",
    origin: "Port Harcourt",
    destination: "Enugu",
    date: "2025-08-25",
  },
  {
    id: "SHP101",
    status: "Delivered",
    origin: "Ibadan",
    destination: "Ilorin",
    date: "2025-08-28",
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <section className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition">
              📦 Book Shipment
            </button>
            <button className="px-4 py-2 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition">
              🔍 Track Shipment
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("current")}
            className={`pb-2 px-2 border-b-2 ${
              activeTab === "current"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600"
            }`}
          >
            Current Shipments
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-2 px-2 border-b-2 ${
              activeTab === "past"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600"
            }`}
          >
            Past Shipments
          </button>
        </div>

        {/* Shipment List */}
        <div className="grid gap-4">
          {(activeTab === "current" ? currentShipments : pastShipments).map(
            (shipment) => (
              <div
                key={shipment.id}
                className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {shipment.id}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {shipment.origin} ➝ {shipment.destination}
                  </p>
                  <p className="text-xs text-gray-400">Date: {shipment.date}</p>
                </div>
                <span
                  className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-medium rounded-2xl ${
                    shipment.status === "In Transit"
                      ? "bg-yellow-100 text-yellow-800"
                      : shipment.status === "Out for Delivery"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {shipment.status}
                </span>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
