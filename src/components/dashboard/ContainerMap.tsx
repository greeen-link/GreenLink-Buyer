import React from 'react';
import { Container } from '../../types';
import Card from '../ui/Card'; // Assuming Card is a general purpose component

// Placeholder components if not available from a UI library
const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="p-4">{children}</div>;


interface ContainerMapProps {
  selectedContainer: Container | null | undefined;
}

// parseLocation function is no longer needed if using separate lat/lng fields directly

const ContainerMap: React.FC<ContainerMapProps> = ({ selectedContainer }) => {
  const latitude = selectedContainer?.latitude;
  const longitude = selectedContainer?.longitude;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedContainer && latitude !== undefined && longitude !== undefined ? (
          <div className="h-[200px] rounded-md overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`}
            ></iframe>
          </div>
        ) : (
          <div className="h-[200px] bg-secondary-200 rounded-md flex items-center justify-center"> {/* Using bg-secondary-200 as a placeholder for muted */}
            <p className="text-secondary-500"> {/* Using text-secondary-500 as a placeholder for muted-foreground */}
              {selectedContainer ? 'Location data not available or invalid for this container.' : 'No container selected or location data unavailable.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContainerMap;
