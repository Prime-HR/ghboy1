'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  lowStockLevel: number;
  status: 'ACTIVE' | 'INACTIVE';
};

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [threshold, setThreshold] = useState('');
  const [savingStock, setSavingStock] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/products/${params.id}`, { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to load product.');
      setProduct(data);
      setThreshold(String(data.lowStockLevel));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load product.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) void loadProduct();
  }, [params.id]);

  const adjustStock = async () => {
    const delta = Number(adjustment);
    if (!Number.isInteger(delta) || delta === 0) {
      setError('Enter a non-zero whole-number stock adjustment.');
      return;
    }
    setSavingStock(true);
    setError('');
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockDelta: delta }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to adjust stock.');
      setProduct(data);
      setAdjustment('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to adjust stock.');
    } finally {
      setSavingStock(false);
    }
  };

  const saveThreshold = async () => {
    const value = Number(threshold);
    if (!Number.isInteger(value) || value < 0) {
      setError('Low-stock threshold must be a whole number of 0 or more.');
      return;
    }
    setSavingThreshold(true);
    setError('');
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to update threshold.');
      setProduct(data);
      setThreshold(String(data.lowStockLevel));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update threshold.');
    } finally {
      setSavingThreshold(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Loading product...</main>;
  if (!product) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6"><p className="font-semibold text-rose-600">{error || 'Product not found.'}</p><Link href="/products" className="mt-4 inline-block text-sm font-semibold text-indigo-600">Back to products</Link></div></main>;

  const lowStock = product.stockQuantity === 0 || product.stockQuantity <= product.lowStockLevel;
  const margin = product.sellingPrice - product.costPrice;

  return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">PRODUCTS</p><h1 className="mt-1 text-2xl font-bold">{product.name}</h1><p className="mt-1 text-sm text-slate-500">SKU: {product.sku || 'No SKU'}</p></div><div className="flex gap-3"><Link href="/products" className="rounded-xl border px-4 py-2 text-sm font-semibold">Back</Link><Link href={`/products/${product.id}/edit`} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Edit Product</Link></div></div></header><div className="mx-auto max-w-5xl px-5 py-7">{error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}<div className="grid gap-5 lg:grid-cols-3"><section className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Product information</h2><p className="mt-1 text-sm text-slate-500">Pricing, stock and product details.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{lowStock ? (product.stockQuantity === 0 ? 'Out of stock' : 'Low stock') : 'In stock'}</span></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selling price</p><p className="mt-1 text-xl font-bold">{money(product.sellingPrice)}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cost price</p><p className="mt-1 text-xl font-bold">{money(product.costPrice)}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Unit margin</p><p className="mt-1 text-xl font-bold">{money(margin)}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current stock</p><p className="mt-1 text-xl font-bold">{product.stockQuantity}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</p><p className="mt-1 font-semibold">{product.category || 'Other'}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p><p className="mt-1 font-semibold">{product.status === 'ACTIVE' ? 'Active' : 'Inactive'}</p></div></div><div className="mt-6 border-t pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{product.description || 'No description added.'}</p></div></section><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Stock adjustment</h2><p className="mt-1 text-sm text-slate-500">Add or remove stock without editing the product.</p><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Current stock</p><p className="mt-1 text-3xl font-bold">{product.stockQuantity}</p></div><label className="mt-5 block text-sm font-semibold">Adjustment<input value={adjustment} onChange={(e) => setAdjustment(e.target.value)} type="number" step="1" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="+10 or -2" /></label><label className="mt-4 block text-sm font-semibold">Reason <span className="font-normal text-slate-400">(optional)</span><input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="New stock, damaged, correction..." /></label><p className="mt-3 text-xs text-slate-400">Reason is recorded on-screen for your reference but is not stored yet.</p><button onClick={() => void adjustStock()} disabled={savingStock} className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{savingStock ? 'Updating...' : 'Update stock'}</button></section></div><section className="mt-5 rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-bold">Low-stock management</h2><p className="mt-1 text-sm text-slate-500">Set the quantity at which this product is flagged as low stock.</p></div><div className="flex gap-3"><label className="text-sm font-semibold">Threshold<input value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" min="0" step="1" className="mt-2 w-32 rounded-xl border px-4 py-3 font-normal" /></label><button onClick={() => void saveThreshold()} disabled={savingThreshold} className="rounded-xl border px-5 py-3 text-sm font-bold disabled:opacity-60">{savingThreshold ? 'Saving...' : 'Save threshold'}</button></div></div><div className="mt-5 rounded-xl border px-4 py-3 text-sm">{product.stockQuantity === 0 ? 'This product is currently out of stock.' : lowStock ? `Low-stock alert: ${product.stockQuantity} left, threshold is ${product.lowStockLevel}.` : `Stock is healthy: ${product.stockQuantity} available.`}</div></section></div></main>;
}
