'use client';

import { FormEvent, useEffect, useState } from 'react';

type Business = {
  name: string;
  type: string;
  whatsapp: string;
  location: string;
  currency: string;
};

const initialBusiness: Business = { name: '', type: '', whatsapp: '', location: '', currency: 'GHS' };

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/business')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Unable to load business settings.');
        setBusiness(data.business);
        setRole(data.role);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update(field: keyof Business, value: string) {
    setBusiness((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Unable to save settings.');
      setBusiness(data.business);
      setMessage('Business settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  const canEdit = role === 'OWNER' || role === 'ADMIN';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
          <p className="text-sm font-extrabold tracking-wide text-indigo-600">SETTINGS</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Business profile</h1>
          <p className="mt-1 text-sm text-slate-500">Keep your seller information accurate across Fashion Seller Pro.</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-7 lg:px-8">
        {loading && <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">Loading business settings…</div>}
        {!loading && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold">Business name</span>
                <input value={business.name} onChange={(e) => update('name', e.target.value)} disabled={!canEdit} required className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Business type <span className="font-normal text-slate-400">(optional)</span></span>
                <input value={business.type} onChange={(e) => update('type', e.target.value)} disabled={!canEdit} placeholder="Fashion boutique, online seller…" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">WhatsApp number</span>
                <input value={business.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} disabled={!canEdit} type="tel" placeholder="024 000 0000" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Location</span>
                <input value={business.location} onChange={(e) => update('location', e.target.value)} disabled={!canEdit} placeholder="Kumasi, Ghana" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Currency</span>
                <input value={business.currency} onChange={(e) => update('currency', e.target.value)} disabled={!canEdit} maxLength={3} className="mt-1 w-full rounded-xl border px-4 py-3 uppercase outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" />
                <span className="mt-1 block text-xs text-slate-400">Use a 3-letter currency code, such as GHS.</span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {canEdit && <button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>}
              <span className="text-xs font-semibold text-slate-400">Role: {role || '—'}</span>
            </div>
            {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
