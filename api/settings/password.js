import bcrypt from 'bcryptjs';
import { requireAdmin } from '../_lib/auth.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { ensureSettingsExists } from '../_lib/settings.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { parseOrThrow, passwordSchema } from '../_lib/validation.js';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return methodNotAllowed(res, ['PUT']);
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const body = parseOrThrow(passwordSchema, await readJsonBody(req));
  const settings = await ensureSettingsExists();

  const matches = await bcrypt.compare(body.currentPassword, settings.admin_password);
  if (!matches) {
    return sendJson(res, 401, { error: 'Senha atual incorreta' });
  }

  const newHash = await bcrypt.hash(body.newPassword, 10);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('settings')
    .update({ admin_password: newHash })
    .eq('id', settings.id);

  if (error) throw error;
  return sendJson(res, 200, { success: true });
}

export default withErrorHandling(handler);
