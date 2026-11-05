export type MenuCategory = 'semua' | 'paket' | 'makanan' | 'camilan' | 'minuman';

export interface MenuItem {
  id: string;
  name: string;
  category: 'paket' | 'makanan' | 'camilan' | 'minuman';
  price: number;
  image_url: string;
  description: string;
  is_available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'menunggu' | 'diproses' | 'siap' | 'selesai' | 'dibatalkan';
export type PaymentStatus = 'belum_bayar' | 'lunas';
export type PaymentMethod = 'tunai' | 'qris' | 'debit' | 'transfer';

export interface OrderItem {
  id?: string;
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  table_number: number; // 1 to 15
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod | null;
  subtotal: number;
  total: number;
  cash_received?: number;
  cash_change?: number;
  customer_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

