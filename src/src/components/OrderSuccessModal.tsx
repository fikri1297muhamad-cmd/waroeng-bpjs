import React from 'react';
import {
  CheckCircle2,
  X,
  Receipt,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../services/api';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onShowReceipt?: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  order,
  onShowReceipt,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex justify-end p-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

          <h2 className="mt-4 text-2xl font-extrabold text-stone-900">
            Pesanan Berhasil!
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Pesanan Anda sudah diterima. Silakan lakukan pembayaran di kasir.
          </p>

          <div className="my-5 rounded-xl bg-stone-50 p-4 text-left">
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-stone-500">Nomor pesanan</span>
              <span className="font-bold">
                #{order.id.slice(0, 8)}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-2 text-sm">
              <span className="text-stone-500">Nomor meja</span>
              <span className="font-bold">{order.table_number}</span>
            </div>

            <div className="mt-2 flex justify-between gap-2 text-sm">
              <span className="text-stone-500">Status pembayaran</span>
              <span className="font-bold text-amber-600">
                Belum Bayar
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-2 border-t border-stone-200 pt-3">
              <span className="font-semibold">Total pesanan</span>
              <span className="text-lg font-extrabold text-amber-600">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {onShowReceipt && (
              <button
                type="button"
                onClick={() => onShowReceipt(order)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 p-3 font-semibold"
              >
                <Receipt className="h-4 w-4" />
                Lihat Detail Pesanan
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 p-3 font-bold text-stone-950"
            >
              <ShoppingBag className="h-4 w-4" />
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
