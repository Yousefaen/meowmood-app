import type {
  OuraHeartRate,
  OuraDailyActivity,
  OuraDailyReadiness,
  OuraSleep,
  PetStatus,
} from '@/types';
import {
  getMockPetStatus,
  mockDailyActivity,
  mockDailyReadiness,
  mockHeartRateData,
  mockSleepData,
} from './mockData';

const BASE_URL = 'https://api.ouraring.com/v2';

// Returns the PAT, or an empty string when the env var is not configured.
function getPat(): string {
  return import.meta.env.VITE_OURA_PAT ?? '';
}

// Shared fetch helper — throws on non-OK responses.
async function ouraFetch<T>(path: string): Promise<T> {
  const pat = getPat();
  if (!pat) throw new Error('VITE_OURA_PAT is not set');

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ─── Public API functions ────────────────────────────────────────────────────

/**
 * Fetch heart rate samples for a datetime range.
 * The Oura v2 heartrate endpoint uses start_datetime / end_datetime (ISO 8601).
 */
export async function fetchHeartRate(
  startDate: string,
  endDate: string
): Promise<OuraHeartRate[]> {
  try {
    const params = new URLSearchParams({
      start_datetime: startDate,
      end_datetime: endDate,
    });
    const data = await ouraFetch<{ data: OuraHeartRate[] }>(
      `/usercollection/heartrate?${params}`
    );
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchHeartRate fell back to mock data:', err);
    return mockHeartRateData;
  }
}

/**
 * Fetch daily activity records for a date range.
 * Uses start_date / end_date (YYYY-MM-DD).
 */
export async function fetchDailyActivity(
  startDate: string,
  endDate: string
): Promise<OuraDailyActivity[]> {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const data = await ouraFetch<{ data: OuraDailyActivity[] }>(
      `/usercollection/daily_activity?${params}`
    );
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchDailyActivity fell back to mock data:', err);
    return [mockDailyActivity];
  }
}

/**
 * Fetch daily readiness records for a date range.
 * Uses start_date / end_date (YYYY-MM-DD).
 */
export async function fetchDailyReadiness(
  startDate: string,
  endDate: string
): Promise<OuraDailyReadiness[]> {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const data = await ouraFetch<{ data: OuraDailyReadiness[] }>(
      `/usercollection/daily_readiness?${params}`
    );
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchDailyReadiness fell back to mock data:', err);
    return [mockDailyReadiness];
  }
}

/**
 * Fetch sleep session records for a date range.
 * Uses start_date / end_date (YYYY-MM-DD).
 */
export async function fetchSleep(
  startDate: string,
  endDate: string
): Promise<OuraSleep[]> {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const data = await ouraFetch<{ data: OuraSleep[] }>(
      `/usercollection/sleep?${params}`
    );
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchSleep fell back to mock data:', err);
    return [mockSleepData];
  }
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────

/**
 * Map Oura sleep score + duration into a descriptive sleep stage string.
 *
 * Logic:
 *   - No duration recorded          → "active"
 *   - Score ≥ 80 (high quality)     → "deep sleep"
 *   - Score ≥ 60 (moderate quality) → "light sleep"
 *   - Score < 60 or null            → "resting"
 */
function mapSleepStage(sleep: OuraSleep | undefined): string {
  if (!sleep || (sleep.total_sleep_duration ?? 0) === 0) return 'active';
  const score = sleep.score ?? 0;
  if (score >= 80) return 'deep sleep';
  if (score >= 60) return 'light sleep';
  return 'resting';
}

// ─── Composite function ───────────────────────────────────────────────────────

/**
 * Fetch all relevant Oura data for today and combine it into a PetStatus.
 * Falls back entirely to mock data if anything goes wrong.
 */
export async function fetchPetStatus(): Promise<PetStatus> {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Heart rate endpoint expects ISO 8601 datetimes.
    const startDatetime = `${today}T00:00:00`;
    const endDatetime = `${today}T23:59:59`;

    const [heartRates, activities, readinesses, sleeps] = await Promise.all([
      fetchHeartRate(startDatetime, endDatetime),
      fetchDailyActivity(today, today),
      fetchDailyReadiness(today, today),
      fetchSleep(today, today),
    ]);

    // Use the most recent heart rate sample (last element in the array).
    const latestHr = heartRates.length > 0
      ? heartRates[heartRates.length - 1]
      : null;

    // Use the first (and typically only) record for the day.
    const activity = activities[0] ?? null;
    const readiness = readinesses[0] ?? null;
    const sleep = sleeps[0] ?? undefined;

    // Body temperature: cat baseline 101.5 °F + Oura temperature deviation.
    const tempDeviation = readiness?.temperature_deviation ?? 0;
    const bodyTemperature = parseFloat((101.5 + tempDeviation).toFixed(2));

    return {
      currentHeartRate: latestHr?.bpm ?? null,
      bodyTemperature: readiness !== null ? bodyTemperature : null,
      activityScore: activity?.score ?? null,
      todaySteps: activity?.steps ?? null,
      sleepStage: mapSleepStage(sleep),
      lastFed: null, // Populated elsewhere (Supabase feeding logs)
      isResting: (activity?.score ?? 100) < 50,
    };
  } catch (err) {
    console.warn('[oura] fetchPetStatus fell back to mock data:', err);
    return getMockPetStatus();
  }
}
