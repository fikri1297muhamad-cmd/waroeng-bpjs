import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StaffProfile, Order, OrderStatus, PaymentMethod } from '../types';

export const SUPABASE_PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://twetswzzztqbivkvscvo.supabase.co';

export const STORAGE_KEY_PUB_KEY = 'waroeng_bpjs_supabase_publishable_key';

// Get current Publishable Key (from env or stored in browser)
export function getSupabasePublishableKey(): string {
  const envKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    '';
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  return localStorage.getItem(STORAGE_KEY_PUB_KEY) || '';
}

export function saveSupabasePublishableKey(key: string): void {
  const cleanKey = key.trim();
  // Security guard: Reject secret keys / service_role keys if user accidentally pastes one
  if (cleanKey.includes('service_role') || cleanKey.startsWith('sbp_')) {
    throw new Error('PERINGATAN KEAMANAN: Jangan gunakan Secret Key / Service Role Key di browser! Gunakan hanya Publishable Key (Anon Key).');
  }
  localStorage.setItem(STORAGE_KEY_PUB_KEY, cleanKey);
}

export function removeSupabasePublishableKey(): void {
  localStorage.removeItem(STORAGE_KEY_PUB_KEY);
}

// Create Supabase Client using Publishable Key
let cachedClient: SupabaseClient | null = null;
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const key = getSupabasePublishableKey();
  if (!key) return null;

  if (cachedClient && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(SUPABASE_PROJECT_URL, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Gagal membuat Supabase client:', err);
    return null;
  }
}

export interface SupabaseTestResult {
  testedAt: string;
  projectUrl: string;
  hasKey: boolean;
  success: boolean;
  overallStatus: 'success' | 'partial' | 'failed' | 'no_key';
  message: string;
  menuTest: {
    success: boolean;
    tableName: 'menu_items';
    count: number;
    items: Array<{ id?: string | number; name: string; price: number; [key: string]: any }>;
    error?: string;
  };
  tableTest: {
    success: boolean;
    tableName: 'restaurant_tables';
    count: number;
    tables: Array<{ id?: string | number; table_number?: number; number?: number; status?: string; [key: string]: any }>;
    error?: string;
  };
  ordersTest: {
    success: boolean;
    tableName: 'orders';
    count: number;
    error?: string;
  };
  orderItemsTest: {
    success: boolean;
    tableName: 'order_items';
    count: number;
    error?: string;
  };
  staffTest: {
    success: boolean;
    tableName: 'staff_profiles';
    count: number;
    error?: string;
  };
}

/**
 * Pengujian nyata ke Supabase:
 * 1. Membaca daftar menu dari menu_items
 * 2. Membaca daftar meja dari restaurant_tables
 * 3. Menampilkan nama dan harga menu nyata
 * 4. Menampilkan pesan kesalahan jika koneksi gagal
 */
export async function runSupabaseConnectionTest(customKey?: string): Promise<SupabaseTestResult> {
  const keyToUse = customKey !== undefined ? customKey.trim() : getSupabasePublishableKey();

  const baseResult: SupabaseTestResult = {
    testedAt: new Date().toISOString(),
    projectUrl: SUPABASE_PROJECT_URL,
    hasKey: Boolean(keyToUse),
    success: false,
    overallStatus: 'no_key',
    message: '',
    menuTest: { success: false, tableName: 'menu_items', count: 0, items: [] },
    tableTest: { success: false, tableName: 'restaurant_tables', count: 0, tables: [] },
    ordersTest: { success: false, tableName: 'orders', count: 0 },
    orderItemsTest: { success: false, tableName: 'order_items', count: 0 },
    staffTest: { success: false, tableName: 'staff_profiles', count: 0 },
  };

  if (!keyToUse) {
    baseResult.overallStatus = 'no_key';
    baseResult.message =
      'Koneksi gagal: Publishable Key (Anon Key) belum dikonfigurasi. Silakan masukkan Publishable Key Supabase Anda untuk menjalankan pengujian.';
    baseResult.menuTest.error = 'No apikey found (Missing Publishable Key)';
    baseResult.tableTest.error = 'No apikey found (Missing Publishable Key)';
    return baseResult;
  }

  // Security validation
  if (keyToUse.includes('service_role') || keyToUse.startsWith('sbp_')) {
    baseResult.overallStatus = 'failed';
    baseResult.message =
      'Ditolak demi keamanan: Jangan pernah menggunakan Secret Key / Service Role Key di browser. Gunakan Publishable Key (Anon Key).';
    return baseResult;
  }

  let client: SupabaseClient;
  try {
    client = createClient(SUPABASE_PROJECT_URL, keyToUse);
  } catch (err: any) {
    baseResult.overallStatus = 'failed';
    baseResult.message = `Gagal inisialisasi client Supabase: ${err.message || err}`;
    return baseResult;
  }

  // 1. Test reading `menu_items`
  try {
    const { data: menuData, error: menuError } = await client
      .from('menu_items')
      .select('*')
      .limit(50);

    if (menuError) {
      baseResult.menuTest.success = false;
      baseResult.menuTest.error = `${menuError.message} (Code: ${menuError.code || 'N/A'})`;
    } else {
      baseResult.menuTest.success = true;
      baseResult.menuTest.count = menuData?.length || 0;
      baseResult.menuTest.items = (menuData || []).map((m: any) => ({
        id: m.id,
        name: m.name || m.title || 'Tanpa Nama',
        price: Number(m.price) || 0,
        category: m.category,
        image_url: m.image_url || m.image || m.photo_url,
        description: m.description,
        is_available: m.is_available ?? m.available ?? true,
      }));
    }
  } catch (err: any) {
    baseResult.menuTest.success = false;
    baseResult.menuTest.error = err.message || 'Gagal menghubungi tabel menu_items';
  }

    // 2. Test reading `restaurant_tables`
  try {
    const { data: tableData, error: tableError } = await client
      .from('restaurant_tables')
      .select('*')
      .order('table_number', { ascending: true })
      .limit(50);

    if (tableError) {
      baseResult.tableTest.success = false;
      baseResult.tableTest.error = `${tableError.message} (Code: ${tableError.code || 'N/A'})`;
    } else {
      baseResult.tableTest.success = true;
      baseResult.tableTest.count = tableData?.length || 0;
      baseResult.tableTest.tables = (tableData || []).map((t: any) => ({
        table_number: t.table_number,
        status: t.is_active ? 'kosong' : 'nonaktif',
      }));
    }
  } catch (err: any) {
    baseResult.tableTest.success = false;
    baseResult.tableTest.error = err.message || 'Gagal menghubungi tabel restaurant_tables';
  }
  // 3. Test reading `orders`
  try {
    const { data: ordersData, error: ordersError } = await client
      .from('orders')
      .select('id')
      .limit(10);
    if (ordersError) {
      baseResult.ordersTest.error = ordersError.message;
    } else {
      baseResult.ordersTest.success = true;
      baseResult.ordersTest.count = ordersData?.length || 0;
    }
  } catch (err: any) {
    baseResult.ordersTest.error = err.message;
  }

  // 4. Test reading `order_items`
  try {
    const { data: oiData, error: oiError } = await client
      .from('order_items')
      .select('id')
      .limit(10);
    if (oiError) {
      baseResult.orderItemsTest.error = oiError.message;
    } else {
      baseResult.orderItemsTest.success = true;
      baseResult.orderItemsTest.count = oiData?.length || 0;
    }
  } catch (err: any) {
    baseResult.orderItemsTest.error = err.message;
  }

  // 5. Test reading `staff_profiles`
  try {
    const { data: staffData, error: staffError } = await client
      .from('staff_profiles')
      .select('user_id, role')
      .limit(10);
    if (staffError) {
      baseResult.staffTest.error = staffError.message;
    } else {
      baseResult.staffTest.success = true;
      baseResult.staffTest.count = staffData?.length || 0;
    }
  } catch (err: any) {
    baseResult.staffTest.error = err.message;
  }

  // Calculate overall status
  const menuOk = baseResult.menuTest.success;
  const tableOk = baseResult.tableTest.success;

  if (menuOk && tableOk) {
    baseResult.success = true;
    baseResult.overallStatus = 'success';
    baseResult.message = `Koneksi Supabase nyata BERHASIL! Berhasil membaca ${baseResult.menuTest.count} menu dari 'menu_items' dan ${baseResult.tableTest.count} meja dari 'restaurant_tables'.`;
  } else if (menuOk || tableOk) {
    baseResult.success = false;
    baseResult.overallStatus = 'partial';
    baseResult.message =
      'Koneksi parsial: Sebagian tabel berhasil diakses, namun ada tabel yang mengalami kendala izin/akses.';
  } else {
    baseResult.success = false;
    baseResult.overallStatus = 'failed';
    baseResult.message = `Koneksi ke Supabase GAGAL: ${
      baseResult.menuTest.error || baseResult.tableTest.error || 'Autentikasi gagal atau RLS menolak akses.'
    }`;
  }

  return baseResult;
}

/**
 * Membaca daftar menu langsung dari tabel 'menu_items' di Supabase
 */
/**
 * Membaca daftar meja langsung dari tabel 'restaurant_tables' di Supabase
 */
export async function getRestaurantTablesFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('restaurant_tables')
      .select('*')
      .order('table_number', { ascending: true });

    if (error) {
      console.warn('[Supabase restaurant_tables error]', error);
      return null;
    }

    return data || [];
  } catch (err) {
    console.warn('[Supabase restaurant_tables fetch error]', err);
    return null;
  }
}
/**
 * Membaca daftar meja langsung dari tabel 'restaurant_tables' di Supabase
 */
export async function getRestaurantTablesFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Try order by table_number or id
    const { data, error } = await client
      .from('restaurant_tables')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('[Supabase restaurant_tables error]', error);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn('[Supabase restaurant_tables fetch error]', err);
    return null;
  }
}

/**
 * Introspeksi definisi fungsi 'create_order' melalui PostgREST OpenAPI
 */
export async function introspectCreateOrderRpc(): Promise<{
  exists: boolean;
  paramNames: string[];
  rawDefinition?: any;
}> {
  const key = getSupabasePublishableKey();
  if (!key) return { exists: false, paramNames: [] };

  try {
    const res = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/`, {
      headers: { apikey: key },
    });
    if (res.ok) {
      const swagger = await res.json();
      const rpcPath = swagger.paths?.['/rpc/create_order'];
      if (rpcPath?.post) {
        const bodyParam = rpcPath.post.parameters?.find((p: any) => p.in === 'body');
        if (bodyParam?.schema?.properties) {
          const names = Object.keys(bodyParam.schema.properties);
          return { exists: true, paramNames: names, rawDefinition: bodyParam.schema.properties };
        }
        if (Array.isArray(rpcPath.post.parameters)) {
          const names = rpcPath.post.parameters.map((p: any) => p.name);
          return { exists: true, paramNames: names };
        }
      }
    }
  } catch (err) {
    console.warn('[RPC Introspect error]', err);
  }
  return { exists: false, paramNames: [] };
}

// In-flight locking flag to prevent duplicate submissions when button is rapidly clicked
let isRpcSubmitting = false;

export interface CreateOrderRpcPayload {
  customerName: string;
  tableNumber: number;
  tableId?: string | number;
  notes?: string;
  items: Array<{
    menuItemId: string | number;
    quantity: number;
    notes?: string;
  }>;
}

export interface CreateOrderRpcResult {
  success: boolean;
  orderNumber: string;
  orderId?: string;
  total?: number;
  tableNumber: number;
  customerName: string;
  createdAt: string;
  rawResponse?: any;
}

/**
 * Memanggil fungsi PostgreSQL public.create_order yang sudah ada di Supabase
 * - Memeriksa definisi fungsi dan struktur parameter
 * - Menggunakan harga dari database (tidak mengirim harga dari browser)
 * - Mencegah pemesanan ganda (idempotency lock)
 * - Melempar pesan error detail jika database gagal menyimpan
 */
export async function createOrderViaSupabaseRpc(
  payload: CreateOrderRpcPayload
): Promise<CreateOrderRpcResult> {
  // 1. Guard: Cegah pengiriman ganda
  if (isRpcSubmitting) {
    throw new Error('Pesanan sedang diproses. Mohon tunggu...');
  }

  // 2. Guard: Jangan mengirim pesanan kosong
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Pesanan kosong! Silakan pilih minimal 1 menu.');
  }

  if (!payload.customerName || !payload.customerName.trim()) {
    throw new Error('Nama pelanggan wajib diisi.');
  }

  if (!payload.tableNumber || payload.tableNumber < 1 || payload.tableNumber > 15) {
    throw new Error('Nomor meja harus antara 01 sampai 15.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Koneksi Supabase belum aktif. Pastikan Publishable Key Supabase telah dikonfigurasi.'
    );
  }

  isRpcSubmitting = true;

  try {
    // Format item untuk database: HANYA id/menu_item_id, quantity, notes
    // TIDAK mengirim harga dari browser agar harga dihitung secara aman oleh database!
    const formattedItems = payload.items.map((it) => ({
      menu_item_id: it.menuItemId,
      menu_id: it.menuItemId,
      id: it.menuItemId,
      quantity: it.quantity,
      notes: it.notes || '',
    }));

    // Coba introspeksi parameter fungsi create_order dari PostgREST
    const { paramNames } = await introspectCreateOrderRpc();

    // Bangun payload RPC berdasarkan signature fungsi yang terdeteksi
    let rpcArgs: Record<string, any> = {};

    if (paramNames.length > 0) {
      // Jika terdeteksi parameter berawalan p_ (pola standar PL/pgSQL)
      if (paramNames.some((n) => n.startsWith('p_'))) {
        if (paramNames.includes('p_customer_name')) rpcArgs['p_customer_name'] = payload.customerName.trim();
        if (paramNames.includes('p_table_number')) rpcArgs['p_table_number'] = payload.tableNumber;
        if (paramNames.includes('p_table_id')) rpcArgs['p_table_id'] = payload.tableId ?? payload.tableNumber;
        if (paramNames.includes('p_items')) rpcArgs['p_items'] = formattedItems;
        if (paramNames.includes('p_notes')) rpcArgs['p_notes'] = payload.notes || '';
        if (paramNames.includes('p_customer_notes')) rpcArgs['p_customer_notes'] = payload.notes || '';
      } else {
        // Pola tanpa prefix p_
        if (paramNames.includes('customer_name')) rpcArgs['customer_name'] = payload.customerName.trim();
        if (paramNames.includes('table_number')) rpcArgs['table_number'] = payload.tableNumber;
        if (paramNames.includes('table_id')) rpcArgs['table_id'] = payload.tableId ?? payload.tableNumber;
        if (paramNames.includes('items')) rpcArgs['items'] = formattedItems;
        if (paramNames.includes('notes')) rpcArgs['notes'] = payload.notes || '';
      }
    }

    // Jika introspeksi tidak menemukan nama pasti, gunakan fallback parameter p_ terlebih dahulu
    if (Object.keys(rpcArgs).length === 0) {
      rpcArgs = {
        p_customer_name: payload.customerName.trim(),
        p_table_number: payload.tableNumber,
        p_items: formattedItems,
        p_notes: payload.notes || '',
      };
    }

    // Panggil RPC pertama
    let rpcResponse = await client.rpc('create_order', rpcArgs);

    // Jika terjadi galat signature mismatch (misal fungsi mengharapkan tanpa p_ atau dengan p_table_id),
    // lakukan penyesuaian otomatis
    if (rpcResponse.error) {
      const errMsg = rpcResponse.error.message || '';
      console.warn('[create_order percobaan 1 gagal]', errMsg);

      // Coba variasi tanpa prefix p_
      const altArgs: Record<string, any> = {
        customer_name: payload.customerName.trim(),
        table_number: payload.tableNumber,
        items: formattedItems,
        notes: payload.notes || '',
      };
      const retryResponse = await client.rpc('create_order', altArgs);
      if (!retryResponse.error) {
        rpcResponse = retryResponse;
      } else {
        // Coba variasi dengan p_table_id jika table_id yang diharapkan
        const tableIdArgs: Record<string, any> = {
          p_customer_name: payload.customerName.trim(),
          p_table_id: payload.tableId ?? payload.tableNumber,
          p_items: formattedItems,
          p_notes: payload.notes || '',
        };
        const tableIdRetry = await client.rpc('create_order', tableIdArgs);
        if (!tableIdRetry.error) {
          rpcResponse = tableIdRetry;
        }
      }
          }
    // Panggil RPC pertama
    let rpcResponse = await client.rpc('create_order', rpcArgs);

    // Jika terjadi galat signature mismatch (misal fungsi mengharapkan tanpa p_ atau dengan p_table_id),
    // lakukan penyesuaian otomatis
    if (rpcResponse.error) {
      const errMsg = rpcResponse.error.message || '';
      console.warn('[create_order percobaan 1 gagal]', errMsg);

      // Coba variasi tanpa prefix p_
      const altArgs: Record<string, any> = {
        customer_name: payload.customerName.trim(),
        table_number: payload.tableNumber,
        items: formattedItems,
        notes: payload.notes || '',
      };
      const retryResponse = await client.rpc('create_order', altArgs);
      if (!retryResponse.error) {
        rpcResponse = retryResponse;
      } else {
        // Coba variasi dengan p_table_id jika table_id yang diharapkan
        const tableIdArgs: Record<string, any> = {
          p_customer_name: payload.customerName.trim(),
          p_table_id: payload.tableId ?? payload.tableNumber,
          p_items: formattedItems,
          p_notes: payload.notes || '',
        };
        const tableIdRetry = await client.rpc('create_order', tableIdArgs);
        if (!tableIdRetry.error) {
          rpcResponse = tableIdRetry;
        }
      }
    }

    // Verifikasi respons database nyata
        const response = rpcData as {
      order_id?: string;
      order_code?: string;
      total_amount?: number;
      status?: string;
    };

    if (!response.order_id || !response.order_code) {
      throw new Error('Respons pesanan dari database tidak lengkap.');
    }

    return {
      success: true,
      orderNumber: response.order_code,
      orderId: response.order_id,
      total: Number(response.total_amount || 0),
      tableNumber: payload.tableNumber,
      customerName: payload.customerName.trim(),
      createdAt: new Date().toISOString(),
      rawResponse: rpcData,
    };
  } finally {
    isRpcSubmitting = false;
  }
}

// -----------------------------------------------------------------------------
// SUPABASE AUTH & STAFF_PROFILES ROLE VERIFICATION
// -----------------------------------------------------------------------------

/**
 * Login Staf (Admin / Kasir) menggunakan Supabase Authentication
 * dan memvalidasi peran pengguna di tabel 'staff_profiles'
 */
export async function signInStaffWithSupabase(
  email: string,
  pass: string,
  requiredRole: 'admin' | 'kasir'
): Promise<{ success: boolean; profile?: StaffProfile; error?: string }> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      error: 'Koneksi Supabase belum terkonfigurasi.',
    };
  }

  try {
    const { data: authData, error: authError } =
      await client.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Pengguna tidak ditemukan.',
      };
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || email.trim();

    const { data: profileData, error: profileError } = await client
      .from('staff_profiles')
      .select('user_id, full_name, role, created_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Gagal membaca profil staf: ' + profileError.message,
      };
    }

    if (!profileData) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Profil staf belum terdaftar di database.',
      };
    }

    const rawRole = String(profileData.role || '').toLowerCase();

    const isAdmin = ['admin', 'superadmin', 'manager'].includes(rawRole);
    const isKasir = ['kasir', 'cashier', 'staff'].includes(rawRole);

    if (requiredRole === 'admin' && !isAdmin) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Akses ditolak. Akun ini bukan akun Admin.',
      };
    }

    if (requiredRole === 'kasir' && !isKasir) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Akses ditolak. Akun ini bukan akun Kasir.',
      };
    }

    const staffProfile: StaffProfile = {
      id: userId,
      user_id: userId,
      email: userEmail,
      full_name: profileData.full_name || userEmail,
      role: profileData.role,
      created_at: profileData.created_at,
    };

    localStorage.setItem(
      'waroeng_bpjs_logged_staff',
      JSON.stringify(staffProfile)
    );

    return { success: true, profile: staffProfile };
  } catch (err: any) {
    await client.auth.signOut();
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan sistem saat autentikasi.',
    };
  }
}
 * Logout Staf Supabase
 */
export async function signOutStaff(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch {}
  }
  localStorage.removeItem('waroeng_bpjs_logged_staff');
}

/**
 * Mengambil profil staf yang sedang login dari localStorage / session
 */
export function getStoredStaffProfile(): StaffProfile | null {
  try {
    const raw = localStorage.getItem('waroeng_bpjs_logged_staff');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Langganan realtime untuk pembaruan tabel 'orders'
 */
export function subscribeToOrdersRealtime(onOrderChanged: (payload: any) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('public:orders:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          onOrderChanged(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Realtime Subscription Error]', err);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// OPERASI DATABASE SUPABASE SESUAI IZIN RLS (ADMIN & KASIR)
// -----------------------------------------------------------------------------

/**
 * Mengambil semua pesanan dari database Supabase
 */
export async function getRealOrdersFromSupabase(): Promise<Order[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Ambil pesanan
    const { data: orders, error: ordersError } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.warn('[getRealOrdersFromSupabase error]', ordersError);
      return null;
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Ambil rincian item untuk semua pesanan
    const orderIds = orders.map((o: any) => o.id);

    const { data: orderItems, error: itemsError } = await client
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.warn('[getRealOrdersFromSupabase items error]', itemsError);
      return null;
    }

    // Kelompokkan item berdasarkan order_id
    const itemsByOrder: Record<string, any[]> = {};

    (orderItems || []).forEach((item: any) => {
      const orderId = String(item.order_id);

      if (!itemsByOrder[orderId]) {
        itemsByOrder[orderId] = [];
      }

      itemsByOrder[orderId].push({
        id: String(item.id),
        menu_id: String(item.menu_id),
        name: item.item_name,
        price: Number(item.item_price || 0),
        quantity: Number(item.quantity || 0),
      });
    });

    // Sesuaikan status database dengan status aplikasi
    return orders.map((o: any) => {
      const dbStatus = String(o.status || 'new').toLowerCase();
      const dbPayment = String(o.payment_status || 'unpaid').toLowerCase();

      const statusMap: Record<string, OrderStatus> = {
        new: 'menunggu',
        menunggu: 'menunggu',
        processing: 'diproses',
        diproses: 'diproses',
        ready: 'siap',
        siap: 'siap',
        completed: 'selesai',
        selesai: 'selesai',
        cancelled: 'dibatalkan',
        dibatalkan: 'dibatalkan',
      };

      return {
        id: String(o.id),
        order_number: o.order_code || '',
        customer_name: o.customer_name || 'Pelanggan',
        table_number: Number(o.table_number || 1),
        status: statusMap[dbStatus] || 'menunggu',
        payment_status: dbPayment === 'paid' || dbPayment === 'lunas'
          ? 'lunas'
          : 'belum_bayar',
        payment_method: null,
        subtotal: Number(o.total_amount || 0),
        total: Number(o.total_amount || 0),
        customer_notes: '',
        items: itemsByOrder[String(o.id)] || [],
        created_at: o.created_at || new Date().toISOString(),
        updated_at: o.created_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('[getRealOrdersFromSupabase error]', err);
    return null;
  }
}

/**
 * Admin: Menambah menu baru ke tabel 'menu_items'
 */
export async function addMenuItemToSupabase(item: {
  name: string;
  category: string;
  price: number;
  image_url: string;
  description: string;
  is_available: boolean;
}): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum aktif.');

  const { data, error } = await client
    .from('menu_items')
    .insert({
      name: item.name.trim(),
      category: item.category,
      price: Number(item.price),
      image_url: item.image_url,
      description: item.description,
      is_available: item.is_available,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database Error (${error.code}): ${error.message}`);
  }
  return data;
}

/**
 * Admin: Mengedit menu di tabel 'menu_items'
 */
export async function updateMenuItemInSupabase(
  id: string | number,
  updates: Record<string, any>
): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum aktif.');

  const safeUpdates: Record<string, any> = {};

  if (updates.name !== undefined) {
    safeUpdates.name = String(updates.name).trim();
  }

  if (updates.category !== undefined) {
    safeUpdates.category = updates.category;
  }

  if (updates.price !== undefined) {
    safeUpdates.price = Number(updates.price);
  }

  if (updates.image_url !== undefined) {
    safeUpdates.image_url = updates.image_url;
  }

  if (updates.description !== undefined) {
    safeUpdates.description = updates.description;
  }

  if (updates.is_available !== undefined) {
    safeUpdates.is_available = Boolean(updates.is_available);
  }

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error('Tidak ada perubahan data menu.');
  }

  const { data, error } = await client
    .from('menu_items')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Database Error (${error.code}): ${error.message}`);
  }

  return data;
}
/**
 * Admin: Menghapus menu dari tabel 'menu_items'
 */
export async function deleteMenuItemInSupabase(id: string | number): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum aktif.');

  const { error } = await client.from('menu_items').delete().eq('id', id);
  if (error) {
    throw new Error(`Database Error (${error.code}): ${error.message}`);
  }
}

/**
 * Admin: Mengubah status meja di 'restaurant_tables'
 */
export async function updateTableInSupabase(
  tableNumber: number,
  updates: Record<string, any>
): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum aktif.');

  const safeUpdates: Record<string, any> = {};

  if (updates.table_name !== undefined) {
    safeUpdates.table_name = String(updates.table_name).trim();
  }

  if (updates.is_active !== undefined) {
    safeUpdates.is_active = Boolean(updates.is_active);
  }

  if (Object.keys(safeUpdates).length === 0) {
    throw new Error('Tidak ada perubahan data meja.');
  }

  const { data, error } = await client
    .from('restaurant_tables')
    .update(safeUpdates)
    .eq('table_number', tableNumber)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Database Error (${error.code}): ${error.message}`);
  }

  return data;
}

/**
 * Admin / Kasir: Mengubah status pesanan di tabel 'orders'
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus
): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum aktif.');

  const statusMap: Record<string, string> = {
    menunggu: 'new',
    diproses: 'processing',
    siap: 'ready',
    selesai: 'completed',
    dibatalkan: 'cancelled',
  };

  const databaseStatus = statusMap[status];

  if (!databaseStatus) {
    throw new Error('Status pesanan tidak dikenal.');
  }

  const { data, error } = await client
    .from('orders')
    .update({ status: databaseStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Database Error (${error.code}): ${error.message}`);
  }

  return data;
}

/**
 * Kasir: Mencatat pembayaran pesanan di tabel 'orders'
 */
export async function recordOrderPaymentInSupabase(
  orderId: string,
  method: PaymentMethod,
  cashReceived?: number,
  cashChange?: number
): Promise<any> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client belum aktif.');

  const { data, error } = await client
    .from('orders')
    .update({
      payment_status: 'lunas',
      payment_method: method,
      cash_received: cashReceived,
      cash_change: cashChange,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Database Error (${error.code}): ${error.message}`);
  }
  return data;
}
