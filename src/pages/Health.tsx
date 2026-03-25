import { useState, useEffect } from 'react';
import HealthChart, { type DataPoint } from '@/components/health/HealthChart';
import TimeToggle, { type TimeRange } from '@/components/health/TimeToggle';
import { Badge } from '@/components/ui/badge';
import {
  fetchHeartRate,
  fetchDailyActivity,
  fetchDailyReadiness,
  checkOuraStatus,
} from '@/lib/oura';
import type { OuraHeartRate, OuraDailyActivity, OuraDailyReadiness } from '@/types';

// ---------------------------------------------------------------------------
// Helpers to transform Oura data into chart-ready DataPoints
// ---------------------------------------------------------------------------

function hrToDataPoints(samples: OuraHeartRate[]): DataPoint[] {
  if (samples.length === 0) return [];

  // Group by hour, take the average per hour
  const byHour: Record<number, number[]> = {};
  for (const s of samples) {
    const hour = new Date(s.timestamp).getHours();
    if (!byHour[hour]) byHour[hour] = [];
    byHour[hour].push(s.bpm);
  }

  return Object.entries(byHour)
    .map(([h, bpms]) => {
      const hour = Number(h);
      const avg = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);
      const label = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
      return { time: label, value: avg, _hour: hour };
    })
    .sort((a, b) => a._hour - b._hour)
    .map(({ time, value }) => ({ time, value }));
}

function dailyActivityToPoints(data: OuraDailyActivity[], metric: 'steps' | 'score'): DataPoint[] {
  return data.map((d) => {
    const date = new Date(d.day + 'T00:00:00');
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { time: label, value: metric === 'steps' ? d.steps : (d.score ?? 0) };
  });
}

function dailyReadinessToTempPoints(data: OuraDailyReadiness[]): DataPoint[] {
  return data.map((d) => {
    const date = new Date(d.day + 'T00:00:00');
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const temp = parseFloat((101.5 + (d.temperature_deviation ?? 0)).toFixed(1));
    return { time: label, value: temp };
  });
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

function getDateRange(range: TimeRange): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  const startDate = new Date(now);

  if (range === '24h') startDate.setDate(startDate.getDate() - 1);
  else if (range === '7d') startDate.setDate(startDate.getDate() - 7);
  else startDate.setDate(startDate.getDate() - 30);

  return { start: startDate.toISOString().split('T')[0], end };
}

// ---------------------------------------------------------------------------
// Fallback mock data (used when Oura is not connected)
// ---------------------------------------------------------------------------

const HOURS_24 = Array.from({ length: 24 }, (_, i) => {
  const h = i;
  return h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
});

const mockHr24: DataPoint[] = HOURS_24.map((time, i) => ({
  time,
  value: i < 6 ? Math.round(55 + Math.random() * 8) : i < 14 ? Math.round(80 + Math.random() * 20) : Math.round(65 + Math.random() * 10),
}));

const mockTemp24: DataPoint[] = HOURS_24.map((time, i) => ({
  time,
  value: parseFloat((101.0 + Math.sin((i / 24) * Math.PI * 2) * 0.6 + (Math.random() - 0.5) * 0.3).toFixed(1)),
}));

const mockSteps24: DataPoint[] = HOURS_24.map((time, i) => ({
  time,
  value: i < 6 ? Math.round(Math.random() * 20) : i < 13 ? Math.round(150 + Math.random() * 200) : Math.round(50 + Math.random() * 80),
}));

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Health() {
  const [range, setRange] = useState<TimeRange>('24h');
  const [heartRateData, setHeartRateData] = useState<DataPoint[]>(mockHr24);
  const [temperatureData, setTemperatureData] = useState<DataPoint[]>(mockTemp24);
  const [stepsData, setStepsData] = useState<DataPoint[]>(mockSteps24);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const status = await checkOuraStatus();
      if (!status.connected || status.expired) {
        setIsLive(false);
        return;
      }

      setLoading(true);
      const { start, end } = getDateRange(range);

      try {
        if (range === '24h') {
          // Intraday heart rate for today
          const todayStr = new Date().toISOString().split('T')[0];
          const [hrSamples, activities, readinesses] = await Promise.all([
            fetchHeartRate(`${todayStr}T00:00:00`, `${todayStr}T23:59:59`),
            fetchDailyActivity(start, end),
            fetchDailyReadiness(start, end),
          ]);

          if (cancelled) return;

          const hrPoints = hrToDataPoints(hrSamples);
          if (hrPoints.length > 0) setHeartRateData(hrPoints);

          // For 24h, temp and steps are daily summaries (1-2 points)
          // Show them as the latest value across the day
          const tempPoints = dailyReadinessToTempPoints(readinesses);
          if (tempPoints.length > 0) setTemperatureData(tempPoints);

          const stepPoints = dailyActivityToPoints(activities, 'steps');
          if (stepPoints.length > 0) setStepsData(stepPoints);
        } else {
          // 7d / 30d: all daily summaries
          const [activities, readinesses] = await Promise.all([
            fetchDailyActivity(start, end),
            fetchDailyReadiness(start, end),
          ]);

          if (cancelled) return;

          // Average HR per day from daily activity (Oura doesn't give intraday for past days easily)
          // Use activity score as a proxy for HR trend, or fetch HR per day
          // For now: fetch heart rate for the range and bucket by day
          const hrSamples = await fetchHeartRate(`${start}T00:00:00`, `${end}T23:59:59`);
          const hrByDay: Record<string, number[]> = {};
          for (const s of hrSamples) {
            const day = s.timestamp.split('T')[0];
            if (!hrByDay[day]) hrByDay[day] = [];
            hrByDay[day].push(s.bpm);
          }
          const hrPoints: DataPoint[] = Object.entries(hrByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, bpms]) => {
              const date = new Date(day + 'T00:00:00');
              const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return { time: label, value: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) };
            });

          if (hrPoints.length > 0) setHeartRateData(hrPoints);

          const tempPoints = dailyReadinessToTempPoints(readinesses);
          if (tempPoints.length > 0) setTemperatureData(tempPoints);

          const stepPoints = dailyActivityToPoints(activities, 'steps');
          if (stepPoints.length > 0) setStepsData(stepPoints);
        }

        if (!cancelled) setIsLive(true);
      } catch (err) {
        console.warn('[health] Failed to load Oura data, using mock:', err);
        if (!cancelled) setIsLive(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [range]);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Health</h2>
          {isLive && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Live
            </Badge>
          )}
          {loading && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>
        <TimeToggle value={range} onChange={setRange} />
      </div>

      {/* Charts */}
      <HealthChart
        title="Heart Rate"
        unit="bpm"
        data={heartRateData}
        color="var(--meow-pink)"
        domain={[40, 160]}
      />

      <HealthChart
        title="Temperature"
        unit="°F"
        data={temperatureData}
        color="var(--meow-orange)"
        domain={[99, 104]}
      />

      <HealthChart
        title="Steps"
        unit="steps"
        data={stepsData}
        color="var(--meow-blue)"
      />
    </div>
  );
}
