"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ShipmentResult {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ShipmentSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShipmentResult[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setOpen(false); return; }
    // Replace with real API call: fetch(`/api/shipments/search?q=${debouncedQuery}`)
    const mock: ShipmentResult[] = [
      { id: "1", trackingNumber: "TRK-001", origin: "Lagos", destination: "Abuja", status: "IN_TRANSIT" },
      { id: "2", trackingNumber: "TRK-002", origin: "Kano", destination: "Port Harcourt", status: "PENDING" },
    ].filter(s => s.trackingNumber.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(debouncedQuery.toLowerCase()));
    setResults(mock);
    setOpen(true);
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = (id: string) => { router.push(`/shipments/${id}`); setOpen(false); setQuery(""); };

  return (
    <div ref={ref} className="relative w-full max-w-md" role="search">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => results.length && e.key === "Enter" && navigate(results[0].id)}
        placeholder="Search by tracking number, origin or destination…"
        role="combobox"
        aria-label="Search shipments"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.length === 0
            ? <li className="px-4 py-3 text-sm text-gray-500">No results</li>
            : results.map(r => (
              <li key={r.id} role="option" aria-selected={false}
                onClick={() => navigate(r.id)}
                className="cursor-pointer px-4 py-3 text-sm hover:bg-gray-50">
                <span className="font-medium">{r.trackingNumber}</span>
                <span className="ml-2 text-gray-500">{r.origin} → {r.destination}</span>
                <span className="ml-2 text-xs text-blue-600">{r.status}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
