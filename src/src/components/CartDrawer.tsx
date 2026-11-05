import React, { useState } from 'react';
import {
  X, Plus, Minus, ShoppingBag, Trash2, Utensils
} from 'lucide-react';
import { CartItem, Order, RestaurantTable } from '../types';
import { formatRupiah } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  selectedTable: number;
  onSelectTable: (tableNum: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tables: RestaurantTable[];
  onSubmitOrder: (payload: {
    customerName: string;
    tableNumber: number;
    notes: string;
    items: CartItem[];
  }) => Promise<Order | null>;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedTable,
  onSelectTable,
  customerName,
  setCustomerName,
  tables,
  onSubmitOrder,
  onOrderSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const total = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError('Masukkan nama pelanggan terlebih dahulu.');
      return;
    }

    if (!selectedTable) {
      setError('Silakan pilih meja terlebih dahulu.');
      return;
    }

    if (cart.length === 0) {
      setError('Keranjang masih kosong.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const order = await onSubmitOrder({
        customerName: customerName.trim(),
        tableNumber: selectedTable,
        notes,
        items: cart,
      });

      if (order) {
        onOrderSuccess(order);
        onClose();
      } else {
        setError('Pesanan gagal disimpan. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">Keranjang Pesanan</h2>
          </div>
          <button onClick={onClose} aria-label="Tutup keranjang">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Nama Pelanggan
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full border rounded-xl p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Pilih Nomor Meja
            </label>
            <select
              value={selectedTable}
              onChange={(e) => onSelectTable(Number(e.target.value))}
              className="w-full border rounded-xl p-3 text-sm bg-white"
            >
              {tables.map((table) => (
                <option key={table.table_number} value={table.table_number}>
                  Meja {String(table.table_number).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Daftar Pesanan</h3>
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-600 font-bold"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-stone-400">
                <Utensils className="w-10 h-10 mx-auto mb-2" />
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex gap-3 border-b pb-4"
                  >
                    {item.menuItem.image_url ? (
                      <img
                        src={item.menuItem.image_url}
                        alt={item.menuItem.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-stone-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-amber-600 font-bold text-sm">
                        {formatRupiah(item.menuItem.price * item.quantity)}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.menuItem.id, -1)
                          }
                          className="p-1 rounded bg-stone-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.menuItem.id, 1)
                          }
                          className="p-1 rounded bg-amber-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.menuItem.id)}
                      className="p-2 text-rose-500"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Catatan Pesanan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: tidak pedas"
              className="w-full border rounded-xl p-3 text-sm"
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 font-semibold">{error}</p>
          )}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">Total Pesanan</span>
            <span className="text-xl font-extrabold text-amber-600">
              {formatRupiah(total)}
            </span>
          </div>

          <p className="text-xs text-stone-500 mb-3">
            Pembayaran dilakukan langsung di kasir.
          </p>

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || submitting}
            className="w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-bold disabled:opacity-40"
          >
            {submitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan'}
          </button>
        </div>
      </div>
    </div>
  );
};
