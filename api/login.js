import bcrypt from 'bcryptjs';
import { clearAuthCookie, setAuthCookie, signAdminToken } from './_lib/auth.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from './_lib/http.js';
import { ensureSettingsExists } from './_lib/settings.js';
import { loginSchema, parseOrThrow } from './_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const body = parseOrThrow(loginSchema, await readJsonBody(req));
    const settings = await ensureSettingsExists();
    const matches = await bcrypt.compare(body.password, settings.admin_password);

    if (!matches) {
      clearAuthCookie(res);
      return sendJson(res, 401, { error: 'Senha inválida' });
    }

    const token = await signAdminToken({ role: 'admin', settingsId: settings.id });
    setAuthCookie(res, token);
    return sendJson(res, 200, { success: true });
  }

  if (req.method === 'DELETE') {
    clearAuthCookie(res);
    return sendJson(res, 200, { success: true });
  }

  return methodNotAllowed(res, ['POST', 'DELETE']);
}

export default withErrorHandling(handler);
