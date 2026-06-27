// #985 – Live shipment tracking timeline component
interface TrackEvent { label: string; timestamp: string; completed: boolean; }
interface Props { events: TrackEvent[]; estimatedArrival: string; }

export function TrackingTimeline({ events, estimatedArrival }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded border bg-blue-50 p-3 text-sm">
        <span className="text-gray-500">Estimated Arrival: </span>
        <span className="font-semibold text-blue-700">{new Date(estimatedArrival).toLocaleString()}</span>
      </div>
      {events.length === 0 ? <p className="text-sm text-gray-400">No tracking events yet.</p> : (
        <ol className="relative border-l border-gray-200 pl-4 space-y-4">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className={`absolute -left-5 flex h-4 w-4 items-center justify-center rounded-full text-xs ${e.completed ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>✓</span>
              <p className="text-sm font-medium">{e.label}</p>
              <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
