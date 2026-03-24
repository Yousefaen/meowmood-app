export type TimeRange = '24h' | '7d' | '30d';

interface TimeToggleProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

export default function TimeToggle({ value, onChange }: TimeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-0.5 gap-0.5">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-card text-foreground ring-1 ring-foreground/10 shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
