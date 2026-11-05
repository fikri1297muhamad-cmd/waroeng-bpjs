import React, { useState } from 'react';
import { Plus, Minus, Utensils } from 'lucide-react';
import { MenuItem } from '../types';
import { formatRupiah } from '../services/api';

interface MenuCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
  onOpenDetail?: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantity,
  onAdd,
  onRemove,
  onOpenDetail,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden ${
        !item.is_available ? 'opacity-70 grayscale-[30%]' : ''
      }`}
    >
      {/* Product Image & Badges */}
      <div
        className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetail?.(item)}
      >
        {!imgError && item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-200 text-stone-400 p-4 text-center">
            <Utensils className="w-8 h-8 mb-1 text-stone-400" />
            <span className="text-xs font-medium text-stone-500">Waroeng BPJS</span>
          </div>
        )}

        {/* Category quiet indicator */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium tracking-tight">
          {item.category === 'paket'
            ? 'Paket Komplit'
            : item.category === 'makanan'
            ? 'Makanan'
            : item.category === 'camilan'
            ? 'Camilan'
            : 'Minuman'}
        </div>

        {/* Availability Badge if Habis */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onOpenDetail?.(item)}
            className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors"
          >
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Quantity Action */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[11px] text-stone-400 font-normal uppercase tracking-wider">
              Harga
            </span>
            <span className="text-sm sm:text-base font-extrabold text-amber-600 font-mono tabular-nums">
              {formatRupiah(item.price)}
            </span>
          </div>

          {/* Stepper / Add button */}
          {item.is_available ? (
            quantity > 0 ? (
              <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs hover:bg-stone-50 active:scale-90 transition-all cursor-pointer"
                  aria-label="Kurangi jumlah"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="w-8 text-center text-xs sm:text-sm font-bold font-mono text-stone-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(item);
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-amber-500 text-stone-950 font-bold shadow-xs hover:bg-amber-400 active:scale-90 transition-all cursor-pointer"
                  aria-label="Tambah jumlah"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(item);
                }}
                className="min-h-[36px] sm:min-h-[40px] px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Pesan</span>
              </button>
            )
          ) : (
            <span className="text-xs text-stone-400 font-medium italic">Habis</span>
          )}
        </div>
      </div>
    </div>
  );
};
