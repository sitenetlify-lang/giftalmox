import { requireAdmin } from '../_lib/auth.js';
import { deleteRow, updateRow } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { parseOrThrow, productSchema } from '../_lib/validation.js';

async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const body = parseOrThrow(productSchema, await readJsonBody(req));
    return sendJson(res, 200, await updateRow('products', id, body));
  }
  if (req.method === 'DELETE') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    return sendJson(res, 200, await deleteRow('products', id));
  }
  return methodNotAllowed(res, ['PUT', 'DELETE']);
}

export default withErrorHandling(handler);
