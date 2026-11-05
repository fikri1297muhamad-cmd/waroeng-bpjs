import React, { useState } from 'react';
import { X, Utensils, User, Hash } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tableNumber: string, customerName: string) => void;
  initialTable?: string;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialTable = '',
}) => {
  const [tableNumber, setTableNumber] = useState(initialTable);
  const [customerName, setCustomerName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber || !customerName.trim()) {
      alert('Nomor meja dan nama pelanggan wajib diisi.');
      return;
    }

    onConfirm(tableNumber, customerName.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Data Pemesanan</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4" />
              Nomor Meja
            </label>

            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              className="w-full rounded-xl border border-stone-300 bg-white p-3"
            >
              <option value="">Pilih nomor meja</option>
              {Array.from({ length: 100 }, (_, index) => {
                const number = String(index + 1).padStart(2, '0');
                return (
                  <option key={number} value={number}>
                    Meja {number}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              Nama Pelanggan
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Masukkan nama Anda"
              className="w-full rounded-xl border border-stone-300 p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 p-3 font-bold text-stone-950 hover:bg-amber-400"
          >
            Lanjutkan
          </button>

          <p className="text-center text-xs text-stone-500">
            Pembayaran dilakukan di kasir.
          </p>
        </form>
      </div>
    </div>
  );
};
