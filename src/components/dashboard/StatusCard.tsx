import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PetStatus } from '@/types';

interface StatusCardProps {
  petName: string;
  status: PetStatus;
}

export default function StatusCard({ petName, status }: StatusCardProps) {
  const { isResting, lastFed, bodyTemperature } = status;

  const stateLabel = isResting ? 'resting' : 'active';

  const formatLastFed = (lastFed: string | null) => {
    if (!lastFed) return 'unknown';
    return `last fed ${lastFed}`;
  };

  const formatTemp = (temp: number | null) => {
    if (temp == null) return null;
    return `${temp}°F`;
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{petName}</span>
          <span className="text-muted-foreground text-sm">is</span>
          <Badge variant="secondary" className="text-xs">
            {stateLabel}
          </Badge>
          {lastFed && (
            <>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{formatLastFed(lastFed)}</span>
            </>
          )}
          {bodyTemperature != null && (
            <>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-medium" style={{ color: 'var(--meow-orange)' }}>
                {formatTemp(bodyTemperature)}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
