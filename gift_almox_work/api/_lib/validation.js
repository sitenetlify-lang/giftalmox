import { z } from 'zod';

export const settingsSchema = z.object({
  system_name: z.string().trim().min(2).max(120),
  logo_url: z.string().trim().url().or(z.literal('')),
  primary_color: z.string().trim().regex(/^#([0-9A-Fa-f]{6})$/),
  secondary_color: z.string().trim().regex(/^#([0-9A-Fa-f]{6})$/),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const productSchema = z.object({
  code: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1).max(80),
  subcategory: z.string().trim().optional().nullable(),
  unit: z.string().trim().min(1).max(10),
  current_stock: z.coerce.number().min(0).default(0),
  min_stock: z.coerce.number().min(0).default(0),
  max_stock: z.coerce.number().min(0).default(0),
  location: z.string().trim().optional().nullable(),
  supplier: z.string().trim().optional().nullable(),
  unit_cost: z.coerce.number().min(0).default(0),
  status: z.string().trim().min(1).max(40).default('Ativo'),
  barcode: z.string().trim().optional().nullable(),
  image_url: z.string().trim().url().or(z.literal('')).optional().nullable(),
});

export const entrySchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  supplier: z.string().trim().optional().nullable(),
  invoice_number: z.string().trim().optional().nullable(),
  received_by: z.string().trim().optional().nullable(),
  unit_cost: z.coerce.number().min(0).default(0),
  notes: z.string().trim().optional().nullable(),
});

export const exitSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  department: z.string().trim().optional().nullable(),
  responsible: z.string().trim().optional().nullable(),
  reason: z.string().trim().optional().nullable(),
  cost_center: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const movementSchema = z.object({
  product_id: z.string().uuid(),
  type: z.string().trim().min(1).max(40),
  origin: z.string().trim().optional().nullable(),
  destination: z.string().trim().optional().nullable(),
  quantity: z.coerce.number().positive(),
  responsible: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const inventoryCheckSchema = z.object({
  product_id: z.string().uuid(),
  physical_quantity: z.coerce.number().min(0),
  responsible: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(message || 'Validation failed');
  }
  return result.data;
}
