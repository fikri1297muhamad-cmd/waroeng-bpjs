import React from 'react';
import { ShoppingBag, UtensilsCrossed, UserCheck, Shield, ChevronDown, Database } from 'lucide-react';
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
      {/* Top Banner Address / Info */}
      <div className="bg-amber-600 px-4 py-1 text-center text-xs font-medium tracking-wide text-amber-950 flex items-center justify-between">
        <span className="truncate mx-auto">
          📍 {RESTAURANT_INFO.address}
        </span>
        <span className="hidden sm:inline text-[11px] font-mono bg-amber-700/30 px-2 py-0.5 rounded text-amber-950">
          {RESTAURANT_INFO.openHours}
        </span>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-inner text-white font-black text-xl tracking-tighter">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white leading-tight">
                WAROENG BPJS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Cianjur
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-none">
              Pemesanan Makanan Online · Meja 01–15
            </p>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Table Selector Pill */}
          <button
            onClick={onOpenTableModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold active:scale-95 transition-transform"
            title="Pilih Nomor Meja"
          >
            <span className="text-stone-400 font-normal">Meja:</span>
            <span className="text-amber-400 font-mono font-bold text-sm">
              {String(selectedTable).padStart(2, '0')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {/* Role Mode Indicator / Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                if (currentRole === 'pelanggan') {
                  onSelectRole('kasir');
                } else if (currentRole === 'kasir') {
                  onSelectRole('admin');
                } else {
                  onSelectRole('pelanggan');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 border ${
                currentRole === 'admin'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                  : currentRole === 'kasir'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
              }`}
              title="Ganti Mode (Pelanggan / Kasir / Admin)"
            >
              {currentRole === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span>Admin</span>
                </>
              ) : currentRole === 'kasir' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kasir</span>
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Pelanggan</span>
                  <span className="sm:hidden">Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Supabase Status / Test Button */}
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Pengujian Koneksi Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Uji Supabase</span>
            </button>
          )}

          {/* Cart Button (for desktop / quick tap) */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold active:scale-90 transition-transform shadow-sm"
            aria-label="Buka Keranjang Pesanan"
          >
            <ShoppingBag className="w-5 h-5 text-stone-950" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-stone-900 shadow animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
