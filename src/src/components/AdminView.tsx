import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Save,
  X,
  Image,
} from 'lucide-react';
import { MenuItem } from '../types';
import { formatRupiah } from '../services/api';

interface AdminViewProps {
  menuItems: MenuItem[];
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  category: 'makanan' as MenuItem['category'],
  image_url: '',
  is_available: true,
};

export const AdminView: React.FC<AdminViewProps> = ({
  menuItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || form.price <= 0) {
      alert('Nama produk dan harga harus diisi dengan benar.');
      return;
    }

    if (editingId) {
      onUpdateItem({
        ...form,
        id: editingId,
      });
    } else {
      onAddItem(form);
    }

    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      onDeleteItem(id);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Admin Waroeng BPJS
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Kelola produk, harga, kategori, dan ketersediaan menu.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-stone-950"
        >
          <Plus className="h-5 w-5" />
          Tambah Produk
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">
              {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Tutup formulir"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Nama Produk
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
                className="w-full rounded-xl border bg-white p-3"
                placeholder="Contoh: Nasi Goreng"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Harga (Rp)
              </label>
              <input
                type="number"
                min="1"
                value={form.price || ''}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                required
                className="w-full rounded-xl border bg-white p-3"
                placeholder="15000"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as MenuItem['category'],
                  })
                }
                className="w-full rounded-xl border bg-white p-3"
              >
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
                <option value="camilan">Camilan</option>
                <option value="paket">Paket Komplit</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Ketersediaan
              </label>
              <select
                value={form.is_available ? 'tersedia' : 'habis'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_available: e.target.value === 'tersedia',
                  })
                }
                className="w-full rounded-xl border bg-white p-3"
              >
                <option value="tersedia">Tersedia</option>
                <option value="habis">Stok Habis</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold">
                Deskripsi Produk
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-xl border bg-white p-3"
                placeholder="Deskripsi singkat produk"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <Image className="h-4 w-4" />
                URL Foto Produk
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                className="w-full rounded-xl border bg-white p-3"
                placeholder="https://contoh.com/foto.jpg"
              />
            </div>

            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 p-3 font-bold text-white"
              >
                <Save className="h-4 w-4" />
                Simpan Produk
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl bg-stone-200 px-4 font-semibold"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-bold">
          Daftar Produk ({menuItems.length})
        </h2>
      </div>

      {menuItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-stone-400">
          Belum ada produk. Tekan Tambah Produk untuk memulai.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-stone-100">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100">
                          <Package className="h-5 w-5 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-stone-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{item.category}</td>
                  <td className="p-3 font-semibold">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="p-3">
                    {item.is_available ? 'Tersedia' : 'Habis'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        aria-label="Edit produk"
                        className="rounded-lg bg-amber-100 p-2 text-amber-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Hapus produk"
                        className="rounded-lg bg-rose-100 p-2 text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
