
import React from 'react';
import {
  X,
  Clock,
  Receipt,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../services/api';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onRefresh: () => void;
  onViewReceipt: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onRefresh,
  onViewReceipt,
}) => {
  if (!isOpen) return null;

  const paymentLabel = (status: string) => {
    if (status === 'lunas') return 'Lunas';
    return 'Belum Bayar';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Riwayat Pesanan</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Muat ulang riwayat"
              className="rounded-lg p-2 text-amber-700 hover:bg-amber-50"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup riwayat"
              className="rounded-lg p-2 hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
                      Pesanan #{order.order_number || order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {order.customer_name} · Meja {order.table_number}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.payment_status === 'lunas'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {paymentLabel(order.payment_status)}
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

                <button
                  type="button"
                  onClick={() => onViewReceipt(order)}
                  className="mt-3 w-full rounded-xl bg-stone-900 p-3 text-sm font-bold text-white"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Lihat Struk
                  </span>
                </button>
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
