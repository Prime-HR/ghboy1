'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', sku: '', category: '', description: '', price: '', cost: '', stock: '', threshold: '3', status: 'ACTIVE' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`, { cache: 'no-store' });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || 'Unable to load product.');
        setForm({ name: data.name, sku: data.sku ?? '', category: data.category ?? '', description: data.description ?? '', price: String(data.sellingPrice), cost: String(data.costPrice), stock: String(data.stockQuantity), threshold: String(data.lowStockLevel), status: data.status });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) void load();
  }, [params.id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, sku: form.sku, category: form.category, description: form.description, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock), threshold: Number(form.threshold), status: form.status }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to save product.');
      router.push(`/products/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Loading product...</main>;

  return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">PRODUCTS</p><h1 className="mt-1 text-2xl font-bold">Edit Product</h1><p className="mt-1 text-sm text-slate-500">Update pricing, stock and product information.</p></div><Link href={`/products/${params.id}`} className="text-sm font-semibold text-indigo-600">Back to product</Link></div></header><div className="mx-auto max-w-3xl px-5 py-7"><form onSubmit={save} className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Product name<input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">SKU<input required value={form.sku} onChange={(e) => update('sku', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Category<input value={form.category} onChange={(e) => update('category', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Selling price (GH₵)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Cost price (GH₵)<input required type="number" min="0" step="0.01" value={form.cost} onChange={(e) => update('cost', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Stock quantity<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => update('stock', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Low-stock threshold<input required type="number" min="0" step="1" value={form.threshold} onChange={(e) => update('threshold', e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Status<select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label><label className="text-sm font-semibold sm:col-span-2">Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={5} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="Optional product description" /></label><div className="sm:col-span-2">{error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}<div className="flex justify-end"><button disabled={saving} type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button></div></div></form></div></main>;
}
