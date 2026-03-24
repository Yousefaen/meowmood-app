import { useState } from 'react';
import type { HubSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScheduleProps {
  schedules: HubSchedule[];
  onAdd: (schedule: Omit<HubSchedule, 'id' | 'pet_id'>) => void;
  onToggle: (id: string) => void;
}

const CATEGORIES = [
  { label: '🐦 Birds', value: 'birds' },
  { label: '🐟 Fish', value: 'fish' },
  { label: '🌿 Nature', value: 'nature' },
  { label: '🐭 Mice', value: 'mice' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  birds: '🐦',
  fish: '🐟',
  nature: '🌿',
  mice: '🐭',
};

const ALL_DAYS = [
  { label: 'M', value: 'mon' },
  { label: 'T', value: 'tue' },
  { label: 'W', value: 'wed' },
  { label: 'T', value: 'thu' },
  { label: 'F', value: 'fri' },
  { label: 'S', value: 'sat' },
  { label: 'S', value: 'sun' },
];

function formatDays(days: string[]): string {
  if (days.length === 7) return 'Every day';
  return days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
}

export default function Schedule({ schedules, onAdd, onToggle }: ScheduleProps) {
  const [category, setCategory] = useState('birds');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'wed', 'fri']);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleAdd() {
    if (!startTime || !endTime || selectedDays.length === 0) return;
    onAdd({
      category,
      start_time: startTime,
      end_time: endTime,
      days: selectedDays,
      enabled: true,
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Schedule</h3>

      {/* Existing schedules */}
      <div className="space-y-2">
        {schedules.map((schedule) => (
          <Card key={schedule.id} size="sm">
            <CardContent className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl leading-none">
                  {CATEGORY_EMOJI[schedule.category] ?? '📺'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize truncate">
                    {schedule.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {schedule.start_time} – {schedule.end_time} &middot;{' '}
                    {formatDays(schedule.days)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggle(schedule.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  schedule.enabled ? 'bg-primary' : 'bg-muted'
                }`}
                role="switch"
                aria-checked={schedule.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    schedule.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add schedule form */}
      <Card size="sm">
        <CardHeader className="border-b pb-2">
          <CardTitle>Add Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                End
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Days */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Days
            </label>
            <div className="flex gap-1">
              {ALL_DAYS.map((day, i) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    key={`${day.value}-${i}`}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={selectedDays.length === 0}
          >
            Add Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
