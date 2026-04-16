import { requireAdmin } from './_lib/auth.js';
import { methodNotAllowed, sendJson, withErrorHandling } from './_lib/http.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  return sendJson(res, 200, { authenticated: true, role: admin.role });
}

export default withErrorHandling(handler);
