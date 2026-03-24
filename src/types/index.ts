// Pet profile
export interface Pet {
  id: string;
  name: string;
  breed: string | null;
  age_years: number | null;
  photo_url: string | null;
  owner_id: string | null;
  created_at: string;
}

// Health event (synced from Oura)
export interface HealthEvent {
  id: string;
  pet_id: string;
  timestamp: string;
  heart_rate: number | null;
  body_temperature: number | null;
  activity_score: number | null;
  steps: number | null;
  sleep_stage: string | null;
  source: string;
  created_at: string;
}

// Location ping
export interface LocationPing {
  id: string;
  pet_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Feeding log
export interface FeedingLog {
  id: string;
  pet_id: string;
  fed_at: string;
  food_type: string | null;
  notes: string | null;
}

// Oura API response types
export interface OuraHeartRate {
  bpm: number;
  source: string;
  timestamp: string;
}

export interface OuraDailyActivity {
  id: string;
  day: string;
  score: number | null;
  active_calories: number;
  steps: number;
  equivalent_walking_distance: number;
  total_calories: number;
}

export interface OuraDailyReadiness {
  id: string;
  day: string;
  score: number | null;
  temperature_deviation: number | null;
  temperature_trend_deviation: number | null;
}

export interface OuraSleep {
  id: string;
  day: string;
  score: number | null;
  total_sleep_duration: number | null;
  type: string;
}

// Dashboard summary
export interface PetStatus {
  currentHeartRate: number | null;
  bodyTemperature: number | null;
  activityScore: number | null;
  todaySteps: number | null;
  sleepStage: string | null;
  lastFed: string | null;
  isResting: boolean;
}

// Hub schedule
export interface HubSchedule {
  id: string;
  pet_id: string;
  category: string;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  days: string[];     // ['mon', 'tue', ...]
  enabled: boolean;
}
