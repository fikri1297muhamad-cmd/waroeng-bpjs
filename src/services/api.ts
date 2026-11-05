import { MenuItem, Order, RestaurantTable, CartItem } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from '../data/initialData';
import {
  import {
  import {
  getMenuItemsFromSupabase,
  getRestaurantTablesFromSupabase,
  createOrderViaSupabaseRpc,
  getSupabasePublishableKey,
  getRealOrdersFromSupabase,
} from './supabaseClient';
updateOrderStatusInSupabase,
recordOrderPaymentInSupabase,
  
const STORAGE_KEYS = {
  CART: 'waroeng_bpjs_cart',
  SAVED_ORDERS: 'waroeng_bpjs_customer_orders',
  SELECTED_TABLE: 'waroeng_bpjs_selected_table',
  CUSTOMER_NAME: 'waroeng_bpjs_customer_name',
  AUTH_ROLE: 'waroeng_bpjs_auth_role',
  LOCAL_MENUS: 'waroeng_bpjs_menus_cache',
  LOCAL_TABLES: 'waroeng_bpjs_tables_cache',
};

// Formatting utilities
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  } catch {
    return '-';
  }
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

// Play subtle pleasant chime for new order / status update
export function playChime(type: 'success' | 'alert' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

// -----------------------------------------------------------------------------
// MENUS API
// -----------------------------------------------------------------------------
export async function getMenus(): Promise<MenuItem[]> {
  // 1. Prioritize reading directly from Supabase 'menu_items'
  if (getSupabasePublishableKey()) {
    try {
      const sbMenus = await getMenuItemsFromSupabase();
      if (sbMenus && Array.isArray(sbMenus) && sbMenus.length > 0) {
        const mapped: MenuItem[] = sbMenus
          .filter((m: any) => Boolean(m && typeof m === 'object'))
          .map((m: any, idx: number) => ({
            id: String(m.id ?? `sb-${idx}`),
            name: m.name || m.title || 'Menu Waroeng',
            category: (m.category as any) || 'makanan',
            price: Number(m.price) || 0,
            image_url:
              m.image_url ||
              m.image ||
              m.photo_url ||
              '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
            description: m.description || '',
            is_available: m.is_available ?? m.available ?? true,
          }));
        if (mapped.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch (e) {
      console.warn('[Direct Supabase menu_items fetch error, fallback to API]', e);
    }
  }

  // 2. Fetch from backend API
  try {
    const res = await fetch('/api/menus');
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : data.items;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const cleanList: MenuItem[] = rawList
          .filter((item: any) => Boolean(item && typeof item === 'object' && item.id))
          .map((item: any, idx: number) => ({
            id: String(item.id ?? `menu-${idx}`),
            name: item.name || 'Menu',
            category: item.category || 'makanan',
            price: Number(item.price) || 0,
            image_url:
              item.image_url ||
              '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
            description: item.description || '',
            is_available: item.is_available ?? true,
          }));
        if (cleanList.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(cleanList));
          return cleanList;
        }
      }
    }
  } catch (err) {
    console.warn('Network issue fetching menus, using cache');
  }

  // 3. Local storage fallback
  const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_MENUS);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        const cleanList: MenuItem[] = parsed
          .filter((item: any) => Boolean(item && typeof item === 'object' && item.id))
          .map((item: any, idx: number) => ({
            id: String(item.id ?? `cache-${idx}`),
            name: item.name || 'Menu Waroeng',
            category: item.category || 'makanan',
            price: Number(item.price) || 0,
            image_url:
              item.image_url ||
              '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
            description: item.description || '',
            is_available: item.is_available ?? true,
          }));
        if (cleanList.length > 0) {
          return cleanList;
        }
      }
    } catch {}
  }

  return INITIAL_MENU_ITEMS;
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const newItem: MenuItem = {
    ...item,
    id: `menu-${Date.now()}`,
    image_url:
      item.image_url || '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
  };

  try {
    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      const created = await res.json();
      if (created && created.id) {
        const current = await getMenus();
        const updated = [created, ...current.filter((m) => m && String(m.id) !== String(created.id))];
        localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(updated));
        return created;
      }
    }
  } catch (err) {
    console.warn('Network issue adding menu', err);
  }

  // Local fallback
  const current = await getMenus();
  const updated = [newItem, ...current.filter((m) => m && String(m.id) !== String(newItem.id))];
  localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(updated));
  return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
  try {
    const res = await fetch(`/api/menus/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      if (updated && updated.id) {
        const current = await getMenus();
        const nextList = current.map((m) =>
          String(m.id) === String(id) ? { ...m, ...updated } : m
        );
        localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(nextList));
        return updated;
      }
    }
  } catch (err) {
    console.warn('Network issue updating menu', err);
  }

  const current = await getMenus();
  let found = false;
  const updatedList = current.map((m) => {
    if (String(m.id) === String(id)) {
      found = true;
      return {
        ...m,
        ...updates,
        image_url:
          updates.image_url ||
          m.image_url ||
          '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
      };
    }
    return m;
  });

  if (!found) {
    const fallbackItem: MenuItem = {
      id: String(id),
      name: updates.name || 'Menu Waroeng',
      category: updates.category || 'makanan',
      price: Number(updates.price) || 0,
      image_url:
        updates.image_url || '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
      description: updates.description || '',
      is_available: updates.is_available ?? true,
      ...updates,
    };
    updatedList.unshift(fallbackItem);
    localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(updatedList));
    return fallbackItem;
  }

  localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(updatedList));
  const result = updatedList.find((m) => String(m.id) === String(id));
  return (
    result || {
      id: String(id),
      name: updates.name || 'Menu Waroeng',
      category: updates.category || 'makanan',
      price: Number(updates.price) || 0,
      image_url:
        updates.image_url || '/src/assets/images/ayam_bakar_komplit_1793819916487.jpg',
      description: updates.description || '',
      is_available: updates.is_available ?? true,
      ...updates,
    }
  );
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/menus/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Network issue deleting menu', err);
  }

  const current = await getMenus();
  const updated = current.filter((m) => m && String(m.id) !== String(id));
  localStorage.setItem(STORAGE_KEYS.LOCAL_MENUS, JSON.stringify(updated));
  return true;
}

// -----------------------------------------------------------------------------
// ORDERS API
// -----------------------------------------------------------------------------
export async function getOrders(): Promise<Order[]> {
  // Utamakan database Supabase
  if (getSupabasePublishableKey()) {
    try {
      const supabaseOrders = await getRealOrdersFromSupabase();

      if (supabaseOrders !== null) {
        return supabaseOrders;
      }
    } catch (err) {
      console.warn('Gagal mengambil pesanan dari Supabase:', err);
    }
  }

  // Fallback jika Supabase belum tersedia
  try {
    const res = await fetch('/api/orders');

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Network issue fetching orders');
  }

  return getSavedCustomerOrders();
}
  // Fallback to customer's saved orders
  return getSavedCustomerOrders();
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const tableNum = Number(orderData.table_number) || 1;
  const customerName = (orderData.customer_name || '').trim();

  // 1. If Supabase Publishable Key is configured, use public.create_order RPC directly
  if (getSupabasePublishableKey()) {
    const rpcItems = (orderData.items || []).map((it) => ({
      menuItemId: it.menu_id,
      quantity: it.quantity,
      notes: it.notes || '',
    }));

    // Call Supabase RPC - will throw on error
    const rpcResult = await createOrderViaSupabaseRpc({
      customerName,
      tableNumber: tableNum,
      notes: orderData.customer_notes || '',
      items: rpcItems,
    });

    const created: Order = {
      id: rpcResult.orderId || `order-${Date.now()}`,
      order_number: rpcResult.orderNumber,
      customer_name: customerName,
      table_number: tableNum,
      status: 'menunggu',
      payment_status: 'belum_bayar',
      payment_method: null,
      subtotal: rpcResult.total || orderData.subtotal || 0,
      total: rpcResult.total || orderData.total || 0,
      customer_notes: orderData.customer_notes || '',
      items: orderData.items || [],
      created_at: rpcResult.createdAt || new Date().toISOString(),
      updated_at: rpcResult.createdAt || new Date().toISOString(),
    };

    saveCustomerOrder(created);
    return created;
  }

  // 2. Fallback when Supabase key is not yet set
  let created: Order | null = null;
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (res.ok) {
      created = await res.json();
    }
  } catch (err) {
    console.warn('Network issue creating order, fallback local');
  }

  if (!created) {
    created = {
      id: `order-${Date.now()}`,
      order_number: `BPJS-${String(tableNum).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: customerName || 'Pelanggan',
      table_number: tableNum,
      status: 'menunggu',
      payment_status: 'belum_bayar',
      payment_method: null,
      subtotal: orderData.subtotal || 0,
      total: orderData.total || 0,
      customer_notes: orderData.customer_notes || '',
      items: orderData.items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  saveCustomerOrder(created);
  return created;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      updateSavedCustomerOrder(updated);
      return updated;
    }
  } catch (err) {
    console.warn('Network issue updating order');
  }

  // Fallback
  const saved = getSavedCustomerOrders();
  const idx = saved.findIndex((o) => o.id === id);
  if (idx !== -1) {
    const updated = { ...saved[idx], ...updates, updated_at: new Date().toISOString() };
    saved[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.SAVED_ORDERS, JSON.stringify(saved));
    return updated;
  }
  throw new Error('Order not found');
}

// -----------------------------------------------------------------------------
// TABLES API
// -----------------------------------------------------------------------------
export async function getTables(): Promise<RestaurantTable[]> {
  // 1. Prioritize reading directly from Supabase 'restaurant_tables'
  if (getSupabasePublishableKey()) {
    try {
      const sbTables = await getRestaurantTablesFromSupabase();
      if (sbTables && Array.isArray(sbTables) && sbTables.length > 0) {
        const mapped: RestaurantTable[] = sbTables.map((t: any, index: number) => ({
          id: Number(t.id) || index + 1,
          table_number: Number(t.table_number ?? t.number ?? t.id ?? index + 1),
          status: (t.status as any) || 'kosong',
          capacity: Number(t.capacity) || 4,
          current_customer_name: t.current_customer_name,
          current_order_id: t.current_order_id,
        }));
        localStorage.setItem(STORAGE_KEYS.LOCAL_TABLES, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('[Direct Supabase restaurant_tables fetch error, fallback to API]', e);
    }
  }

  // 2. Fetch from backend API
  try {
    const res = await fetch('/api/tables');
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.tables;
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_TABLES, JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {}

  // 3. Local storage fallback
  const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_TABLES);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_TABLES;
}

export async function updateTable(tableNumber: number, updates: Partial<RestaurantTable>): Promise<RestaurantTable> {
  try {
    const res = await fetch(`/api/tables/${tableNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      if (updated && updated.table_number) {
        const current = await getTables();
        const nextList = current.map((t) =>
          Number(t.table_number) === Number(tableNumber) ? { ...t, ...updated } : t
        );
        localStorage.setItem(STORAGE_KEYS.LOCAL_TABLES, JSON.stringify(nextList));
        return updated;
      }
    }
  } catch (err) {
    console.warn('Network issue updating table', err);
  }

  const current = await getTables();
  let found = false;
  const updated = current.map((t) => {
    if (Number(t.table_number) === Number(tableNumber)) {
      found = true;
      return { ...t, ...updates };
    }
    return t;
  });

  if (!found) {
    const fallback: RestaurantTable = {
      id: Number(tableNumber),
      table_number: Number(tableNumber),
      status: updates.status || 'kosong',
      capacity: Number(updates.capacity) || 4,
      current_customer_name: updates.current_customer_name,
      current_order_id: updates.current_order_id,
      ...updates,
    };
    updated.push(fallback);
    localStorage.setItem(STORAGE_KEYS.LOCAL_TABLES, JSON.stringify(updated));
    return fallback;
  }

  localStorage.setItem(STORAGE_KEYS.LOCAL_TABLES, JSON.stringify(updated));
  const res = updated.find((t) => Number(t.table_number) === Number(tableNumber));
  return (
    res || {
      id: Number(tableNumber),
      table_number: Number(tableNumber),
      status: updates.status || 'kosong',
      capacity: Number(updates.capacity) || 4,
      current_customer_name: updates.current_customer_name,
      current_order_id: updates.current_order_id,
      ...updates,
    }
  );
}

// -----------------------------------------------------------------------------
// LOCAL CUSTOMER STORAGE HELPERS
// -----------------------------------------------------------------------------
export function getSavedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.CART);
}

export function getSavedCustomerOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomerOrder(order: Order) {
  const current = getSavedCustomerOrders();
  // prepend new order
  const filtered = current.filter((o) => o.id !== order.id);
  const updated = [order, ...filtered];
  localStorage.setItem(STORAGE_KEYS.SAVED_ORDERS, JSON.stringify(updated));
}

export function updateSavedCustomerOrder(order: Order) {
  const current = getSavedCustomerOrders();
  const updated = current.map((o) => (o.id === order.id ? order : o));
  localStorage.setItem(STORAGE_KEYS.SAVED_ORDERS, JSON.stringify(updated));
}

export function getSavedTable(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_TABLE);
    const num = Number(raw);
    return num >= 1 && num <= 15 ? num : 1;
  } catch {
    return 1;
  }
}

export function saveSelectedTable(tableNum: number) {
  localStorage.setItem(STORAGE_KEYS.SELECTED_TABLE, String(tableNum));
}

export function getSavedCustomerName(): string {
  return localStorage.getItem(STORAGE_KEYS.CUSTOMER_NAME) || '';
}

export function saveCustomerName(name: string) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMER_NAME, name);
}

// Check backend Supabase status safely
export async function checkSupabaseStatus() {
  try {
    const res = await fetch('/api/supabase-status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    //
  }
  return {
    isConfigured: false,
    hasSecretKey: false,
    hasUrl: false,
    storageMode: 'Menunggu Publishable Key Supabase',
  };
}

export {
  runSupabaseConnectionTest,
  getSupabasePublishableKey,
  saveSupabasePublishableKey,
  removeSupabasePublishableKey,
} from './supabaseClient';
export type { SupabaseTestResult } from './supabaseClient';
