'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Product = { id: string; name: string; sku: string; category: string; price: number; cost: number; stock: number; threshold: number };

const seedProducts: Product[] = [
  { id: 'ank-001', name: 'Ankara Dress', sku: 'ANK-001', category: 'Dresses', price: 350, cost: 220, stock: 8, threshold: 3 },
  { id: 'lin-002', name: 'Linen Shirt', sku: 'LIN-002', category: 'Tops', price: 180, cost: 100, stock: 3, threshold: 3 },
  { id: 'set-003', name: 'Two-Piece Set', sku: 'SET-003', category: 'Sets', price: 420, cost: 260, stock: 0, threshold: 3 },
];

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('fashion-seller-products');
    if (stored) setProducts(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fashion-seller-products', JSON.stringify(products));
  }, [products]);

  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const low = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const out = products.filter((p) => p.stock === 0).length;

  const removeProduct = (id: string) => setProducts((items) => items.filter((item) => item.id !== id));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div><p className="text-sm font-semibold text-indigo-600">FASHION SELLER PRO</p><h1 className="text-xl font-bold">Products</h1></div><Link href="/products/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">+ Add Product</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">Your products</h2><p className="mt-1 text-sm text-slate-500">Manage prices, costs and stock in one place.</p></div><input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Search products..." /></div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr>{['Product','Category','Selling price','Cost','Stock','Status',''].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{filtered.map((p) => { const status = p.stock === 0 ? 'Out of stock' : p.stock <= p.threshold ? 'Low stock' : 'In stock'; return <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{p.name}</p><p className="text-xs text-slate-400">{p.sku}</p></td><td className="px-5 py-4 text-slate-600">{p.category}</td><td className="px-5 py-4 font-semibold">{money(p.price)}</td><td className="px-5 py-4 text-slate-600">{money(p.cost)}</td><td className="px-5 py-4">{p.stock}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{status}</span></td><td className="px-5 py-4 text-right"><button onClick={() => removeProduct(p.id)} className="text-xs font-semibold text-rose-600">Delete</button></td></tr>; })}</tbody></table></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">{[['Total products', products.length], ['Low stock', low], ['Out of stock', out]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
      </div>
    </main>
  );
}
