import React, { useState } from 'react';
import { X, LockKeyhole, User, LogIn } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      return;
    }

    onLogin(username.trim(), password);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-extrabold">Login Waroeng BPJS</h2>
            <p className="text-xs text-stone-500">Admin dan Kasir</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup login"
            className="rounded-lg p-2 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Jenis Akun
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-stone-300 bg-white p-3"
            >
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="Masukkan username"
              className="w-full rounded-xl border border-stone-300 p-3"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <LockKeyhole className="h-4 w-4" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Masukkan password"
              className="w-full rounded-xl border border-stone-300 p-3"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 p-3 font-bold text-stone-950"
          >
            <LogIn className="h-5 w-5" />
            Masuk
          </button>

          <p className="text-center text-xs text-stone-500">
            Akses hanya untuk akun Admin dan Kasir yang terdaftar.
          </p>
        </form>
      </div>
    </div>
  );
};
