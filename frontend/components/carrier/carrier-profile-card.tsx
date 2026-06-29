// #983 – Carrier profile card: fleet, availability & verification status
interface Fleet { type: string; plateNumber: string; available: boolean; }
interface Props { carrierId: string; companyName: string; verificationStatus: 'pending'|'verified'|'rejected'; fleet: Fleet[]; serviceAreas: string[]; }

const COLORS = { pending: 'bg-yellow-100 text-yellow-700', verified: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

export function CarrierProfileCard({ companyName, verificationStatus, fleet, serviceAreas }: Props) {
  return (
    <div className="rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{companyName}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLORS[verificationStatus]}`}>{verificationStatus}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Fleet ({fleet.length})</p>
        <ul className="space-y-1">
          {fleet.map((t, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{t.type} · {t.plateNumber}</span>
              <span className={t.available ? 'text-green-600' : 'text-gray-400'}>{t.available ? 'Available' : 'Busy'}</span>
            </li>
          ))}
        </ul>
      </div>
      {serviceAreas.length > 0 && <p className="text-sm text-gray-700">{serviceAreas.join(', ')}</p>}
    </div>
  );
}
