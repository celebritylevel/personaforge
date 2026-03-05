import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://bmsvxytzueetnlhsefuv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY || '';

export function getSupabaseClient(serviceKey?: string) {
  return createClient(supabaseUrl, serviceKey || supabaseKey);
}

export const supabase = getSupabaseClient();
