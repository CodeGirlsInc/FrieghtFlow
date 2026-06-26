'use client';

import { useState } from 'react';

type AlertType = 'SLA Breach' | 'Delay' | 'Customs Hold' | 'Carrier No-Show';

interface ShipmentAlert {
  id: string;
  shipmentId: string;
  type: AlertType;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

const ALERT_STYLE: Record<AlertType, { color: string; icon: string }> = {
  'SLA Breach':     { color: 'text-red-600 bg-red-50 border-red-200',    icon: '🚨' },
  'Delay':          { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '⏰' },
  'Customs Hold':   { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🛃' },
  'Carrier No-Show':{ color: 'text-red-600 bg-red-50 border-red-200',    icon: '🚫' },
};

const MOCK_ALERTS: ShipmentAlert[] = [
  { id: 'a1', shipmentId: 'FF-00201', type: 'SLA Breach',      description: 'Delivery exceeded SLA by 6 hours. Expected by 08:00, arrived 14:00.',       timestamp: '2026-06-26T14:05:00Z', acknowledged: false },
  { id: 'a2', shipmentId: 'FF-00198', type: 'Delay',           description: 'Shipment delayed by 12 hours due to road closures in Lagos.',                 timestamp: '2026-06-26T11:30:00Z', acknowledged: false },
  { id: 'a3', shipmentId: 'FF-00195', type: 'Customs Hold',    description: 'Shipment held at Apapa port pending additional customs documentation.',        timestamp: '2026-06-25T16:45:00Z', acknowledged: false },
  { id: 'a4', shipmentId: 'FF-00193', type: 'Carrier No-Show', description: 'Assigned carrier failed to pick up shipment at scheduled time.',              timestamp: '2026-06-25T09:15:00Z', acknowledged: true  },
  { id: 'a5', shipmentId: 'FF-00190', type: 'SLA Breach',      description: 'Priority shipment delivered 18 hours past guaranteed SLA window.',            timestamp: '2026-06-24T20:00:00Z', acknowledged: true  },
  { id: 'a6', shipmentId: 'FF-00188', type: 'Delay',           description: 'Vehicle breakdown causing estimated 8-hour delay on route to Abuja.',         timestamp: '2026-06-24T13:00:00Z', acknowledged: false },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ShipmentAlert[]>(MOCK_ALERTS);
  const [filterType, setFilterType] = useState<AlertType | 'All'>('All');
  const [filterDate, setFilterDate] = useState('');

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  const filtered = alerts.filter((a) => {
    const typeMatch = filterType === 'All' || a.type === filterType;
    const dateMatch = !filterDate || a.timestamp.startsWith(filterDate);
    return typeMatch && dateMatch;
  });

  const acknowledge = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));

  const acknowledgeAll = () =>
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipment Alerts</h1>
            <p className="mt-1 text-sm text-gray-500">SLA breaches, delays, and carrier issues</p>
          </div>
          <div className="flex items-center gap-3">
            {unacknowledgedCount > 0 && (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {unacknowledgedCount}
              </span>
            )}
            <button
              onClick={acknowledgeAll}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
            >
              Mark all acknowledged
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AlertType | 'All')}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            {(Object.keys(ALERT_STYLE) as AlertType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="text-sm text-blue-600 hover:underline">
              Clear date
            </button>
          )}
        </div>

        {/* Alert list */}
        <ul className="space-y-3">
          {filtered.length === 0 && (
            <li className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No alerts match your filters.
            </li>
          )}
          {filtered.map((alert) => {
            const style = ALERT_STYLE[alert.type];
            return (
              <li
                key={alert.id}
                className={`rounded-lg border p-4 ${style.color} ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span>{style.icon}</span>
                      <span>{alert.type}</span>
                      <span className="font-normal text-gray-500">·</span>
                      <a
                        href={`/shipments/${alert.shipmentId}`}
                        className="underline hover:no-underline"
                      >
                        {alert.shipmentId}
                      </a>
                    </div>
                    <p className="mt-1 text-sm">{alert.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="shrink-0 rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.acknowledged && (
                    <span className="shrink-0 text-xs font-medium text-green-600">✓ Acknowledged</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
