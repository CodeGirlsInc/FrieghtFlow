import React, { useEffect, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  timestamp: Date;
}

export const LiveShipmentMap: React.FC<{ shipmentId: string }> = ({
  shipmentId,
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(false);
        setLocation({
          lat: 40.7128,
          lng: -74.006,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Failed to fetch shipment location:', error);
        setLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [shipmentId]);

  if (loading) return <div>Loading map...</div>;

  return (
    <div className="shipment-map-container">
      <h3>Live Tracking</h3>
      {location && (
        <div className="map-info">
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
          <p>Updated: {location.timestamp.toLocaleTimeString()}</p>
        </div>
      )}
      <div className="map-placeholder">Map View</div>
    </div>
  );
};
