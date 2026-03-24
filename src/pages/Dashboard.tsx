import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import HealthRing from '@/components/dashboard/HealthRing';
import StatusCard from '@/components/dashboard/StatusCard';
import AlertBanner, { type Alert } from '@/components/dashboard/AlertBanner';
import type { PetStatus } from '@/types';

interface MetricCard {
  label: string;
  icon: string;
  value: number;
  unit: string;
  max: number;
  color: string;
  colorVar: string;
}

export default function Dashboard() {
  const [heartRate, setHeartRate] = useState(78);
  const [temperature, setTemperature] = useState(101.8);
  const [activityScore, setActivityScore] = useState(72);
  const [steps, setSteps] = useState(4823);

  // Suppress unused-variable warnings for setters that will be wired up later
  void setHeartRate;
  void setTemperature;
  void setActivityScore;
  void setSteps;

  const petStatus: PetStatus = {
    currentHeartRate: heartRate,
    bodyTemperature: temperature,
    activityScore: activityScore,
    todaySteps: steps,
    sleepStage: 'awake',
    lastFed: '3h ago',
    isResting: true,
  };

  const alerts: Alert[] = [
    ...(heartRate > 150
      ? [
          {
            id: 'hr-high',
            message: `Heart rate is elevated at ${heartRate} bpm`,
            severity: 'warning' as const,
          },
        ]
      : []),
    ...(temperature > 103
      ? [
          {
            id: 'temp-high',
            message: `Temperature is high at ${temperature}°F`,
            severity: 'critical' as const,
          },
        ]
      : []),
  ];

  const metrics: MetricCard[] = [
    {
      label: 'Heart Rate',
      icon: '❤️',
      value: heartRate,
      unit: 'bpm',
      max: 200,
      color: 'var(--meow-pink)',
      colorVar: 'meow-pink',
    },
    {
      label: 'Temperature',
      icon: '🌡️',
      value: temperature,
      unit: '°F',
      max: 106,
      color: 'var(--meow-orange)',
      colorVar: 'meow-orange',
    },
    {
      label: 'Activity',
      icon: '⚡',
      value: activityScore,
      unit: '/100',
      max: 100,
      color: 'var(--meow-green)',
      colorVar: 'meow-green',
    },
    {
      label: 'Steps',
      icon: '🐾',
      value: steps,
      unit: 'steps',
      max: 8000,
      color: 'var(--meow-blue)',
      colorVar: 'meow-blue',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Pet header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl ring-2 ring-foreground/10">
          🐱
        </div>
        <div>
          <h2 className="text-xl font-semibold leading-none">Luna</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live health overview</p>
        </div>
      </div>

      {/* Alert banner — only shown when alerts exist */}
      <AlertBanner alerts={alerts} />

      {/* Status summary card */}
      <StatusCard petName="Luna" status={petStatus} />

      {/* Metric cards 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardContent className="flex flex-col items-center gap-2 py-2">
              <div className="flex items-center gap-1.5 self-start w-full">
                <span className="text-base leading-none" aria-hidden="true">
                  {metric.icon}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{metric.label}</span>
              </div>
              <HealthRing
                value={metric.value}
                max={metric.max}
                label={metric.unit}
                unit={metric.unit}
                color={metric.color}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
