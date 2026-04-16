import { requireAdmin } from '../_lib/auth.js';
import { getById, insertRow, listTable, updateRow } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';
import { exitSchema, parseOrThrow } from '../_lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, await listTable('stock_exits'));
  }
  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const body = parseOrThrow(exitSchema, await readJsonBody(req));
    const product = await getById('products', body.product_id);
    if (Number(body.quantity) > Number(product.current_stock || 0)) {
      return sendJson(res, 400, { error: 'Estoque insuficiente para esta saída' });
    }

    const created = await insertRow('stock_exits', {
      ...body,
      product_name: product.name,
      product_code: product.code,
      exit_date: new Date().toISOString(),
    });

    await updateRow('products', product.id, {
      ...product,
      current_stock: Number(product.current_stock || 0) - Number(body.quantity),
    });

    return sendJson(res, 201, created);
  }
  return methodNotAllowed(res, ['GET', 'POST']);
}

export default withErrorHandling(handler);
