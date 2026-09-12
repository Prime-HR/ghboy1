'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Product = { id: string; name: string; sku: string; category: string; price: number; cost: number; stock: number; threshold: number; status: 'ACTIVE' | 'INACTIVE' };
type ApiProduct = { id: string; name: string; sku: string | null; category: string | null; sellingPrice: string | number; costPrice: string | number; stockQuantity: number; lowStockLevel: number; status: 'ACTIVE' | 'INACTIVE' };

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
const mapProduct = (p: ApiProduct): Product => ({ id: p.id, name: p.name, sku: p.sku ?? '', category: p.category ?? 'Other', price: Number(p.sellingPrice), cost: Number(p.costPrice), stock: p.stockQuantity, threshold: p.lowStockLevel, status: p.status });

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load products.');
      const data: ApiProduct[] = await response.json();
      setProducts(data.map(mapProduct));
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load products.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadProducts(); }, []);

  const filtered = useMemo(() => products.filter((p) => {
    const matchesQuery = `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'ALL' || (filter === 'LOW' && p.stock > 0 && p.stock <= p.threshold) || (filter === 'OUT' && p.stock === 0);
    return matchesQuery && matchesFilter;
  }), [products, query, filter]);

  const low = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const out = products.filter((p) => p.stock === 0).length;

  const removeProduct = async (id: string) => {
    if (!window.confirm('Delete this product? Products used by existing orders cannot be deleted.')) return;
    setError('');
    const response = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) { const data = await response.json().catch(() => null); setError(data?.error || 'Unable to delete product.'); return; }
    setProducts((items) => items.filter((item) => item.id !== id));
  };

  return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div><p className="text-sm font-semibold text-indigo-600">FASHION SELLER PRO</p><h1 className="text-xl font-bold">Products</h1></div><Link href="/products/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">+ Add Product</Link></div></header><div className="mx-auto max-w-7xl px-5 py-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">Your products</h2><p className="mt-1 text-sm text-slate-500">Manage prices, costs, stock and low-stock alerts.</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Search products..." /><select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-xl border bg-white px-4 py-3 text-sm"><option value="ALL">All products</option><option value="LOW">Low stock ({low})</option><option value="OUT">Out of stock ({out})</option></select></div></div>{error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}<div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr>{['Product','Category','Selling price','Cost','Stock','Status','Actions'].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">Loading products...</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">No products match your search.</td></tr> : filtered.map((p) => { const stockStatus = p.stock === 0 ? 'Out of stock' : p.stock <= p.threshold ? 'Low stock' : 'In stock'; return <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{p.name}</p><p className="text-xs text-slate-400">{p.sku}</p></td><td className="px-5 py-4 text-slate-600">{p.category}</td><td className="px-5 py-4 font-semibold">{money(p.price)}</td><td className="px-5 py-4 text-slate-600">{money(p.cost)}</td><td className="px-5 py-4 font-semibold">{p.stock}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{p.status === 'INACTIVE' ? 'Inactive' : stockStatus}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-3"><Link href={`/products/${p.id}`} className="text-xs font-semibold text-indigo-600">View</Link><Link href={`/products/${p.id}/edit`} className="text-xs font-semibold text-slate-700">Edit</Link><button onClick={() => void removeProduct(p.id)} className="text-xs font-semibold text-rose-600">Delete</button></div></td></tr>; })}</tbody></table></div></div><div className="mt-6 grid gap-4 sm:grid-cols-3">{[['Total products', products.length], ['Low stock', low], ['Out of stock', out]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div></div></main>;
}
