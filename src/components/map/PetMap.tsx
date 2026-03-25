import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import Geofence from './Geofence';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const mockTrail: [number, number][] = [
  [37.7700, -122.4210], // home base
  [37.7702, -122.4215],
  [37.7705, -122.4220],
  [37.7708, -122.4218],
  [37.7712, -122.4212],
  [37.7715, -122.4205],
  [37.7718, -122.4198],
  [37.7715, -122.4190],
  [37.7710, -122.4188],
  [37.7705, -122.4192],
  [37.7702, -122.4200],
  [37.7698, -122.4205],
  [37.7695, -122.4210],
  [37.7697, -122.4215],
  [37.7700, -122.4210], // return home
];

// Midpoint of the trail (approx center for geofence)
export const trailCenter: [number, number] = [37.7706, -122.4204];

interface PetMapProps {
  showGeofence: boolean;
}

export default function PetMap({ showGeofence }: PetMapProps) {
  const lastPosition = mockTrail[mockTrail.length - 1];

  return (
    <MapContainer
      center={lastPosition}
      zoom={15}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline
        positions={mockTrail}
        pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }}
      />
      <Marker position={lastPosition} icon={defaultIcon}>
        <Popup>Erbao — Last seen: 5 min ago</Popup>
      </Marker>
      <Geofence center={trailCenter} radius={200} visible={showGeofence} />
    </MapContainer>
  );
}
