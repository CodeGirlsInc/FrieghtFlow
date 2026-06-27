'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, MapPin, Route } from 'lucide-react';

interface Stop { id: string; label: string; name: string }

interface Leg { from: string; to: string; distanceKm: number; timeHours: number }

function mockLegs(stops: Stop[]): Leg[] {
  const legs: Leg[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const dist = 80 + ((i * 137 + stops[i].name.length * 31) % 420);
    legs.push({ from: stops[i].name || stops[i].label, to: stops[i + 1].name || stops[i + 1].label, distanceKm: dist, timeHours: parseFloat((dist / 80).toFixed(1)) });
  }
  return legs;
}

let uid = 0;
function newStop(label: string): Stop { return { id: String(++uid), label, name: '' }; }

const INITIAL: Stop[] = [newStop('Origin'), newStop('Destination')];

export default function RouteOptimizerPage() {
  const [stops, setStops] = useState<Stop[]>(INITIAL);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const waypoints = stops.slice(1, -1);
  const canAddWaypoint = waypoints.length < 5;

  function updateName(id: string, name: string) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }

  function addWaypoint() {
    setStops((prev) => [...prev.slice(0, -1), newStop(`Stop ${waypoints.length + 1}`), prev[prev.length - 1]]);
  }

  function removeStop(id: string) {
    setStops((prev) => prev.filter((s) => s.id !== id));
  }

  function onDragStart(idx: number) { setDragIdx(idx); }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    // Only allow reordering waypoints (indices 1..len-2)
    if (idx === 0 || idx === stops.length - 1) return;
    if (dragIdx === 0 || dragIdx === stops.length - 1) return;
    setStops((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  }
  function onDragEnd() { setDragIdx(null); }

  const filledStops = stops.filter((s) => s.name.trim());
  const legs = filledStops.length >= 2 ? mockLegs(filledStops) : [];
  const totalDist = legs.reduce((a, l) => a + l.distanceKm, 0);
  const totalTime = legs.reduce((a, l) => a + l.timeHours, 0);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Freight Route Optimizer</h1>
        <p className="mb-8 text-sm text-gray-500">Add stops, drag to reorder waypoints, and see estimated distances and transit times.</p>

        {/* Stop inputs */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="space-y-2">
            {stops.map((stop, idx) => {
              const isOrigin = idx === 0;
              const isDest = idx === stops.length - 1;
              const isWaypoint = !isOrigin && !isDest;
              return (
                <div
                  key={stop.id}
                  draggable={isWaypoint}
                  onDragStart={() => isWaypoint && onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={onDragEnd}
                  className="flex items-center gap-2"
                >
                  {isWaypoint
                    ? <GripVertical className="h-4 w-4 cursor-grab text-gray-400 shrink-0" />
                    : <MapPin className={`h-4 w-4 shrink-0 ${isOrigin ? 'text-blue-500' : 'text-red-500'}`} />
                  }
                  <input
                    type="text"
                    placeholder={stop.label}
                    value={stop.name}
                    onChange={(e) => updateName(stop.id, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {isWaypoint && (
                    <button onClick={() => removeStop(stop.id)} className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {canAddWaypoint && (
            <button onClick={addWaypoint}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <Plus className="h-3.5 w-3.5" /> Add waypoint
            </button>
          )}
        </section>

        {/* Map placeholder */}
        <div className="mb-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-400">
          <div className="text-center">
            <Route className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            {filledStops.length >= 2
              ? `Route: ${filledStops.map((s) => s.name).join(' → ')}`
              : 'Enter at least origin and destination to preview route'}
          </div>
        </div>

        {/* Summary table */}
        {legs.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Leg</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-right">Distance (km)</th>
                    <th className="px-4 py-3 text-right">Est. Time (hrs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {legs.map((leg, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-700">{leg.from}</td>
                      <td className="px-4 py-3 text-gray-700">{leg.to}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{leg.distanceKm}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{leg.timeHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 flex flex-wrap gap-8 text-sm">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Distance</p>
                <p className="text-xl font-bold text-blue-900">{totalDist} km</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Est. Transit Time</p>
                <p className="text-xl font-bold text-blue-900">{totalTime.toFixed(1)} hrs</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
