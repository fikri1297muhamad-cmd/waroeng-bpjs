import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { formatRupiah } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onAdd,
  onRemove,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <ShoppingBag className="w-12 h-12 mb-3" />
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b pb-4"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-stone-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-amber-600 font-bold text-sm">
                      {formatRupiah(item.price * item.quantity)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onRemove(item.id)}
                        aria-label="Kurangi jumlah"
                        className="p-1 rounded bg-stone-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onAdd(item)}
                        aria-label="Tambah jumlah"
                        className="p-1 rounded bg-amber-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      for (let i = 0; i < item.quantity; i++) {
                        onRemove(item.id);
                      }
                    }}
                    aria-label="Hapus item"
                    className="p-2 text-rose-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
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
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-bold disabled:opacity-40"
          >
            Lanjutkan Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};
