'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', sku: '', category: '', price: '', cost: '', stock: '', threshold: '3' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          category: form.category,
          price: Number(form.price),
          cost: Number(form.cost),
          stock: Number(form.stock || 0),
          threshold: Number(form.threshold || 3),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Unable to save product.');
        return;
      }

      router.push('/products');
      router.refresh();
    } catch {
      setError('Unable to save product. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">PRODUCTS</p><h1 className="mt-1 text-2xl font-bold">Add Product</h1><p className="mt-1 text-sm text-slate-500">Add a product, pricing and stock information.</p></div><Link href="/products" className="text-sm font-semibold text-indigo-600">Back to products</Link></div></header><div className="mx-auto max-w-3xl px-5 py-7"><form onSubmit={save} className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Product name<input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="e.g. Ankara Dress" /></label><label className="text-sm font-semibold">SKU<input required value={form.sku} onChange={(e) => update('sku', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="ANK-001" /></label><label className="text-sm font-semibold">Category<input value={form.category} onChange={(e) => update('category', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="Dresses" /></label><label className="text-sm font-semibold">Selling price (GH₵)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="350" /></label><label className="text-sm font-semibold">Cost price (GH₵)<input required type="number" min="0" step="0.01" value={form.cost} onChange={(e) => update('cost', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="220" /></label><label className="text-sm font-semibold">Stock quantity<input type="number" min="0" step="1" value={form.stock} onChange={(e) => update('stock', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="10" /></label><label className="text-sm font-semibold">Low-stock threshold<input type="number" min="0" step="1" value={form.threshold} onChange={(e) => update('threshold', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="3" /></label><div className="sm:col-span-2">{error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}<div className="flex justify-end"><button disabled={saving} type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save Product'}</button></div></div></form></div></main>;
}
