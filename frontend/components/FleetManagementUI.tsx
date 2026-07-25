'use client';

import { useState } from 'react';

export default function FleetManagementUI() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [plate, setPlate] = useState('');
  const [driver, setDriver] = useState('');

  const handleAddVehicle = () => {
    if (plate && driver) {
      setVehicles([...vehicles, { id: Date.now(), plate, driver, status: 'active' }]);
      setPlate('');
      setDriver('');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Fleet & Driver Management</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input type="text" placeholder="License Plate" value={plate} onChange={(e) => setPlate(e.target.value)} className="border p-2 w-full mb-2 rounded" />
        <input type="text" placeholder="Driver Name" value={driver} onChange={(e) => setDriver(e.target.value)} className="border p-2 w-full mb-2 rounded" />
        <button onClick={handleAddVehicle} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add Vehicle</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">License Plate</th>
              <th className="border p-2 text-left">Driver</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="border p-2">{v.plate}</td>
                <td className="border p-2">{v.driver}</td>
                <td className="border p-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{v.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
