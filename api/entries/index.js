import { requireAdmin } from '../_lib/auth.js';
import { getById, insertRow, listTable, updateRow } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { parseOrThrow, entrySchema } from '../_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, await listTable('stock_entries'));
  }
  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const body = parseOrThrow(entrySchema, await readJsonBody(req));
    const product = await getById('products', body.product_id);
    const created = await insertRow('stock_entries', {
      ...body,
      product_name: product.name,
      product_code: product.code,
      total_cost: Number(body.quantity) * Number(body.unit_cost || 0),
      entry_date: new Date().toISOString(),
    });

    await updateRow('products', product.id, {
      ...product,
      current_stock: Number(product.current_stock || 0) + Number(body.quantity),
    });

    return sendJson(res, 201, created);
  }
  return methodNotAllowed(res, ['GET', 'POST']);
}

export default withErrorHandling(handler);
