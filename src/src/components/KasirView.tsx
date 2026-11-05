
import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Receipt,
  RefreshCw,
  ShoppingBag,
  LogOut,
  ClipboardList,
  CreditCard,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  RestaurantTable,
  StaffProfile,
} from '../types';
import { formatRupiah } from '../services/api';

interface KasirViewProps {
  orders: Order[];
  tables: RestaurantTable[];
  kasirProfile: StaffProfile | null;
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onRecordPayment: (
    orderId: string,
    method: PaymentMethod,
    cashReceived?: number,
    cashChange?: number
  ) => void;
  onViewReceipt: (order: Order) => void;
  onLogout: () => void;
}

export const KasirView: React.FC<KasirViewProps> = ({
  orders,
  tables,
  kasirProfile,
  onRefreshOrders,
  onUpdateOrderStatus,
  onRecordPayment,
  onViewReceipt,
  onLogout,
}) => {
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('tunai');
  const [cashReceived, setCashReceived] = useState('');

  const pendingOrders = orders.filter(
    (order) => order.payment_status === 'belum_bayar'
  );

  const paidOrders = orders.filter(
    (order) => order.payment_status === 'lunas'
  );

  const handlePayment = () => {
    if (!paymentOrder) return;

    const received = Number(cashReceived);
    const total = Number(paymentOrder.total);

    if (paymentMethod === 'tunai' && received < total) {
      alert('Uang yang diterima kurang dari total pembayaran.');
      return;
    }

    const change =
      paymentMethod === 'tunai' ? received - total : undefined;

    onRecordPayment(
      paymentOrder.id,
      paymentMethod,
      paymentMethod === 'tunai' ? received : undefined,
      change
    );

    setPaymentOrder(null);
    setCashReceived('');
    setPaymentMethod('tunai');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Dashboard Kasir
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {kasirProfile?.full_name || kasirProfile?.email || 'Kasir'}
          </p>
          <p className="text-xs text-stone-500">
            {tables.length} meja terdaftar
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefreshOrders}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl bg-stone-800 px-3 py-2 text-sm font-semibold text-white"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
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
          <div className="rounded-2xl border border-dashed p-8 text-center text-stone-400">
            <ShoppingBag className="mx-auto mb-2 h-10 w-10" />
            Belum ada pesanan yang menunggu pembayaran.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h3 className="font-bold">
                      {order.order_number || `Pesanan #${order.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {order.customer_name} · Meja {order.table_number}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    Belum Bayar
                  </span>
                </div>

                <div className="my-3 space-y-2 border-y py-3">
                  {order.items?.map((item, index) => (
                    <div key={`${order.id}-${index}`} className="flex justify-between gap-3 text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
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

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'diproses')}
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                    >
                      Diproses
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOrder(order)}
                      className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white"
                    >
                      Bayar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <ClipboardList className="h-5 w-5" />
          Riwayat Pembayaran Lunas
        </h2>

        {paidOrders.length === 0 ? (
          <p className="rounded-xl bg-stone-100 p-4 text-center text-sm text-stone-500">
            Belum ada pembayaran lunas.
          </p>
        ) : (
          <div className="space-y-2">
            {paidOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
                <div>
                  <p className="font-bold">{order.order_number}</p>
                  <p className="text-sm text-stone-500">
                    Meja {order.table_number} · {order.customer_name}
                  </p>
                  <p className="font-bold text-green-700">
                    {formatRupiah(order.total)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewReceipt(order)}
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

      {paymentOrder && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Pembayaran Kasir</h2>
              <button
                type="button"
                onClick={() => setPaymentOrder(null)}
                aria-label="Tutup pembayaran"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <p className="text-sm text-stone-500">
              {paymentOrder.order_number}
            </p>
            <p className="text-2xl font-extrabold text-amber-600">
              {formatRupiah(paymentOrder.total)}
            </p>

            <label className="block text-sm font-semibold">
              Metode pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-xl border p-3"
            >
              <option value="tunai">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="debit">Debit</option>
              <option value="transfer">Transfer</option>
            </select>

            {paymentMethod === 'tunai' && (
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Uang diterima (Rp)
                </label>
                <input
                  type="number"
                  min={paymentOrder.total}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Masukkan jumlah uang"
                  className="w-full rounded-xl border p-3"
                />
                {cashReceived !== '' && Number(cashReceived) >= paymentOrder.total && (
                  <p className="mt-2 text-sm font-semibold text-green-700">
                    Kembalian: {formatRupiah(Number(cashReceived) - paymentOrder.total)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentOrder(null)}
                className="flex-1 rounded-xl border p-3 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={paymentMethod === 'tunai' && Number(cashReceived) < paymentOrder.total}
                className="flex-1 rounded-xl bg-green-600 p-3 font-bold text-white disabled:opacity-50"
              >
                <CreditCard className="mr-1 inline h-4 w-4" />
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
