'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Order = {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  total: number;
  paymentReceived: number;
  outstanding: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  status: 'New' | 'Confirmed' | 'Preparing' | 'Ready' | 'Dispatched' | 'Delivered' | 'Cancelled';
  createdAt: string;
};

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load orders.');
        return response.json();
      })
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  const totalSales = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const outstanding = useMemo(() => orders.reduce((sum, o) => sum + o.outstanding, 0), [orders]);
  const awaitingDelivery = useMemo(() => orders.filter((o) => ['New', 'Confirmed', 'Preparing', 'Ready', 'Dispatched'].includes(o.status)).length, [orders]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">ORDERS</p><h1 className="mt-1 text-2xl font-bold">Sales & Orders</h1></div><Link href="/orders/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">+ New Order</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="mb-5 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Total orders</p><p className="mt-2 text-2xl font-bold">{orders.length}</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Sales</p><p className="mt-2 text-2xl font-bold">{money(totalSales)}</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Payment outstanding</p><p className="mt-2 text-2xl font-bold">{money(outstanding)}</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Awaiting delivery</p><p className="mt-2 text-2xl font-bold">{awaitingDelivery}</p></div>
        </div>
        {error && <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr>{['Order','Customer','Item','Qty','Total','Paid','Outstanding','Payment','Status',''].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{loading ? <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-500">Loading orders...</td></tr> : orders.length === 0 ? <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-500">No orders yet. Record your first sale.</td></tr> : orders.map((o) => <tr key={o.orderId} className="border-b last:border-0 hover:bg-slate-50"><td className="px-5 py-4 font-semibold">#{o.id}</td><td className="px-5 py-4">{o.customerName}</td><td className="px-5 py-4 text-slate-600">{o.productName}</td><td className="px-5 py-4">{o.quantity}</td><td className="px-5 py-4 font-semibold">{money(o.total)}</td><td className="px-5 py-4">{money(o.paymentReceived)}</td><td className="px-5 py-4 font-semibold">{money(o.outstanding)}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{o.paymentStatus}</span></td><td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{o.status}</span></td><td className="px-5 py-4"><Link href={`/orders/${o.orderId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">View</Link></td></tr>)}</tbody></table></div>
        </div>
      </div>
    </main>
  );
}
