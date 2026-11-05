import React from 'react';
import { Utensils, LayoutGrid, ShoppingBag, Clock, Store } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  activeTab: 'menu' | 'tables' | 'orders' | 'management';
  setActiveTab: (tab: 'menu' | 'tables' | 'orders' | 'management') => void;
  cartCount: number;
  onOpenCart: () => void;
  currentRole: UserRole;
  selectedTable: number;
  pendingOrdersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  currentRole,
  selectedTable,
  pendingOrdersCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 pb-safe sm:hidden">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Menu Tab */}
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
            activeTab === 'menu' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Utensils className={`w-5 h-5 ${activeTab === 'menu' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>

        {/* Meja Tab */}
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex flex-col items-center justify-center h-full transition-colors relative active:scale-95 ${
            activeTab === 'tables' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <LayoutGrid className={`w-5 h-5 ${activeTab === 'tables' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
            <span className="absolute -top-1 -right-2 text-[9px] font-mono bg-stone-800 text-amber-400 border border-stone-700 px-1 rounded-full font-bold">
              {String(selectedTable).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Meja</span>
        </button>

        {/* Keranjang Tab (Central Prominent Action) */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center h-full -mt-2 group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30 relative border-2 border-stone-900">
            <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-amber-400">Keranjang</span>
        </button>

        {/* Riwayat Pesanan */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
            activeTab === 'orders' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <Clock className={`w-5 h-5 ${activeTab === 'orders' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Pesanan</span>
        </button>

        {/* Kasir / Admin Panel */}
        <button
          onClick={() => setActiveTab('management')}
          className={`flex flex-col items-center justify-center h-full transition-colors active:scale-95 ${
            activeTab === 'management' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Store className={`w-5 h-5 ${activeTab === 'management' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[50px]">
            {currentRole === 'admin' ? 'Admin' : currentRole === 'kasir' ? 'Kasir' : 'Kelola'}
          </span>
        </button>
      </div>
    </nav>
  );
};
