'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Order = { id: string; customerName: string; productName: string; total: number; outstanding: number; profit: number; status: string; createdAt: string };
type Expense = { amount: number; date: string };
const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    try {
      const storedOrders = window.localStorage.getItem('fashion-seller-orders');
      const storedExpenses = window.localStorage.getItem('fashion-seller-expenses');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    } catch {
      setOrders([]);
      setExpenses([]);
    }
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayOrders = useMemo(() => orders.filter((order) => order.createdAt?.slice(0, 10) === todayKey), [orders, todayKey]);
  const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const todayExpenses = expenses.filter((expense) => expense.date === todayKey).reduce((sum, expense) => sum + expense.amount, 0);
  const todayProfit = todayOrders.reduce((sum, order) => sum + order.profit, 0) - todayExpenses;
  const outstanding = orders.reduce((sum, order) => sum + Math.max(order.outstanding, 0), 0);
  const pendingPayments = orders.filter((order) => order.outstanding > 0).length;
  const awaitingDelivery = orders.filter((order) => ['New', 'Confirmed', 'Preparing', 'Ready', 'Dispatched'].includes(order.status)).length;

  const cards = [
    ['Today’s Sales', money(todaySales), todayOrders.length ? `${todayOrders.length} sale${todayOrders.length === 1 ? '' : 's'} today` : 'No sales recorded today'],
    ['Orders', String(orders.length), orders.length ? `${todayOrders.length} recorded today` : 'No orders yet'],
    ['Profit', money(todayProfit), todayOrders.length || todayExpenses ? 'Sales profit less today’s expenses' : 'No profit recorded today'],
    ['Outstanding', money(outstanding), outstanding > 0 ? `${pendingPayments} payment${pendingPayments === 1 ? '' : 's'} pending` : 'All payments are settled'],
  ];

  const attention = [
    ['Payment pending', pendingPayments ? `${pendingPayments} customer payment${pendingPayments === 1 ? '' : 's'} still outstanding` : 'No outstanding customer payments', pendingPayments ? 'text-amber-600' : 'text-emerald-600'],
    ['Delivery queue', awaitingDelivery ? `${awaitingDelivery} order${awaitingDelivery === 1 ? '' : 's'} awaiting delivery` : 'No deliveries waiting', awaitingDelivery ? 'text-amber-600' : 'text-emerald-600'],
    ['Recent activity', orders.length ? `Latest order ${orders[0].id}` : 'No orders recorded yet', orders.length ? 'text-indigo-600' : 'text-emerald-600'],
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">FASHION SELLER PRO</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Business Dashboard</h1></div><Link href="/orders/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">+ Quick Sale</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, note]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div>)}</section>
        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-bold">Recent Sales</h2><p className="mt-1 text-xs text-slate-400">Live from your recorded orders</p></div><Link href="/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View orders →</Link></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{orders.slice(0, 3).map((order) => <div key={order.id} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">{order.id}</p><p className="mt-2 truncate font-semibold">{order.customerName}</p><p className="mt-1 truncate text-xs text-slate-500">{order.productName}</p><p className="mt-3 font-bold">{money(order.total)}</p></div>)}{!orders.length && <div className="rounded-xl bg-slate-50 p-8 text-sm text-slate-500 sm:col-span-3">Record your first sale and it will appear here.</div>}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Needs Attention</h2><div className="mt-5 space-y-4">{attention.map(([title, text, color]) => <div key={title} className="flex gap-3"><span className={`mt-0.5 ${color}`}>{title === 'Payment pending' && pendingPayments ? '!' : '✓'}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-slate-500">{text}</p></div></div>)}</div></div>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Quick Actions</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Record Sale','/orders/new','Record a customer order'],['Add Product','/products/new','Add stock to your catalog'],['Add Customer','/customers/new','Save a customer'],['Add Expense','/expenses/new','Record a business expense']].map(([label,href,description]) => <Link key={label} href={href} className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40"><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">{description}</p></Link>)}</div></section>
      </div>
    </main>
  );
}
