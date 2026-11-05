import React from 'react';
import { X, Clock, Receipt, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../services/api';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Riwayat Pesanan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat"
            className="rounded-lg p-2 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-stone-400">
              <ShoppingBag className="mb-3 h-12 w-12" />
              <p>Belum ada riwayat pesanan.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-stone-900">
                      Pesanan #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Meja {order.table_number}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {order.payment_status || 'Belum Bayar'}
                  </span>
                </div>

                <div className="my-3 flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="h-4 w-4" />
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </div>

                <div className="space-y-2 border-t border-stone-100 pt-3">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-stone-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between border-t border-stone-100 pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-extrabold text-amber-600">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-stone-900 p-3 font-bold text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
