import { request } from '@/lib/api';

function buildEntityClient(basePath) {
  return {
    async list(_sort = '-created_date', limit) {
      const data = await request(basePath);
      return typeof limit === 'number' ? data.slice(0, limit) : data;
    },
    async create(payload) {
      return request(basePath, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async update(id, payload) {
      return request(`${basePath}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    async delete(id) {
      return request(`${basePath}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export const appClient = {
  auth: {
    async me() {
      try {
        const session = await request('/api/admin-session');
        return session?.authenticated ? { full_name: 'Administrador', role: 'admin' } : { full_name: 'Operador', role: 'viewer' };
      } catch {
        return { full_name: 'Operador', role: 'viewer' };
      }
    },
  },
  entities: {
    Product: buildEntityClient('/api/products'),
    StockEntry: buildEntityClient('/api/entries'),
    StockExit: buildEntityClient('/api/exits'),
    StockMovement: buildEntityClient('/api/movements'),
    InventoryCheck: buildEntityClient('/api/inventory-checks'),
  },
};
