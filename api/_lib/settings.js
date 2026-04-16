import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from './supabase.js';

const publicFields = 'id, system_name, logo_url, primary_color, secondary_color, created_at, updated_at';
const privateFields = `${publicFields}, admin_password`;

export async function getSettings(includePassword = false) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('settings')
    .select(includePassword ? privateFields : publicFields)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureSettingsExists() {
  let settings = await getSettings(true);
  if (settings) return settings;

  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const admin_password = await bcrypt.hash(defaultPassword, 10);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('settings')
    .insert({
      system_name: 'GIFT Almox',
      logo_url: '',
      primary_color: '#991b1b',
      secondary_color: '#111827',
      admin_password,
    })
    .select(privateFields)
    .single();

  if (error) throw error;
  return data;
}

export function sanitizePublicSettings(settings) {
  if (!settings) return null;
  const { admin_password, ...publicSettings } = settings;
  return publicSettings;
}
