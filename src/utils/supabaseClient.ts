import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from localStorage or environment variables
export function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '', isConfigured: false };
  }

  const storedUrl = localStorage.getItem('vastraa_supabase_url');
  const storedKey = localStorage.getItem('vastraa_supabase_anon_key');

  const meta = import.meta as any;
  const url = storedUrl || (meta.env && meta.env.VITE_SUPABASE_URL) || '';
  const anonKey = storedKey || (meta.env && meta.env.VITE_SUPABASE_ANON_KEY) || '';

  return {
    url,
    anonKey,
    isConfigured: url.length > 0 && anonKey.length > 0
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vastraa_supabase_url', url.trim());
    localStorage.setItem('vastraa_supabase_anon_key', anonKey.trim());
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vastraa_supabase_url');
    localStorage.removeItem('vastraa_supabase_anon_key');
  }
}

// Lazy initialization of Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey);
  }
  return supabaseInstance;
}

// Test connection
export async function testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
  try {
    const tempClient = createClient(url, anonKey);
    // Try listing any bucket or fetching a dummy query to verify credentials
    const { error } = await (tempClient.from('vastraa_shop_settings') as any).select('id').limit(1);
    if (error && error.message.includes('FetchError')) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase test connection failed:', err);
    return false;
  }
}

// Table mappings for Cloud Sync
export const SUPABASE_TABLES = {
  registrations: 'vastraa_registrations',
  products: 'vastraa_products',
  customers: 'vastraa_customers',
  suppliers: 'vastraa_suppliers',
  invoices: 'vastraa_invoices',
  purchaseHistory: 'vastraa_purchase_history',
  expenses: 'vastraa_expenses',
  auditLogs: 'vastraa_audit_logs',
  shopSettings: 'vastraa_shop_settings',
  categories: 'vastraa_categories',
  brands: 'vastraa_brands'
};

// Generic Push/Upsert helper
export async function pushToSupabase(key: keyof typeof SUPABASE_TABLES, id: string, data: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const table = SUPABASE_TABLES[key];
  try {
    const { error } = await (client
      .from(table) as any)
      .upsert({ id, data, updated_at: new Date().toISOString() });

    if (error) {
      console.warn(`Failed to push to Supabase table ${table}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error in pushToSupabase for ${table}:`, err);
    return false;
  }
}

// Generic Bulk Push helper
export async function pushBulkToSupabase(key: keyof typeof SUPABASE_TABLES, items: { id: string; data: any }[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || items.length === 0) return false;

  const table = SUPABASE_TABLES[key];
  try {
    const rows = items.map(item => ({
      id: item.id,
      data: item.data,
      updated_at: new Date().toISOString()
    }));

    const { error } = await (client
      .from(table) as any)
      .upsert(rows);

    if (error) {
      console.warn(`Failed to push bulk to Supabase table ${table}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error in pushBulkToSupabase for ${table}:`, err);
    return false;
  }
}

// Generic Pull/Fetch helper
export async function pullFromSupabase<T>(key: keyof typeof SUPABASE_TABLES): Promise<T[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const table = SUPABASE_TABLES[key];
  try {
    const { data, error } = await (client
      .from(table) as any)
      .select('id, data');

    if (error) {
      console.warn(`Failed to pull from Supabase table ${table}:`, error.message);
      return null;
    }

    if (!data) return [];
    return data.map((row: any) => ({
      ...row.data,
      id: row.id // ensure ID matches
    })) as T[];
  } catch (err) {
    console.error(`Error in pullFromSupabase for ${table}:`, err);
    return null;
  }
}

// Complete synchronization script for all datasets
export interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    registrations: number;
    products: number;
    customers: number;
    suppliers: number;
    invoices: number;
    purchaseHistory: number;
    expenses: number;
    auditLogs: number;
    shopSettings: boolean;
    categories: number;
    brands: number;
  };
}

export async function syncAllDatasetsToSupabase(localState: {
  registrations: any[];
  products: any[];
  customers: any[];
  suppliers: any[];
  invoices: any[];
  purchaseHistory: any[];
  expenses: any[];
  auditLogs: any[];
  shopSettings: any;
  categories: any[];
  brands: any[];
}): Promise<SyncResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured' };
  }

  const results = {
    registrations: 0,
    products: 0,
    customers: 0,
    suppliers: 0,
    invoices: 0,
    purchaseHistory: 0,
    expenses: 0,
    auditLogs: 0,
    shopSettings: false,
    categories: 0,
    brands: 0
  };

  try {
    // 1. Sync shopSettings (single object, use 'default' as id)
    if (localState.shopSettings) {
      const ok = await pushToSupabase('shopSettings', 'default', localState.shopSettings);
      results.shopSettings = ok;
    }

    // Helpers for bulk sync
    const syncTable = async (key: keyof typeof SUPABASE_TABLES, items: any[]): Promise<number> => {
      if (!items || items.length === 0) return 0;
      const formatted = items.map(item => ({ id: item.id || 'default', data: item }));
      const ok = await pushBulkToSupabase(key, formatted);
      return ok ? items.length : 0;
    };

    results.registrations = await syncTable('registrations', localState.registrations);
    results.products = await syncTable('products', localState.products);
    results.customers = await syncTable('customers', localState.customers);
    results.suppliers = await syncTable('suppliers', localState.suppliers);
    results.invoices = await syncTable('invoices', localState.invoices);
    results.purchaseHistory = await syncTable('purchaseHistory', localState.purchaseHistory);
    results.expenses = await syncTable('expenses', localState.expenses);
    results.auditLogs = await syncTable('auditLogs', localState.auditLogs);
    results.categories = await syncTable('categories', localState.categories);
    results.brands = await syncTable('brands', localState.brands);

    return {
      success: true,
      message: 'Synchronization successful',
      details: results
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Synchronization failed due to error'
    };
  }
}

export const SUPABASE_SETUP_SQL = `-- Paste this SQL script into your Supabase SQL Editor (https://supabase.com)
-- This creates the tables for the Vastraa CRM & ERP Cloud Sync

create table if not exists vastraa_registrations (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_products (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_customers (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_suppliers (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_invoices (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_purchase_history (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_expenses (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_audit_logs (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_shop_settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_categories (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists vastraa_brands (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Realtime for these tables
alter publication supabase_realtime add table vastraa_registrations;
alter publication supabase_realtime add table vastraa_products;
alter publication supabase_realtime add table vastraa_customers;
alter publication supabase_realtime add table vastraa_suppliers;
alter publication supabase_realtime add table vastraa_invoices;
alter publication supabase_realtime add table vastraa_purchase_history;
alter publication supabase_realtime add table vastraa_expenses;
alter publication supabase_realtime add table vastraa_audit_logs;
alter publication supabase_realtime add table vastraa_shop_settings;
alter publication supabase_realtime add table vastraa_categories;
alter publication supabase_realtime add table vastraa_brands;
`;
