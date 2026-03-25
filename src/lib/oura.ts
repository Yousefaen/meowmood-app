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

/**
 * Fetch data from our Vercel API proxy (which holds the OAuth token server-side).
 * Falls back to mock data when running locally without the proxy.
 */
async function ouraProxy<T>(endpoint: string, start: string, end: string): Promise<T> {
  const params = new URLSearchParams({ endpoint, start, end });
  const res = await fetch(`/api/oura/data?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Proxy error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Check if the Oura ring is connected (token exists on server).
 */
export async function checkOuraStatus(): Promise<{ connected: boolean; expired?: boolean }> {
  try {
    const res = await fetch('/api/oura/status');
    return await res.json();
  } catch {
    return { connected: false };
  }
}

/**
 * Get the URL to start the OAuth authorization flow.
 */
export function getAuthorizeUrl(): string {
  return '/api/oura/authorize';
}

// ─── Public API functions ────────────────────────────────────────────────────

export async function fetchHeartRate(
  startDate: string,
  endDate: string
): Promise<OuraHeartRate[]> {
  try {
    const data = await ouraProxy<{ data: OuraHeartRate[] }>('heartrate', startDate, endDate);
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchHeartRate fell back to mock data:', err);
    return mockHeartRateData;
  }
}

export async function fetchDailyActivity(
  startDate: string,
  endDate: string
): Promise<OuraDailyActivity[]> {
  try {
    const data = await ouraProxy<{ data: OuraDailyActivity[] }>('daily_activity', startDate, endDate);
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchDailyActivity fell back to mock data:', err);
    return [mockDailyActivity];
  }
}

export async function fetchDailyReadiness(
  startDate: string,
  endDate: string
): Promise<OuraDailyReadiness[]> {
  try {
    const data = await ouraProxy<{ data: OuraDailyReadiness[] }>('daily_readiness', startDate, endDate);
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchDailyReadiness fell back to mock data:', err);
    return [mockDailyReadiness];
  }
}

export async function fetchSleep(
  startDate: string,
  endDate: string
): Promise<OuraSleep[]> {
  try {
    const data = await ouraProxy<{ data: OuraSleep[] }>('sleep', startDate, endDate);
    return data.data;
  } catch (err) {
    console.warn('[oura] fetchSleep fell back to mock data:', err);
    return [mockSleepData];
  }
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────

function mapSleepStage(sleep: OuraSleep | undefined): string {
  if (!sleep || (sleep.total_sleep_duration ?? 0) === 0) return 'active';
  const score = sleep.score ?? 0;
  if (score >= 80) return 'deep sleep';
  if (score >= 60) return 'light sleep';
  return 'resting';
}

// ─── Composite function ───────────────────────────────────────────────────────

export async function fetchPetStatus(): Promise<PetStatus> {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Query the last 3 days so we always get data even if today isn't finalized yet
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const startStr = threeDaysAgo.toISOString().split('T')[0];

    // Heart rate: query today only (intraday data is available in near-real-time)
    const startDatetime = `${todayStr}T00:00:00`;
    const endDatetime = `${todayStr}T23:59:59`;

    const [heartRates, activities, readinesses, sleeps] = await Promise.all([
      fetchHeartRate(startDatetime, endDatetime),
      fetchDailyActivity(startStr, todayStr),
      fetchDailyReadiness(startStr, todayStr),
      fetchSleep(startStr, todayStr),
    ]);

    // Heart rate: use the most recent sample
    const latestHr = heartRates.length > 0
      ? heartRates[heartRates.length - 1]
      : null;

    // Daily summaries: use the most recent entry (last in the array = most recent day)
    const activity = activities.length > 0 ? activities[activities.length - 1] : null;
    const readiness = readinesses.length > 0 ? readinesses[readinesses.length - 1] : null;
    const sleep = sleeps.length > 0 ? sleeps[sleeps.length - 1] : undefined;

    const tempDeviation = readiness?.temperature_deviation ?? 0;
    const bodyTemperature = parseFloat((101.5 + tempDeviation).toFixed(2));

    return {
      currentHeartRate: latestHr?.bpm ?? null,
      bodyTemperature: readiness !== null ? bodyTemperature : null,
      activityScore: activity?.score ?? null,
      todaySteps: activity?.steps ?? null,
      sleepStage: mapSleepStage(sleep),
      lastFed: null,
      isResting: (activity?.score ?? 100) < 50,
    };
  } catch (err) {
    console.warn('[oura] fetchPetStatus fell back to mock data:', err);
    return getMockPetStatus();
  }
}
