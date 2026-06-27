'use client';
// #1001 – Reports page: generate PDF/CSV and poll download status
import { useState } from 'react';
import { apiClient } from '../../../../lib/api/client';

interface ReportJob { jobId: string; status: string; downloadUrl?: string; }

export default function ReportsPage() {
  const [format, setFormat] = useState<'pdf'|'csv'>('pdf');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [job, setJob] = useState<ReportJob | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const result = await apiClient<ReportJob>('/reports/generate', { method: 'POST', body: JSON.stringify({ format, dateFrom: from, dateTo: to }) });
      setJob(result);
      const t = setInterval(async () => {
        const s = await apiClient<ReportJob>(`/reports/${result.jobId}/status`);
        setJob(s);
        if (s.status === 'ready' || s.status === 'failed') clearInterval(t);
      }, 3000);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Generate Report</h1>
      <div className="flex gap-2">
        {(['pdf','csv'] as const).map(f => (
          <button key={f} onClick={() => setFormat(f)} className={`rounded px-3 py-1 text-sm font-medium ${format===f?'bg-blue-600 text-white':'bg-gray-100'}`}>{f.toUpperCase()}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded border px-2 py-1 text-sm"/>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded border px-2 py-1 text-sm"/>
      </div>
      <button onClick={generate} disabled={loading||!from||!to} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{loading?'Requesting…':'Generate'}</button>
      {job && <div className="rounded border p-3 text-sm"><p>Status: <span className="font-semibold">{job.status}</span></p>{job.downloadUrl && <a href={job.downloadUrl} className="text-blue-600 underline">Download</a>}</div>}
    </div>
  );
}
