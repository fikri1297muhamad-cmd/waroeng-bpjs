
import React from 'react';
import {
  ShoppingBag,
  UtensilsCrossed,
  UserCheck,
  Shield,
  ChevronDown,
  Database,
  Receipt,
} from 'lucide-react';
import { UserRole } from '../types';
import { RESTAURANT_INFO } from '../data/initialData';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  selectedTable: number;
  onOpenTableModal: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  selectedTable,
  onOpenTableModal,
  cartCount,
  onOpenCart,
  onOpenHistory,
  historyCount,
  onOpenSupabaseModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 shadow-md">
      <div className="flex items-center justify-between bg-amber-600 px-4 py-1 text-center text-xs font-medium text-amber-950">
        <span className="mx-auto truncate">
          📍 {RESTAURANT_INFO.address}
        </span>
        <span className="hidden rounded bg-amber-700/30 px-2 py-0.5 font-mono sm:inline">
          {RESTAURANT_INFO.openHours}
        </span>
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-black text-white shadow-inner">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                WAROENG BPJS
              </span>
              <span className="rounded border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                Cianjur
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Pemesanan Makanan Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentRole === 'pelanggan' && (
            <>
              <button
                type="button"
                onClick={onOpenTableModal}
                className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-200"
                title="Pilih Nomor Meja"
              >
                <span className="text-stone-400">Meja:</span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {String(selectedTable).padStart(2, '0')}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-stone-700 bg-stone-800 text-stone-200"
                aria-label="Riwayat Pesanan"
              >
                <Receipt className="h-5 w-5" />
                {historyCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-stone-900 bg-rose-600 px-1 text-[11px] font-bold text-white">
                    {historyCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-stone-950"
                aria-label="Buka Keranjang"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-stone-900 bg-rose-600 px-1 text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}

          {currentRole !== 'pelanggan' && (
            <div className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-bold">
              {currentRole === 'admin' ? (
                <>
                  <Shield className="h-4 w-4 text-rose-400" />
                  Admin
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  Kasir
                </>
              )}
            </div>
          )}

          {currentRole === 'pelanggan' && (
            <button
              type="button"
              onClick={() => onSelectRole('kasir')}
              className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-2 text-xs font-bold text-stone-300"
              title="Masuk ke halaman staf"
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Staf</span>
            </button>
          )}

          {onOpenSupabaseModal && currentRole === 'admin' && (
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1 rounded-lg border border-emerald-600/60 bg-emerald-950/70 px-2.5 py-1.5 text-xs font-bold text-emerald-300"
              title="Uji koneksi Supabase"
            >
              <Database className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Uji Supabase</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
