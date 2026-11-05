import React, { useState } from 'react';
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const SupabaseTester: React.FC = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Memeriksa koneksi database...');

    try {
      const { error } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage('Koneksi Supabase berhasil.');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Koneksi database gagal. Periksa konfigurasi Supabase.'
      );
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-amber-600" />
        <h2 className="font-bold">Status Database Online</h2>
      </div>

      <p className="mt-2 text-sm text-stone-500">
        Periksa koneksi aplikasi Waroeng BPJS dengan Supabase.
      </p>

      <button
        type="button"
        onClick={testConnection}
        disabled={status === 'loading'}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 p-3 font-semibold text-white disabled:opacity-50"
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        {status === 'loading' ? 'Memeriksa...' : 'Tes Koneksi Database'}
      </button>

      {message && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm ${
            status === 'success'
              ? 'bg-green-50 text-green-700'
              : status === 'error'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-stone-50 text-stone-600'
          }`}
        >
          {status === 'success' && (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          )}
          {status === 'error' && (
            <XCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};
