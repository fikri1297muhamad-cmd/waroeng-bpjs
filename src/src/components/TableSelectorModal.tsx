
import React from 'react';
import { X, Utensils, Hash } from 'lucide-react';
import { RestaurantTable } from '../types';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: number;
  onSelectTable: (tableNum: number) => void;
  tables: RestaurantTable[];
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTable,
  onSelectTable,
  tables,
}) => {
  if (!isOpen) return null;

  const handleSelect = (tableNumber: number) => {
    onSelectTable(tableNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Pilih Meja</h2>
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

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <Hash className="h-4 w-4" />
            Nomor Meja
          </div>

          {tables.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">
              Data meja belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto">
              {tables.map((table) => {
                const number = Number(table.table_number);
                const selected = selectedTable === number;

                return (
                  <button
                    key={table.table_number}
                    type="button"
                    onClick={() => handleSelect(number)}
                    className={`rounded-xl border p-3 font-bold text-sm ${
                      selected
                        ? 'bg-amber-500 border-amber-600 text-stone-950'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400'
                    }`}
                  >
                    {String(number).padStart(2, '0')}
                    {selected && (
                      <span className="block text-[10px]">Dipilih</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-stone-500 mt-4">
            Pembayaran dilakukan langsung di kasir.
          </p>
        </div>
      </div>
    </div>
  );
};
