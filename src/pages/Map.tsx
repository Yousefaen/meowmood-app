import { useState } from 'react';
import PetMap, { mockTrail, trailCenter } from '@/components/map/PetMap';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const lastPing = mockTrail[mockTrail.length - 1];

export default function Map() {
  const [showGeofence, setShowGeofence] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      {/* Map */}
      <div className="h-[60vh] rounded-lg overflow-hidden">
        <PetMap showGeofence={showGeofence} />
      </div>

      {/* Info + controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Last seen card */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Last Seen Location</CardTitle>
            <CardDescription>Most recent GPS ping from Luna's tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Coordinates</span>
                <span className="font-mono font-medium">
                  {lastPing[0].toFixed(4)}, {lastPing[1].toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Last update</span>
                <span className="font-medium">5 min ago</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Safe zone center</span>
                <span className="font-mono font-medium">
                  {trailCenter[0].toFixed(4)}, {trailCenter[1].toFixed(4)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geofence toggle card */}
        <Card className="sm:w-56">
          <CardHeader>
            <CardTitle>Safe Zone</CardTitle>
            <CardDescription>200 m radius around home</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setShowGeofence((prev) => !prev)}
              className={[
                'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                showGeofence
                  ? 'bg-[--meow-purple] text-white hover:opacity-90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              ].join(' ')}
            >
              {showGeofence ? 'Hide Geofence' : 'Show Geofence'}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
