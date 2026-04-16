import { getSupabaseAdmin } from './supabase.js';

function normalizeRecord(record) {
  if (!record) return record;
  return {
    ...record,
    created_date: record.created_at,
    updated_date: record.updated_at,
  };
}

export async function listTable(table, orderColumn = 'created_at', ascending = false) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderColumn, { ascending });
  if (error) throw error;
  return (data || []).map(normalizeRecord);
}

export async function getById(table, id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return normalizeRecord(data);
}

export async function insertRow(table, payload) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return normalizeRecord(data);
}

export async function updateRow(table, id, payload) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return normalizeRecord(data);
}

export async function deleteRow(table, id) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}
