
import React, { useState } from 'react';
import { X, LockKeyhole, User, LogIn } from 'lucide-react';
import { UserRole, StaffProfile } from '../types';
import { signInStaffWithSupabase } from '../services/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 'admin' | 'kasir';
  onLoginSuccess: (role: UserRole, profile?: StaffProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signInStaffWithSupabase(
        email.trim(),
        password,
        targetRole
      );

      if (!result.success || !result.profile) {
        setError(result.error || 'Login gagal. Periksa akun Anda.');
        return;
      }

      onLoginSuccess(targetRole, result.profile);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-extrabold">
              Login Waroeng BPJS
            </h2>
            <p className="text-xs text-stone-500">
              Masuk sebagai {targetRole === 'admin' ? 'Admin' : 'Kasir'}
            </p>
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
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              Email Akun Supabase
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              placeholder="Masukkan email akun"
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
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 p-3 font-bold text-stone-950 disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            {loading ? 'Memeriksa akun...' : 'Masuk'}
          </button>

          <p className="text-center text-xs text-stone-500">
            Akses hanya untuk akun Admin dan Kasir yang terdaftar.
          </p>
        </form>
      </div>
    </div>
  );
};
