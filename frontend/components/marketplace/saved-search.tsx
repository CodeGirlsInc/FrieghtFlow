'use client';
// #979 – Marketplace: save & reload named search filters
import { useState } from 'react';

export interface SearchFilter { origin?: string; destination?: string; minPrice?: number; maxPrice?: number; category?: string; }
interface SavedItem { name: string; filter: SearchFilter; }
interface Props { currentFilter: SearchFilter; onLoad: (f: SearchFilter) => void; }

export function SavedSearch({ currentFilter, onLoad }: Props) {
  const [saved, setSaved] = useState<SavedItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_searches') ?? '[]') as SavedItem[]; } catch { return []; }
  });
  const [name, setName] = useState('');

  const save = () => {
    if (!name.trim()) return;
    const updated = [...saved, { name: name.trim(), filter: currentFilter }];
    setSaved(updated);
    localStorage.setItem('saved_searches', JSON.stringify(updated));
    setName('');
  };

  const remove = (i: number) => {
    const updated = saved.filter((_, idx) => idx !== i);
    setSaved(updated);
    localStorage.setItem('saved_searches', JSON.stringify(updated));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Save search as…" className="flex-1 rounded border px-2 py-1 text-sm"/>
        <button onClick={save} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Save</button>
      </div>
      {saved.map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded border px-3 py-1">
          <button onClick={() => onLoad(s.filter)} className="text-sm text-blue-600 underline">{s.name}</button>
          <button onClick={() => remove(i)} className="text-xs text-red-400">✕</button>
        </div>
      ))}
    </div>
  );
}
