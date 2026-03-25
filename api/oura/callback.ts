import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/oura/callback?code=...
 * Exchanges the authorization code for an access token,
 * stores it in Supabase, and redirects back to the app.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string | undefined;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const clientId = process.env.OURA_CLIENT_ID!;
  const clientSecret = process.env.OURA_CLIENT_SECRET!;
  const redirectUri = process.env.OURA_REDIRECT_URI!;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const appUrl = process.env.APP_URL || 'https://meowmood-app.vercel.app';

  // Exchange code for token
  const tokenRes = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error('Token exchange failed:', err);
    return res.status(502).json({ error: 'Token exchange failed', details: err });
  }

  const tokenData = await tokenRes.json();
  const { access_token, refresh_token, expires_in } = tokenData;

  // Store in Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  const { error: dbError } = await supabase
    .from('oura_tokens')
    .upsert(
      {
        id: 'default',
        access_token,
        refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (dbError) {
    console.error('Failed to store token:', JSON.stringify(dbError));
    return res.status(500).json({
      error: 'Failed to store token',
      details: dbError.message,
      hint: dbError.hint || null,
      code: dbError.code || null,
      supabase_url_set: !!supabaseUrl,
      service_key_set: !!supabaseKey,
    });
  }

  // Redirect back to app
  return res.redirect(302, `${appUrl}/?oura=connected`);
}
