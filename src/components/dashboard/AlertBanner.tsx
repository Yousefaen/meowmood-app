interface Alert {
  id: string;
  message: string;
  severity: 'warning' | 'critical';
}

interface AlertBannerProps {
  alerts: Alert[];
}

export type { Alert };

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  const hasCritical = alerts.some((a) => a.severity === 'critical');

  return (
    <div
      className="rounded-xl px-4 py-3 flex gap-3 items-start text-sm ring-1"
      style={
        hasCritical
          ? {
              backgroundColor: 'oklch(0.577 0.245 27.325 / 0.1)',
              color: 'oklch(0.577 0.245 27.325)',
              borderColor: 'oklch(0.577 0.245 27.325 / 0.3)',
            }
          : {
              backgroundColor: 'oklch(0.7 0.15 60 / 0.1)',
              color: 'oklch(0.55 0.15 60)',
              borderColor: 'oklch(0.7 0.15 60 / 0.4)',
            }
      }
    >
      <span className="text-base leading-none mt-0.5" aria-hidden="true">
        {hasCritical ? '🚨' : '⚠️'}
      </span>
      <div className="flex flex-col gap-1">
        {alerts.map((alert) => (
          <p key={alert.id} className="leading-snug">
            {alert.message}
          </p>
        ))}
      </div>
    </div>
  );
}
