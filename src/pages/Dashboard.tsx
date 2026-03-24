import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HealthRing from '@/components/dashboard/HealthRing';
import StatusCard from '@/components/dashboard/StatusCard';
import AlertBanner, { type Alert } from '@/components/dashboard/AlertBanner';
import { fetchPetStatus, checkOuraStatus, getAuthorizeUrl } from '@/lib/oura';
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
  const [ouraConnected, setOuraConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Check Oura connection status + fetch data on mount
  useEffect(() => {
    checkOuraStatus().then((status) => {
      setOuraConnected(status.connected && !status.expired);
      if (status.connected && !status.expired) {
        setLoading(true);
        fetchPetStatus().then((pet) => {
          if (pet.currentHeartRate !== null) setHeartRate(pet.currentHeartRate);
          if (pet.bodyTemperature !== null) setTemperature(pet.bodyTemperature);
          if (pet.activityScore !== null) setActivityScore(pet.activityScore);
          if (pet.todaySteps !== null) setSteps(pet.todaySteps);
          setLoading(false);
        });
      }
    });
  }, []);

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

      {/* Oura connection status */}
      {ouraConnected === false && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⌚</span>
              <div>
                <p className="text-sm font-medium">Connect Oura Ring</p>
                <p className="text-xs text-muted-foreground">Link real health data</p>
              </div>
            </div>
            <a href={getAuthorizeUrl()}>
              <Button size="sm">Connect</Button>
            </a>
          </CardContent>
        </Card>
      )}
      {ouraConnected === true && (
        <Badge variant="secondary" className="gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Oura Ring Connected {loading && '· Syncing...'}
        </Badge>
      )}

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
