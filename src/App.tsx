import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  Phone,
  CheckCircle2,
  ChevronRight,
  Shield,
  UserCheck,
  Flame,
  Coffee,
  Soup,
  Cookie,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MenuCard } from './components/MenuCard';
import { CartDrawer } from './components/CartDrawer';
import { TableSelectorModal } from './components/TableSelectorModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { ReceiptModal } from './components/ReceiptModal';
import { KasirView } from './components/KasirView';
import { AdminView } from './components/AdminView';
import { LoginModal } from './components/LoginModal';
import { SupabaseTester } from './components/SupabaseTester';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import {
  MenuItem,
  CartItem,
  Order,
  RestaurantTable,
  UserRole,
  OrderStatus,
  PaymentMethod,
  MenuCategory,
  StaffProfile,
} from './types';
import { RESTAURANT_INFO } from './data/initialData';
import {
  getMenus,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOrders,
  createOrder,
  updateOrder,
  getTables,
  updateTable,
  getSavedCart,
  saveCart,
  clearCart,
  getSavedCustomerOrders,
  getSavedTable,
  saveSelectedTable,
  getSavedCustomerName,
  saveCustomerName,
  checkSupabaseStatus,
  formatRupiah,
} from './services/api';
import { getStoredStaffProfile, signOutStaff } from './services/supabaseClient';

export default function App() {
  // App state
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(getSavedCart());
  const [selectedTable, setSelectedTable] = useState<number>(getSavedTable());
  const [customerName, setCustomerName] = useState<string>(getSavedCustomerName());
  const [currentRole, setCurrentRole] = useState<UserRole>('pelanggan');
  const [loggedStaffProfile, setLoggedStaffProfile] = useState<StaffProfile | null>(getStoredStaffProfile());
  const [supabaseStatus, setSupabaseStatus] = useState({
    isConfigured: false,
    hasSecretKey: false,
    hasUrl: false,
    storageMode: 'Memeriksa...',
  });

  // UI state
  const [activeBottomTab, setActiveBottomTab] = useState<'menu' | 'tables' | 'orders' | 'management'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [loginTargetRole, setLoginTargetRole] = useState<'admin' | 'kasir'>('kasir');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshSupabaseData = async () => {
    try {
      const [fetchedMenus, fetchedTables, sbStatus, freshOrders] = await Promise.all([
        getMenus(),
        getTables(),
        checkSupabaseStatus(),
        getOrders(),
      ]);
      setMenus(fetchedMenus);
      setTables(fetchedTables);
      setSupabaseStatus(sbStatus);
      setOrders(freshOrders);
    } catch {}
  };

  const refreshOrdersData = async () => {
    try {
      const freshOrders = await getOrders();
      setOrders(freshOrders);
    } catch {}
  };

  // Show quick toast notification on Android
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Initial data loading
  useEffect(() => {
    async function initData() {
      const [fetchedMenus, fetchedTables, fetchedOrders, sbStatus] = await Promise.all([
        getMenus(),
        getTables(),
        getOrders(),
        checkSupabaseStatus(),
      ]);

      setMenus(fetchedMenus);
      setTables(fetchedTables);
      setOrders(fetchedOrders);
      setSupabaseStatus(sbStatus);
      setCustomerOrders(getSavedCustomerOrders());
    }
    initData();
  }, []);

  // Polling for live order updates (Kasir & Kitchen synchronization)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [freshOrders, freshTables] = await Promise.all([getOrders(), getTables()]);
        setOrders(freshOrders);
        setTables(freshTables);

        // Update customer orders status if any changed
        const mySaved = getSavedCustomerOrders();
        if (mySaved.length > 0) {
          const updatedMyOrders = mySaved.map((local) => {
            const foundInServer = freshOrders.find((s) => s.id === local.id);
            return foundInServer || local;
          });
          setCustomerOrders(updatedMyOrders);
        }
      } catch (e) {
        // quiet
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Save cart changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Save selected table changes
  const handleSelectTable = (tableNum: number) => {
    setSelectedTable(tableNum);
    saveSelectedTable(tableNum);
    showToast(`Meja ${String(tableNum).padStart(2, '0')} berhasil dipilih`);
  };

  // Save customer name changes
  const handleSetCustomerName = (name: string) => {
    setCustomerName(name);
    saveCustomerName(name);
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    showToast(`Ditambahkan: ${item.name}`);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((c) => c.menuItem.id !== itemId);
      }
      return prev.map((c) =>
        c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    if (delta > 0) {
      const target = menus.find((m) => m.id === itemId);
      if (target) handleAddToCart(target);
    } else {
      handleRemoveFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    clearCart();
    showToast('Keranjang telah dikosongkan');
  };

  // Submit order from customer
  const handleSubmitOrder = async (payload: {
    customerName: string;
    tableNumber: number;
    notes: string;
    items: CartItem[];
  }): Promise<Order | null> => {
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const orderItems = payload.items.map((i) => ({
      menu_id: i.menuItem.id,
      name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
      image_url: i.menuItem.image_url,
    }));

    const newOrder = await createOrder({
      customer_name: payload.customerName,
      table_number: payload.tableNumber,
      customer_notes: payload.notes,
      subtotal,
      total: subtotal,
      items: orderItems,
    });

    if (newOrder) {
      setOrders((prev) => [newOrder, ...prev]);
      setCustomerOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      // update table
      setTables((prev) =>
        prev.map((t) =>
          t.table_number === payload.tableNumber
            ? { ...t, status: 'terisi', current_customer_name: payload.customerName }
            : t
        )
      );
      return newOrder;
    }
    return null;
  };

  // Role switching
  const handleSelectRole = (role: UserRole) => {
    if (role === 'pelanggan') {
      setCurrentRole('pelanggan');
      setActiveBottomTab('menu');
      showToast('Beralih ke Mode Pelanggan');
      return;
    }

    // Role security check: verify against staff_profiles
    const currentStaff = loggedStaffProfile || getStoredStaffProfile();
    const staffRole = (currentStaff?.role || '').toLowerCase();
    const isAdmin = staffRole === 'admin' || staffRole === 'superadmin' || staffRole === 'manager';
    const isKasir = staffRole === 'kasir' || staffRole === 'cashier' || staffRole === 'staff';

    if (role === 'admin') {
      if (currentStaff && isAdmin) {
        setCurrentRole('admin');
        setActiveBottomTab('management');
        showToast(`Selamat datang kembali, ${currentStaff.full_name || 'Admin'}!`);
      } else {
        setLoginTargetRole('admin');
        setIsLoginModalOpen(true);
      }
    } else if (role === 'kasir') {
      if (currentStaff && isKasir) {
        setCurrentRole('kasir');
        setActiveBottomTab('management');
        showToast(`Selamat datang kembali, ${currentStaff.full_name || 'Kasir'}!`);
      } else {
        setLoginTargetRole('kasir');
        setIsLoginModalOpen(true);
      }
    }
  };

  const handleLoginSuccess = (role: UserRole, profile?: StaffProfile) => {
    setCurrentRole(role);
    if (profile) {
      setLoggedStaffProfile(profile);
    }
    if (role === 'kasir' || role === 'admin') {
      setActiveBottomTab('management');
    }
    showToast(`Berhasil login sebagai ${role.toUpperCase()}`);
  };

  const handleLogoutStaff = async () => {
    await signOutStaff();
    setLoggedStaffProfile(null);
    setCurrentRole('pelanggan');
    setActiveBottomTab('menu');
    showToast('Telah keluar dari akun staf');
  };

  // Kasir actions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateOrder(orderId, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Status pesanan diubah ke: ${status.toUpperCase()}`);
    } catch (err) {
      showToast('Gagal mengubah status');
    }
  };

  const handleRecordPayment = async (
    orderId: string,
    method: PaymentMethod,
    cashReceived?: number,
    cashChange?: number
  ) => {
    try {
      const updated = await updateOrder(orderId, {
        payment_status: 'lunas',
        payment_method: method,
        cash_received: cashReceived,
        cash_change: cashChange,
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast('Pembayaran berhasil dicatat. Status: LUNAS');
    } catch (err) {
      showToast('Gagal mencatat pembayaran');
    }
  };

  // Admin actions
  const handleAddMenu = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const created = await addMenuItem(item);
      if (created && created.id) {
        setMenus((prev) => [created, ...(prev || []).filter((m) => m && String(m.id) !== String(created.id))]);
        showToast('Menu baru berhasil ditambahkan');
      }
    } catch (e) {
      console.error('Error adding menu:', e);
    }
  };

  const handleUpdateMenu = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const updated = await updateMenuItem(id, updates);
      setMenus((prev) =>
        (prev || [])
          .filter(Boolean)
          .map((m) => {
            if (String(m.id) === String(id)) {
              return updated && updated.id ? { ...m, ...updated } : { ...m, ...updates };
            }
            return m;
          })
      );
      showToast('Menu berhasil diperbarui');
    } catch (e) {
      console.error('Error updating menu:', e);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    try {
      await deleteMenuItem(id);
      setMenus((prev) => (prev || []).filter((m) => m && String(m.id) !== String(id)));
      showToast('Menu berhasil dihapus');
    } catch (e) {
      console.error('Error deleting menu:', e);
    }
  };

  const handleUpdateTable = async (tableNum: number, updates: Partial<RestaurantTable>) => {
    try {
      const updated = await updateTable(tableNum, updates);
      setTables((prev) =>
        (prev || []).map((t) => (Number(t.table_number) === Number(tableNum) ? (updated || { ...t, ...updates }) : t))
      );
      showToast(`Meja ${String(tableNum).padStart(2, '0')} diperbarui`);
    } catch (e) {
      console.error('Error updating table:', e);
    }
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return (menus || [])
      .filter((item): item is MenuItem => Boolean(item && item.id))
      .filter((item) => {
        if (selectedCategory !== 'semua' && item.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            (item.name || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [menus, selectedCategory, searchQuery]);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-100/60 pb-24 sm:pb-12 text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        selectedTable={selectedTable}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={customerOrders.length}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: KASIR PANEL */}
        {currentRole === 'kasir' ? (
          <KasirView
            orders={orders}
            tables={tables}
            kasirProfile={loggedStaffProfile}
            onRefreshOrders={refreshOrdersData}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRecordPayment={handleRecordPayment}
            onViewReceipt={(ord) => {
              setReceiptOrder(ord);
              setIsReceiptOpen(true);
            }}
            onLogout={handleLogoutStaff}
          />
        ) : currentRole === 'admin' ? (
          /* VIEW 2: ADMIN PANEL */
          <AdminView
            menus={menus}
            tables={tables}
            orders={orders}
            adminProfile={loggedStaffProfile}
            onAddMenu={handleAddMenu}
            onUpdateMenu={handleUpdateMenu}
            onDeleteMenu={handleDeleteMenu}
            onUpdateTable={handleUpdateTable}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onViewReceipt={(ord) => {
              setReceiptOrder(ord);
              setIsReceiptOpen(true);
            }}
            supabaseStatus={supabaseStatus}
            onLogout={handleLogoutStaff}
          />
        ) : activeBottomTab === 'tables' ? (
          /* VIEW 3: MEJA VIEW FOR CUSTOMER */
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm text-center">
              <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                Pilihan Meja Pelanggan
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                Anda Sedang di Meja {String(selectedTable).padStart(2, '0')}
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Silakan pilih atau ganti meja tempat Anda duduk di WAROENG BPJS (Meja 01 sampai 15).
              </p>

              <button
                onClick={() => setIsTableModalOpen(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs active:scale-95 transition-all shadow cursor-pointer"
              >
                Ganti Meja Duduk
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {tables.map((t) => (
                <div
                  key={t.table_number}
                  onClick={() => handleSelectTable(t.table_number)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedTable === t.table_number
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md font-bold'
                      : t.status === 'terisi'
                      ? 'bg-stone-200 text-stone-600 border-stone-300'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <span className="text-[10px] block opacity-75">Meja</span>
                  <span className="text-2xl font-black font-mono">
                    {String(t.table_number).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] block mt-1">
                    {selectedTable === t.table_number
                      ? '✓ Meja Anda'
                      : t.status === 'terisi'
                      ? 'Terisi'
                      : 'Kosong'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeBottomTab === 'orders' ? (
          /* VIEW 4: CUSTOMER ORDERS VIEW */
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900">Riwayat Pesanan Anda</h2>
                <p className="text-xs text-stone-500">
                  Daftar pesanan Anda di WAROENG BPJS Cianjur
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Buka Layar Penuh
              </button>
            </div>

            {customerOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 text-stone-300 stroke-1" />
                <p className="text-sm font-bold text-stone-700">Belum Ada Pesanan</p>
                <p className="text-xs text-stone-400 mt-1">
                  Pesan makanan lezat favorit Anda dari menu sekarang!
                </p>
                <button
                  onClick={() => setActiveBottomTab('menu')}
                  className="mt-4 px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow"
                >
                  Lihat Menu Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {ord.order_number} (Meja {String(ord.table_number).padStart(2, '0')})
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          ord.payment_status === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.payment_status === 'lunas' ? 'Lunas' : 'Belum Bayar (Kasir)'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      {(ord.items || []).filter(Boolean).map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {i.quantity}x {i.name || 'Item'}
                          </span>
                          <span className="font-mono">{formatRupiah((i.price || 0) * (i.quantity || 1))}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-amber-600">
                        Total: {formatRupiah(ord.total)}
                      </span>
                      <button
                        onClick={() => {
                          setReceiptOrder(ord);
                          setIsReceiptOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
                      >
                        Lihat Struk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* VIEW 5: CUSTOMER MENU BROWSER (MAIN FEED) */
          <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">
            {/* Hero Welcome Card */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white p-6 sm:p-8 shadow-xl border border-stone-800">
              <div className="relative z-10 max-w-xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold tracking-wide">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Warung Kuliner Khas Cianjur Sukaluyu</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Makan Enak, Porsi Mantap, <span className="text-amber-400">Harga Sahabat!</span>
                </h1>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Pesan langsung dari tempat duduk Anda di{' '}
                  <strong className="text-amber-400 underline cursor-pointer" onClick={() => setIsTableModalOpen(true)}>
                    Meja {String(selectedTable).padStart(2, '0')}
                  </strong>
                  . Nikmati sajian ayam bakar, nasi liwet, aneka masakan khas & minuman segar Sukaluyu.
                </p>

                {/* Quick Info Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-stone-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Desa Tanjungsari, Cianjur</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Buka 10.00 – 22.00 WIB</span>
                  </div>
                </div>
              </div>

              {/* Decorative Subtle Background Glow */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            </section>

            {/* Sticky/Smooth Filter & Search Bar */}
            <div className="space-y-3 sticky top-16 z-20 bg-stone-100/90 backdrop-blur-md pt-2 pb-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari makanan atau minuman favorit..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills (Horizontal Touch Scroller) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'semua', label: 'Semua Menu', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
                  { id: 'paket', label: 'Paket Komplit', icon: <Flame className="w-3.5 h-3.5" /> },
                  { id: 'makanan', label: 'Makanan Utama', icon: <Soup className="w-3.5 h-3.5" /> },
                  { id: 'camilan', label: 'Camilan & Gorengan', icon: <Cookie className="w-3.5 h-3.5" /> },
                  { id: 'minuman', label: 'Minuman Segar', icon: <Coffee className="w-3.5 h-3.5" /> },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as MenuCategory)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider">
                  {selectedCategory === 'semua'
                    ? 'Daftar Menu'
                    : selectedCategory === 'paket'
                    ? 'Paket Komplit'
                    : selectedCategory === 'makanan'
                    ? 'Makanan Utama'
                    : selectedCategory === 'camilan'
                    ? 'Camilan & Gorengan'
                    : 'Minuman Segar'}{' '}
                  ({filteredMenuItems.length} menu)
                </span>

                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Riwayat Pesanan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400">
                  <Search className="w-12 h-12 mx-auto mb-2 text-stone-300 stroke-1" />
                  <p className="text-sm font-bold text-stone-700">Menu tidak ditemukan</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Coba kata kunci lain atau pilih kategori lain.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {filteredMenuItems.map((item) => {
                    const cartItem = cart.find((c) => c.menuItem.id === item.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    return (
                      <MenuCard
                        key={item.id}
                        item={item}
                        quantity={qty}
                        onAdd={handleAddToCart}
                        onRemove={handleRemoveFromCart}
                        onOpenDetail={() => handleAddToCart(item)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (if items in cart on mobile & in customer mode) */}
      {currentRole === 'pelanggan' && cartTotalCount > 0 && (
        <div className="fixed bottom-18 sm:bottom-6 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black rounded-2xl shadow-xl flex items-center justify-between active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-bold text-xs shadow-inner">
                {cartTotalCount}
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs block font-bold uppercase tracking-wider text-stone-900/80">
                  Meja {String(selectedTable).padStart(2, '0')}
                </span>
                <span className="text-sm font-black">Lihat Keranjang</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black tabular-nums">
                {formatRupiah(cartTotalPrice)}
              </span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Android Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeBottomTab}
        setActiveTab={(tab) => {
          setActiveBottomTab(tab);
          if (tab === 'management' && currentRole === 'pelanggan') {
            setLoginTargetRole('kasir');
            setIsLoginModalOpen(true);
          }
        }}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentRole={currentRole}
        selectedTable={selectedTable}
        pendingOrdersCount={
          currentRole === 'kasir'
            ? orders.filter((o) => o.payment_status === 'belum_bayar').length
            : customerOrders.filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan').length
        }
      />

      {/* Android Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        selectedTable={selectedTable}
        onSelectTable={handleSelectTable}
        customerName={customerName}
        setCustomerName={handleSetCustomerName}
        tables={tables}
        onSubmitOrder={handleSubmitOrder}
        onOrderSuccess={(order) => {
          setLastPlacedOrder(order);
          setIsOrderSuccessOpen(true);
          setReceiptOrder(order);
        }}
      />

      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        selectedTable={selectedTable}
        onSelectTable={handleSelectTable}
        tables={tables}
      />

      <OrderSuccessModal
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        order={lastPlacedOrder}
        onViewReceipt={(ord) => {
          setReceiptOrder(ord);
          setIsReceiptOpen(true);
        }}
      />

      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={customerOrders}
        onRefresh={async () => {
          const fresh = await getOrders();
          setOrders(fresh);
          const mySaved = getSavedCustomerOrders();
          const merged = mySaved.map((s) => fresh.find((f) => f.id === s.id) || s);
          setCustomerOrders(merged);
          showToast('Status pesanan telah disegarkan');
        }}
        onViewReceipt={(ord) => {
          setReceiptOrder(ord);
          setIsReceiptOpen(true);
        }}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={receiptOrder}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        targetRole={loginTargetRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Supabase Diagnostic & Connection Tester Modal */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
            onClick={() => setIsSupabaseModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-4 sm:p-6 z-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <span className="text-xs font-mono font-bold uppercase text-stone-500">
                Pusat Pengujian Supabase
              </span>
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <SupabaseTester />
          </div>
        </div>
      )}
    </div>
  );
  }
