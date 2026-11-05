import React from 'react';
import {
  Clock,
  CheckCircle2,
  Receipt,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../services/api';

interface KasirViewProps {
  orders: Order[];
  onMarkPaid: (orderId: string) => void;
  onRefresh?: () => void;
  onShowReceipt?: (order: Order) => void;
}

export const KasirView: React.FC<KasirViewProps> = ({
  orders,
  onMarkPaid,
  onRefresh,
  onShowReceipt,
}) => {
  const pendingOrders = orders.filter(
    (order) => order.payment_status !== 'Lunas'
  );

  const paidOrders = orders.filter(
    (order) => order.payment_status === 'Lunas'
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Dashboard Kasir
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Kelola pesanan dan pembayaran pelanggan.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">Belum Dibayar</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-800">
            {pendingOrders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Sudah Lunas</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-green-800">
            {paidOrders.length}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-stone-900">
          Pesanan Menunggu Pembayaran
        </h2>

        {pendingOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400">
            <ShoppingBag className="mx-auto mb-2 h-10 w-10" />
            <p>Belum ada pesanan yang menunggu pembayaran.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-stone-900">
                      Pesanan #{order.id.slice(0, 8)}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      Meja {order.table_number}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    Belum Bayar
                  </span>
                </div>

                <div className="my-3 space-y-2 border-y border-stone-100 py-3">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-stone-500">Total pembayaran</p>
                    <p className="text-lg font-extrabold text-amber-600">
                      {formatRupiah(order.total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onMarkPaid(order.id)}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    Tandai Lunas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-stone-900">
          Riwayat Pembayaran Lunas
        </h2>

        {paidOrders.length === 0 ? (
          <p className="rounded-xl bg-stone-100 p-4 text-center text-sm text-stone-500">
            Belum ada pembayaran lunas.
          </p>
        ) : (
          <div className="space-y-2">
            {paidOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4"
              >
                <div>
                  <p className="font-bold">
                    Pesanan #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-stone-500">
                    Meja {order.table_number}
                  </p>
                  <p className="font-bold text-green-700">
                    {formatRupiah(order.total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onShowReceipt?.(order)}
                  className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm font-semibold"
                >
                  <Receipt className="h-4 w-4" />
                  Bukti
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
