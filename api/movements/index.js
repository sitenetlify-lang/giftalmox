import { requireAdmin } from '../_lib/auth.js';
import { getById, insertRow, listTable, updateRow } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { movementSchema, parseOrThrow } from '../_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, await listTable('stock_movements'));
  }
  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const body = parseOrThrow(movementSchema, await readJsonBody(req));
    const product = await getById('products', body.product_id);
    const created = await insertRow('stock_movements', {
      ...body,
      product_name: product.name,
      product_code: product.code,
      movement_date: new Date().toISOString(),
    });

    if (body.destination) {
      await updateRow('products', product.id, {
        ...product,
        location: body.destination,
      });
    }

    return sendJson(res, 201, created);
  }
  return methodNotAllowed(res, ['GET', 'POST']);
}

export default withErrorHandling(handler);
