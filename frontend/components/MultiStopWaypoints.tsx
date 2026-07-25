import React, { useState } from 'react';

interface Waypoint {
  id: string;
  address: string;
  sequence: number;
}

export const MultiStopWaypoints: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: '1', address: 'Starting Point', sequence: 1 },
  ]);

  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: String(waypoints.length + 1),
      address: '',
      sequence: waypoints.length + 1,
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const updateWaypoint = (id: string, address: string) => {
    setWaypoints(
      waypoints.map(w => (w.id === id ? { ...w, address } : w))
    );
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  return (
    <div className="waypoints-container">
      <h3>Multi-Stop Waypoints</h3>
      {waypoints.map(wp => (
        <div key={wp.id} className="waypoint-item">
          <input
            type="text"
            value={wp.address}
            placeholder="Enter address"
            onChange={e => updateWaypoint(wp.id, e.target.value)}
          />
          <button onClick={() => removeWaypoint(wp.id)}>Remove</button>
        </div>
      ))}
      <button onClick={addWaypoint}>Add Waypoint</button>
    </div>
  );
};
