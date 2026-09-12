'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Dashboard = {
  today: { sales: number; expenses: number; profit: number; orders: number };
  totals: { orders: number; customers: number; outstanding: number };
  lowStock: { id: string; name: string; stock: number; threshold: number }[];
  recentOrders: { id: string; customerName: string; total: number; status: string; createdAt: string }[];
};

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function Home() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch('/api/dashboard').then((response) => response.ok ? response.json() : null).then(setData).catch(() => setData(null));
  }, []);

  const cards = data ? [
    ['Today’s Sales', money(data.today.sales), `${data.today.orders} sale${data.today.orders === 1 ? '' : 's'} today`],
    ['Orders', String(data.totals.orders), `${data.today.orders} recorded today`],
    ['Net Profit', money(data.today.profit), 'Today’s sales less product, delivery and expense costs'],
    ['Outstanding', money(data.totals.outstanding), data.totals.outstanding > 0 ? 'Customer payments pending' : 'All payments are settled'],
  ] : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">FASHION SELLER PRO</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Business Dashboard</h1></div><Link href="/orders/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">+ Quick Sale</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        {!data && <div className="mb-5 rounded-xl border bg-white p-4 text-sm text-slate-500">Loading your business data…</div>}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, note]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div>)}</section>
        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-bold">Recent Sales</h2><p className="mt-1 text-xs text-slate-400">Live from your PostgreSQL orders</p></div><Link href="/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View orders →</Link></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{data?.recentOrders.slice(0, 3).map((order) => <div key={order.id} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">{order.id}</p><p className="mt-2 truncate font-semibold">{order.customerName}</p><p className="mt-1 text-xs text-slate-500">{order.status}</p><p className="mt-3 font-bold">{money(order.total)}</p></div>)}{data && !data.recentOrders.length && <div className="rounded-xl bg-slate-50 p-8 text-sm text-slate-500 sm:col-span-3">Record your first sale and it will appear here.</div>}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Needs Attention</h2><div className="mt-5 space-y-4"><div className="flex gap-3"><span className={data?.totals.outstanding ? 'mt-0.5 text-amber-600' : 'mt-0.5 text-emerald-600'}>{data?.totals.outstanding ? '!' : '✓'}</span><div><p className="text-sm font-semibold">Payment pending</p><p className="mt-0.5 text-xs text-slate-500">{data?.totals.outstanding ? `${money(data.totals.outstanding)} still outstanding` : 'No outstanding customer payments'}</p></div></div><div className="flex gap-3"><span className={data?.lowStock.length ? 'mt-0.5 text-amber-600' : 'mt-0.5 text-emerald-600'}>{data?.lowStock.length ? '!' : '✓'}</span><div><p className="text-sm font-semibold">Low stock</p><p className="mt-0.5 text-xs text-slate-500">{data?.lowStock.length ? `${data.lowStock.length} product${data.lowStock.length === 1 ? '' : 's'} need attention` : 'No low-stock products'}</p></div></div><div className="flex gap-3"><span className="mt-0.5 text-indigo-600">✓</span><div><p className="text-sm font-semibold">Customers</p><p className="mt-0.5 text-xs text-slate-500">{data?.totals.customers ?? 0} customer{data?.totals.customers === 1 ? '' : 's'} recorded</p></div></div></div></div>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Quick Actions</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Record Sale','/orders/new','Record a customer order'],['Add Product','/products/new','Add stock to your catalog'],['Add Customer','/customers/new','Save a customer'],['Add Expense','/expenses/new','Record a business expense']].map(([label,href,description]) => <Link key={label} href={href} className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40"><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">{description}</p></Link>)}</div></section>
      </div>
    </main>
  );
}
