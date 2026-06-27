// #1004 – Shipment detail status timeline with action guards
import { ShipmentStatus } from '../../../types/shipment.types';

interface TimelineStep { status: ShipmentStatus; label: string; }

const STEPS: TimelineStep[] = [
  { status: ShipmentStatus.PENDING,    label: 'Pending' },
  { status: ShipmentStatus.ACCEPTED,   label: 'Accepted' },
  { status: ShipmentStatus.IN_TRANSIT, label: 'In Transit' },
  { status: ShipmentStatus.DELIVERED,  label: 'Delivered' },
  { status: ShipmentStatus.COMPLETED,  label: 'Completed' },
];

const ORDER = [ShipmentStatus.PENDING, ShipmentStatus.ACCEPTED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED];

export function StatusTimeline({ currentStatus }: { currentStatus: ShipmentStatus }) {
  const currentIndex = ORDER.indexOf(currentStatus);
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step.status} className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
            <span className={`text-xs ${done ? 'font-semibold text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
            {i < STEPS.length - 1 && <span className="text-gray-300">→</span>}
          </li>
        );
      })}
    </ol>
  );
}
