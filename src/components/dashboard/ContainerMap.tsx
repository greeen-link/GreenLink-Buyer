import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Container } from '../../types';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBnmZYDfPialNQIZgsZlxdjI8PxZA6bAsU';

const mapContainerStyle = {
  height: '400px',
  width: '100%',
  borderRadius: '0.5rem'
};

interface ContainerMapProps {
  containers: Container[];
}

const parseLocation = (location: string) => {
  try {
    if (!location) return null;
    const [lat, lng] = location.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid location format:', location);
      return null;
    }
    return { lat, lng };
  } catch (error) {
    console.error('Error parsing location:', error);
    return null;
  }
};

const ContainerMap: React.FC<ContainerMapProps> = ({ containers }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    version: "weekly"
  });

  // Filter for active containers only
  const activeContainers = containers.filter(container => container.status === 'active');

  // Debug the active containers data
  React.useEffect(() => {
    console.log('Active Containers:', activeContainers);
    activeContainers.forEach(container => {
      const coords = parseLocation(container.location);
      console.log(`Container ${container.id} location:`, container.location, '→', coords);
    });
  }, [activeContainers]);

  const containersWithLocations = activeContainers.filter(container => {
    const hasLocation = parseLocation(container.location) !== null;
    if (!hasLocation) {
      console.warn(`Container ${container.id} has invalid location:`, container.location);
    }
    return hasLocation;
  });

  // Set center to Sydney, Australia as default if no containers
  const defaultMapCenter = { lat: -33.8688, lng: 151.2093 };
  const center = containersWithLocations.length > 0
    ? containersWithLocations.reduce(
        (acc, container) => {
          const coords = parseLocation(container.location);
          if (coords) {
            acc.lat += coords.lat / containersWithLocations.length;
            acc.lng += coords.lng / containersWithLocations.length;
          }
          return acc;
        },
        { ...defaultMapCenter }
      )
    : defaultMapCenter;

  if (loadError) {
    console.error('Error loading Google Maps:', loadError);
    return (
      <div style={mapContainerStyle} className="bg-secondary-50 flex items-center justify-center">
        <p className="text-error-500">Error loading map. Please try again later.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={mapContainerStyle} className="bg-secondary-50 flex items-center justify-center">
        <p className="text-secondary-500">Loading map...</p>
      </div>
    );
  }
  console.log('Rendering map with center:', center);

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={3}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        {/* Only map through containers that are active and have valid locations */}
        {containersWithLocations.map((container) => {
          const coords = parseLocation(container.location);
          if (!coords) return null;

          console.log(`Rendering marker for container ${container.id} at:`, coords);

          return (
            <Marker
              key={container.id}
              position={coords}
              title={container.name}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default ContainerMap;
