import React from 'react';

interface HistoryEvent {
  id: string;
  status: string;
  timestamp: string;
}

export default function ShipmentTimeline({ history }: { history: HistoryEvent[] }) {
  return (
    <div className="border rounded p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Status Timeline</h2>
      <ul className="space-y-3">
        {history.map((event) => (
          <li key={event.id} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="font-medium">{event.status}</span>
            <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
