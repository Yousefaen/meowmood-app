import { Circle } from 'react-leaflet';

interface GeofenceProps {
  center: [number, number];
  radius: number;
  visible: boolean;
}

export default function Geofence({ center, radius, visible }: GeofenceProps) {
  if (!visible) return null;

  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: '#7c3aed',       // purple-700 — matches --meow-purple hue
        fillColor: '#7c3aed',
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.6,
      }}
    />
  );
}
