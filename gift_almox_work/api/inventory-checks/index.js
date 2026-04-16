import { requireAdmin } from '../_lib/auth.js';
import { getById, insertRow, listTable } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { inventoryCheckSchema, parseOrThrow } from '../_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, await listTable('inventory_checks'));
  }
  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const body = parseOrThrow(inventoryCheckSchema, await readJsonBody(req));
    const product = await getById('products', body.product_id);
    const created = await insertRow('inventory_checks', {
      ...body,
      product_name: product.name,
      product_code: product.code,
      system_quantity: Number(product.current_stock || 0),
      difference: Number(body.physical_quantity) - Number(product.current_stock || 0),
      adjusted: false,
      check_date: new Date().toISOString(),
    });

    return sendJson(res, 201, created);
  }
  return methodNotAllowed(res, ['GET', 'POST']);
}

export default withErrorHandling(handler);
