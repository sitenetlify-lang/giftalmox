import { requireAdmin } from '../_lib/auth.js';
import { insertRow, listTable } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { parseOrThrow, productSchema } from '../_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, await listTable('products'));
  }
  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const body = parseOrThrow(productSchema, await readJsonBody(req));
    return sendJson(res, 201, await insertRow('products', body));
  }
  return methodNotAllowed(res, ['GET', 'POST']);
}

export default withErrorHandling(handler);
