import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/oura/data?endpoint=heartrate&start=...&end=...
 * Proxies Oura API calls using the stored OAuth token.
 * Automatically refreshes the token if expired.
 *
 * Supported endpoints: heartrate, daily_activity, daily_readiness, sleep
 */

const ALLOWED_ENDPOINTS: Record<string, string> = {
  heartrate: '/v2/usercollection/heartrate',
  daily_activity: '/v2/usercollection/daily_activity',
  daily_readiness: '/v2/usercollection/daily_readiness',
  sleep: '/v2/usercollection/sleep',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

async function getToken(): Promise<{ access_token: string; refresh_token: string; expires_at: string } | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('oura_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('id', 'default')
    .single();

  if (error || !data) return null;
  return data;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.OURA_CLIENT_ID!;
  const clientSecret = process.env.OURA_CLIENT_SECRET!;

  const res = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    console.error('Token refresh failed:', await res.text());
    return null;
  }

  const tokenData = await res.json();
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  const supabase = getSupabase();
  await supabase.from('oura_tokens').upsert(
    {
      id: 'default',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  return tokenData.access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const endpoint = req.query.endpoint as string;
  const start = req.query.start as string;
  const end = req.query.end as string;

  if (!endpoint || !ALLOWED_ENDPOINTS[endpoint]) {
    return res.status(400).json({ error: `Invalid endpoint. Allowed: ${Object.keys(ALLOWED_ENDPOINTS).join(', ')}` });
  }

  // Get stored token
  const token = await getToken();
  if (!token) {
    return res.status(401).json({ error: 'not_connected', message: 'Oura ring not connected. Please authorize first.' });
  }

  // Refresh if expired
  let accessToken = token.access_token;
  if (new Date(token.expires_at) <= new Date()) {
    const refreshed = await refreshAccessToken(token.refresh_token);
    if (!refreshed) {
      return res.status(401).json({ error: 'token_expired', message: 'Token expired and refresh failed. Please re-authorize.' });
    }
    accessToken = refreshed;
  }

  // Build Oura API URL
  const ouraPath = ALLOWED_ENDPOINTS[endpoint];
  const params = new URLSearchParams();

  if (endpoint === 'heartrate') {
    if (start) params.set('start_datetime', start);
    if (end) params.set('end_datetime', end);
  } else {
    if (start) params.set('start_date', start);
    if (end) params.set('end_date', end);
  }

  const ouraUrl = `https://api.ouraring.com${ouraPath}?${params}`;

  const ouraRes = await fetch(ouraUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!ouraRes.ok) {
    const errText = await ouraRes.text();
    console.error(`Oura API error (${ouraRes.status}):`, errText);
    return res.status(ouraRes.status).json({ error: 'Oura API error', details: errText });
  }

  const data = await ouraRes.json();
  return res.status(200).json(data);
}
