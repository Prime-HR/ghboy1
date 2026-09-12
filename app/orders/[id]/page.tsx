'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type OrderDetail = {
  orderNumber: string;
  customer: { name: string; phone: string; type: string } | null;
  items: { productName: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  deliveryCost: number;
  total: number;
  paidAmount: number;
  outstanding: number;
  profit: number;
  paymentStatus: string;
  status: string;
  deliveryStatus: string;
  payments: { amount: number; method: string | null; reference: string | null; createdAt: string }[];
  createdAt: string;
};

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/orders/${params.id}`)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to load order.');
        }
        return response.json();
      })
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load order.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="min-h-screen bg-slate-50 p-8"><p className="text-slate-500">Loading order...</p></main>;
  if (error || !order) return <main className="min-h-screen bg-slate-50 p-5 lg:p-8"><Link href="/orders" className="font-semibold text-indigo-600">← Back to orders</Link><p className="mt-8 rounded-xl bg-rose-50 px-4 py-3 font-semibold text-rose-700">{error || 'Order not found.'}</p></main>;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto max-w-5xl px-5 py-5 lg:px-8"><Link href="/orders" className="text-sm font-semibold text-indigo-600">← Back to orders</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">ORDER DETAILS</p><h1 className="mt-1 text-2xl font-bold">#{order.orderNumber}</h1><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString('en-GH')}</p></div><div className="flex gap-2"><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">{order.status}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{order.paymentStatus}</span></div></div></div></header>
      <div className="mx-auto max-w-5xl space-y-5 px-5 py-7 lg:px-8">
        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 md:col-span-2"><h2 className="font-bold">Customer</h2>{order.customer ? <div className="mt-4"><p className="text-lg font-semibold">{order.customer.name}</p><p className="mt-1 text-slate-600">{order.customer.phone}</p><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{order.customer.type}</p></div> : <p className="mt-4 text-slate-500">Walk-in customer</p>}</div>
          <div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Delivery</h2><p className="mt-4 text-lg font-semibold">{order.deliveryStatus}</p><p className="mt-1 text-sm text-slate-500">Delivery fee: {money(order.deliveryFee)}</p><p className="mt-1 text-sm text-slate-500">Delivery cost: {money(order.deliveryCost)}</p></div>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-white"><div className="border-b px-5 py-4"><h2 className="font-bold">Items</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Qty</th><th className="px-5 py-3">Unit price</th><th className="px-5 py-3">Total</th></tr></thead><tbody>{order.items.map((item) => <tr key={`${item.productName}-${item.quantity}`} className="border-t"><td className="px-5 py-4 font-semibold">{item.productName}</td><td className="px-5 py-4">{item.quantity}</td><td className="px-5 py-4">{money(item.unitPrice)}</td><td className="px-5 py-4 font-semibold">{money(item.lineTotal)}</td></tr>)}</tbody></table></div><div className="border-t bg-slate-50 p-5"><div className="ml-auto max-w-sm space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div><div className="flex justify-between"><span>Delivery fee</span><span>{money(order.deliveryFee)}</span></div><div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(order.total)}</span></div></div></div></section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Payment</h2><div className="mt-4 space-y-3"><div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="font-semibold">{money(order.paidAmount)}</span></div><div className="flex justify-between"><span className="text-slate-500">Outstanding</span><span className="font-semibold">{money(order.outstanding)}</span></div>{order.payments.length > 0 && <div className="border-t pt-3">{order.payments.map((payment) => <div key={payment.createdAt} className="mb-2 flex justify-between text-sm"><span>{payment.method || 'Payment'}</span><span>{money(payment.amount)}</span></div>)}</div>}</div></div>
          <div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Profit</h2><p className="mt-4 text-3xl font-bold">{money(order.profit)}</p><p className="mt-1 text-sm text-slate-500">After product and delivery costs</p></div>
        </section>
      </div>
    </main>
  );
}
