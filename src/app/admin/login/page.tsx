'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password wajib diisi!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Password salah!');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand bg-grain p-4">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden border border-field-border bg-white shadow-btn mb-3">
          <img src="/logo_sutanting.png" alt="SUTANTING Logo" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-2xl font-800 text-ink tracking-tight">SUTANTING Admin</h1>
        <p className="text-xs text-inkmut mt-1">Halaman khusus pengelolaan outlet & menu</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm rounded-2xl border border-sanddk bg-sandlt p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="lbl">Password Administrator</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 z-10 pointer-events-none text-inkmut/70">
                <Icon icon="ph:lock-key-fill" className="h-4.5 w-4.5 text-terra" />
              </span>
              <input
                type="password"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            {error && (
              <p className="text-[10px] text-red-500 font-600 mt-1.5 flex items-center gap-1">
                <Icon icon="ph:warning-circle-fill" className="h-3.5 w-3.5 text-red-500" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-terradk py-3 text-xs font-700 text-white shadow-btn hover:bg-terraxd transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Icon icon="ph:spinner-gap-bold" className="h-4 w-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <Icon icon="ph:sign-in-bold" className="h-4 w-4" />
                Masuk ke Dashboard
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-sanddk pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-inkmut hover:text-terra transition-colors"
          >
            <Icon icon="ph:arrow-left-bold" className="h-3 w-3" />
            Kembali ke Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}


