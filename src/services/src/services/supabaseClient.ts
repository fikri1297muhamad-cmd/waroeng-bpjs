import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StaffProfile, Order, OrderStatus, PaymentMethod } from '../types';

export const SUPABASE_PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://twetswzzztqbivkvscvo.supabase.co';

export const STORAGE_KEY_PUB_KEY = 'waroeng_bpjs_supabase_publishable_key';

// Get current Publishable Key (from env or stored in browser)
export function getSupabasePublishableKey(): string {
