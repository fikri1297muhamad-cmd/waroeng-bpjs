import React from 'react';
import { X, Receipt, Printer, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../services/api';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold">Bukti Pembayaran</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="receipt-content" className="p-5 text-stone-800">
          <div className="text-center">
            <h1 className="text-xl font-extrabold">WAROENG BPJS</h1>
            <p className="mt-1 text-xs text-stone-500">
              jl kandangsapi 001/002 No 01
              <br />
              Desa Tanjungsari, Kecamatan Sukaluyu
              <br />
              Kabupaten Cianjur
            </p>
            <div className="my-4 border-t border-dashed border-stone-300" />
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">Pembayaran Lunas</span>
            </div>
          </div>

          <div className="my-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-stone-500">Nomor pesanan</span>
              <span className="font-semibold">{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-stone-500">Nomor meja</span>
              <span className="font-semibold">{order.table_number}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-stone-500">Tanggal</span>
              <span className="font-semibold">
                {new Date(order.created_at).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="border-y border-dashed border-stone-300 py-3">
            {order.items?.map((item, index) => (
              <div key={index} className="mb-2 flex justify-between gap-3 text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-3 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>

          <p className="mt-5 text-center text-xs text-stone-500">
            Terima kasih telah berbelanja di Waroeng BPJS.
          </p>
        </div>

        <div className="flex gap-2 border-t p-4 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 p-3 font-bold text-stone-950"
          >
            <Printer className="h-4 w-4" />
            Cetak
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-100 px-4 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
