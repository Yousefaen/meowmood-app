import { useState } from 'react';
import type { HubSchedule } from '@/types';
import VideoPlayer from '@/components/hub/VideoPlayer';
import Schedule from '@/components/hub/Schedule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import erbaoPreview from '@/assets/erbao-preview.jpeg';

const CATEGORIES = [
  { label: '🐦 Birds', value: 'birds', videoId: 'xbs7FT7dXYc' },
  { label: '🐟 Fish', value: 'fish', videoId: 'JW6SzmD7gDY' },
  { label: '🌿 Nature', value: 'nature', videoId: 'rLEJHfB8eDM' },
  { label: '🐭 Mice', value: 'mice', videoId: '95maVtfeJIw' },
];

const DEMO_SCHEDULES: HubSchedule[] = [
  {
    id: 'demo-1',
    pet_id: 'demo-pet',
    category: 'birds',
    start_time: '09:00',
    end_time: '11:00',
    days: ['mon', 'wed', 'fri'],
    enabled: true,
  },
  {
    id: 'demo-2',
    pet_id: 'demo-pet',
    category: 'nature',
    start_time: '14:00',
    end_time: '16:00',
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    enabled: true,
  },
];

export default function HubControl() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [schedules, setSchedules] = useState<HubSchedule[]>(DEMO_SCHEDULES);

  function handleAddSchedule(schedule: Omit<HubSchedule, 'id' | 'pet_id'>) {
    const newSchedule: HubSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}`,
      pet_id: 'demo-pet',
    };
    setSchedules((prev) => [...prev, newSchedule]);
  }

  function handleToggleSchedule(id: string) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">📺</span>
        <h2 className="text-xl font-semibold">Cat TV</h2>
      </div>

      {/* Video Player */}
      <VideoPlayer videoId={activeCategory.videoId} />

      {/* Category selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = cat.value === activeCategory.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Schedule section */}
      <Schedule
        schedules={schedules}
        onAdd={handleAddSchedule}
        onToggle={handleToggleSchedule}
      />

      {/* Video Call placeholder */}
      <Card>
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Video Call</CardTitle>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <div className="relative w-full rounded-lg overflow-hidden">
            <img
              src={erbaoPreview}
              alt="Erbao on cat monitor"
              className="w-full h-48 object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-7 text-foreground"
                >
                  <path d="m15 10 4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14" />
                  <rect x="3" y="6" width="12" height="12" rx="2" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Video call Erbao remotely — coming in a future update.
          </p>
          <Button disabled>Start Call</Button>
        </CardContent>
      </Card>
    </div>
  );
}
