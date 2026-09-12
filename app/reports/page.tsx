'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Order = { id: string; productName: string; total: number; paymentReceived: number; profit: number; createdAt: string; status: string; quantity: number };
type Expense = { date: string; amount: number; category: string };

type Range = 'this-month' | 'last-month';

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [range, setRange] = useState<Range>('this-month');

  useEffect(() => {
    try {
      setOrders(JSON.parse(window.localStorage.getItem('fashion-seller-orders') || '[]'));
      setExpenses(JSON.parse(window.localStorage.getItem('fashion-seller-expenses') || '[]'));
    } catch {
      setOrders([]);
      setExpenses([]);
    }
  }, []);

  const target = useMemo(() => {
    const now = new Date();
    if (range === 'this-month') return monthKey(now);
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return monthKey(previous);
  }, [range]);

  const filteredOrders = useMemo(() => orders.filter((o) => o.createdAt.slice(0, 7) === target), [orders, target]);
  const filteredExpenses = useMemo(() => expenses.filter((e) => e.date.slice(0, 7) === target), [expenses, target]);
  const revenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const productCosts = filteredOrders.reduce((sum, o) => sum + Math.max(o.total - o.profit, 0), 0);
  const expenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = filteredOrders.reduce((sum, o) => sum + o.profit, 0) - expenseTotal;

  const topProducts = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredOrders.forEach((order) => grouped.set(order.productName, (grouped.get(order.productName) || 0) + order.total));
    return [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredOrders]);

  const stats = [
    ['Revenue', money(revenue), 'Order totals'],
    ['Product costs', money(productCosts), 'Estimated cost of goods'],
    ['Expenses', money(expenseTotal), 'Recorded business expenses'],
    ['Net profit', money(netProfit), 'Profit after expenses'],
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">REPORTS</p><h1 className="mt-1 text-2xl font-bold">Profit & Reports</h1><p className="mt-1 text-sm text-slate-500">Understand how your fashion business is performing.</p></div><Link href="/" className="text-sm font-semibold text-indigo-600">Dashboard →</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2"><button onClick={() => setRange('this-month')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${range === 'this-month' ? 'bg-indigo-600 text-white' : 'border bg-white text-slate-700'}`}>This month</button><button onClick={() => setRange('last-month')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${range === 'last-month' ? 'bg-indigo-600 text-white' : 'border bg-white text-slate-700'}`}>Last month</button></div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, note]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div>)}</section>
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Sales performance</h2><p className="mt-1 text-xs text-slate-400">{filteredOrders.length} orders in selected period</p><div className="mt-5 flex min-h-56 items-center justify-center rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{revenue ? `Recorded revenue: ${money(revenue)}` : 'No sales recorded for this period.'}</div></div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Top products</h2><div className="mt-5 space-y-4">{topProducts.length ? topProducts.map(([name, total]) => <div key={name} className="flex justify-between gap-4"><span className="truncate">{name}</span><span className="font-bold">{money(total)}</span></div>) : <p className="text-sm text-slate-500">No product sales recorded for this period.</p>}</div></div>
        </section>
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold">Expense breakdown</h2><p className="mt-1 text-xs text-slate-400">Selected period</p></div><span className="text-sm font-bold">{money(expenseTotal)}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['Stock','Delivery','Packaging','Marketing','Transport','Rent','Utilities','Other'].map((category) => { const total = filteredExpenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0); return <div key={category} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{category}</p><p className="mt-2 font-bold">{money(total)}</p></div>; })}</div></section>
      </div>
    </main>
  );
}
