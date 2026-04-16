import { requireAdmin } from './_lib/auth.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from './_lib/http.js';
import { ensureSettingsExists, getSettings, sanitizePublicSettings } from './_lib/settings.js';
import { getSupabaseAdmin } from './_lib/supabase.js';
import { parseOrThrow, settingsSchema } from './_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    const settings = await ensureSettingsExists();
    return sendJson(res, 200, sanitizePublicSettings(settings));
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const body = parseOrThrow(settingsSchema, await readJsonBody(req));
    const current = await ensureSettingsExists();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('settings')
      .update(body)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return sendJson(res, 200, sanitizePublicSettings(data));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}

export default withErrorHandling(handler);
