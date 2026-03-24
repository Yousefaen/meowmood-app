import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/oura/status
 * Returns whether the Oura ring is connected (token exists and is valid).
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ connected: false });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('oura_tokens')
    .select('expires_at')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    return res.status(200).json({ connected: false });
  }

  const expired = new Date(data.expires_at) <= new Date();
  return res.status(200).json({ connected: true, expired });
}
