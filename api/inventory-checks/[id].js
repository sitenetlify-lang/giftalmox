import { requireAdmin } from '../_lib/auth.js';
import { getById, insertRow, updateRow } from '../_lib/entities.js';
import { methodNotAllowed, readJsonBody, sendJson, withErrorHandling } from '../_lib/http.js';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return methodNotAllowed(res, ['PUT']);
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const body = await readJsonBody(req);
  const currentCheck = await getById('inventory_checks', id);
  const merged = { ...currentCheck, ...body };
  const updated = await updateRow('inventory_checks', id, merged);

  if (body.adjusted === true && currentCheck.adjusted !== true) {
    const product = await getById('products', currentCheck.product_id);
    await updateRow('products', product.id, {
      ...product,
      current_stock: Number(currentCheck.physical_quantity),
    });

    await insertRow('stock_movements', {
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      type: 'Inventário',
      origin: 'Conferência',
      destination: product.location || 'Estoque',
      quantity: Math.abs(Number(currentCheck.difference || 0)),
      responsible: currentCheck.responsible || 'Admin',
      notes: `Ajuste por inventário. Diferença: ${currentCheck.difference}`,
      movement_date: new Date().toISOString(),
    });
  }

  return sendJson(res, 200, updated);
}

export default withErrorHandling(handler);
