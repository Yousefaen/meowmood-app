import type {
  OuraHeartRate,
  OuraDailyActivity,
  OuraDailyReadiness,
  OuraSleep,
  PetStatus,
} from '@/types';

// Build today's date string (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// 24 heart rate samples — one per hour starting at midnight today.
// Values vary realistically: lower at night/rest, higher during the day.
const BPM_BY_HOUR: number[] = [
  62, 60, 61, 63, 64, 67,   // 00:00–05:00 — deep sleep / waking
  72, 78, 85, 88, 90, 92,   // 06:00–11:00 — morning ramp-up
  95, 98, 96, 94, 91, 88,   // 12:00–17:00 — afternoon activity
  82, 78, 74, 70, 66, 63,   // 18:00–23:00 — evening wind-down
];

export const mockHeartRateData: OuraHeartRate[] = BPM_BY_HOUR.map(
  (bpm, hour) => ({
    bpm,
    source: 'ppg',
    timestamp: `${today}T${String(hour).padStart(2, '0')}:00:00+00:00`,
  })
);

export const mockDailyActivity: OuraDailyActivity = {
  id: 'mock-activity-001',
  day: today,
  score: 75,
  active_calories: 320,
  steps: 5024,
  equivalent_walking_distance: 3850,
  total_calories: 1980,
};

export const mockDailyReadiness: OuraDailyReadiness = {
  id: 'mock-readiness-001',
  day: today,
  score: 80,
  temperature_deviation: 0.3,
  temperature_trend_deviation: 0.1,
};

export const mockSleepData: OuraSleep = {
  id: 'mock-sleep-001',
  day: today,
  score: 85,
  total_sleep_duration: 28800, // 8 hours in seconds
  type: 'long_sleep',
};

// Derive sleep stage from mock sleep data using the same logic as the live path.
function deriveSleepStage(sleep: OuraSleep): string {
  const duration = sleep.total_sleep_duration ?? 0;
  const score = sleep.score ?? 0;
  if (duration === 0) return 'active';
  if (score >= 80) return 'deep sleep';
  if (score >= 60) return 'light sleep';
  return 'resting';
}

export function getMockPetStatus(): PetStatus {
  const latestHr = mockHeartRateData[mockHeartRateData.length - 1];
  const tempDeviation = mockDailyReadiness.temperature_deviation ?? 0;

  return {
    currentHeartRate: latestHr.bpm,
    bodyTemperature: parseFloat((101.5 + tempDeviation).toFixed(2)),
    activityScore: mockDailyActivity.score,
    todaySteps: mockDailyActivity.steps,
    sleepStage: deriveSleepStage(mockSleepData),
    lastFed: null,
    isResting: mockDailyActivity.score !== null && mockDailyActivity.score < 50,
  };
}
