import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/oura/authorize
 * Redirects the user to the Oura OAuth2 authorization page.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.OURA_CLIENT_ID;
  const redirectUri = process.env.OURA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'OAuth config missing on server' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'heartrate daily personal',
    state: crypto.randomUUID(),
  });

  const authUrl = `https://cloud.ouraring.com/oauth/authorize?${params}`;
  return res.redirect(302, authUrl);
}
