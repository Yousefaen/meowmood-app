import { useState } from 'react';
import HealthChart, { type DataPoint } from '@/components/health/HealthChart';
import TimeToggle, { type TimeRange } from '@/components/health/TimeToggle';

// ---------------------------------------------------------------------------
// Mock data generators
// ---------------------------------------------------------------------------

const HOURS_24 = Array.from({ length: 24 }, (_, i) => {
  const h = i;
  const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
  return label;
});

const mock24hHeartRate: DataPoint[] = HOURS_24.map((time, i) => ({
  time,
  // Luna rests at night (~55 bpm), active mid-morning and afternoon (~90-110 bpm)
  value:
    i < 6
      ? Math.round(55 + Math.random() * 8)
      : i < 10
        ? Math.round(75 + i * 2 + Math.random() * 10)
        : i < 14
          ? Math.round(90 + Math.random() * 20)
          : i < 18
            ? Math.round(80 + Math.random() * 15)
            : Math.round(60 + Math.random() * 10),
}));

const mock24hTemperature: DataPoint[] = HOURS_24.map((time, i) => ({
  time,
  // Cat body temp floats 100.5–102.5°F; slightly lower at night
  value: parseFloat(
    (
      101.0 +
      Math.sin((i / 24) * Math.PI * 2) * 0.6 +
      (Math.random() - 0.5) * 0.3
    ).toFixed(1)
  ),
}));

const mock24hSteps: DataPoint[] = HOURS_24.map((time, i) => ({
  time,
  // Cumulative-like step count, low at night, bursts during day
  value:
    i < 6
      ? Math.round(Math.random() * 20)
      : i < 9
        ? Math.round(50 + Math.random() * 80)
        : i < 13
          ? Math.round(150 + Math.random() * 200)
          : i < 17
            ? Math.round(180 + Math.random() * 250)
            : Math.round(30 + Math.random() * 60),
}));

// 7-day data — one point per day
const DAYS_7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const mock7dHeartRate: DataPoint[] = DAYS_7.map((time) => ({
  time,
  value: Math.round(72 + Math.random() * 20),
}));

const mock7dTemperature: DataPoint[] = DAYS_7.map((time) => ({
  time,
  value: parseFloat((101.0 + (Math.random() - 0.4) * 1.2).toFixed(1)),
}));

const mock7dSteps: DataPoint[] = DAYS_7.map((time) => ({
  time,
  value: Math.round(3000 + Math.random() * 4000),
}));

// 30-day data — one point per day (abbreviated labels)
const mock30dHeartRate: DataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  time: `D${i + 1}`,
  value: Math.round(72 + Math.random() * 22),
}));

const mock30dTemperature: DataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  time: `D${i + 1}`,
  value: parseFloat((101.0 + (Math.random() - 0.4) * 1.4).toFixed(1)),
}));

const mock30dSteps: DataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  time: `D${i + 1}`,
  value: Math.round(2500 + Math.random() * 5500),
}));

// ---------------------------------------------------------------------------
// Data map
// ---------------------------------------------------------------------------

const DATA_MAP: Record<
  TimeRange,
  { heartRate: DataPoint[]; temperature: DataPoint[]; steps: DataPoint[] }
> = {
  '24h': {
    heartRate: mock24hHeartRate,
    temperature: mock24hTemperature,
    steps: mock24hSteps,
  },
  '7d': {
    heartRate: mock7dHeartRate,
    temperature: mock7dTemperature,
    steps: mock7dSteps,
  },
  '30d': {
    heartRate: mock30dHeartRate,
    temperature: mock30dTemperature,
    steps: mock30dSteps,
  },
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Health() {
  const [range, setRange] = useState<TimeRange>('24h');

  const { heartRate, temperature, steps } = DATA_MAP[range];

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Health</h2>
        <TimeToggle value={range} onChange={setRange} />
      </div>

      {/* Charts */}
      <HealthChart
        title="Heart Rate"
        unit="bpm"
        data={heartRate}
        color="var(--meow-pink)"
        domain={[40, 160]}
      />

      <HealthChart
        title="Temperature"
        unit="°F"
        data={temperature}
        color="var(--meow-orange)"
        domain={[99, 104]}
      />

      <HealthChart
        title="Steps"
        unit="steps"
        data={steps}
        color="var(--meow-blue)"
      />
    </div>
  );
}
