'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Product = { id: string; name: string; sellingPrice: number | string; costPrice: number | string; stockQuantity: number };
type Customer = { id: string; name: string; phone: string; type: 'NEW' | 'RETURNING' | 'VIP' };
const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([]), [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState(''), [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1), [deliveryFee, setDeliveryFee] = useState(0), [paymentReceived, setPaymentReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money'), [message, setMessage] = useState(''), [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch('/api/products'), fetch('/api/customers')]).then(async ([p, c]) => {
      if (!p.ok || !c.ok) throw new Error('Unable to load products and customers.');
      return Promise.all([p.json(), c.json()]);
    }).then(([productData, customerData]) => { setProducts(productData); setCustomers(customerData); }).catch((err) => setMessage(err instanceof Error ? err.message : 'Unable to load order data.'));
  }, []);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const subtotal = Number(product?.sellingPrice ?? 0) * quantity;
  const total = subtotal + deliveryFee;
  const outstanding = Math.max(total - paymentReceived, 0);
  const profit = subtotal - Number(product?.costPrice ?? 0) * quantity;
  const paymentStatus = paymentReceived <= 0 ? 'Unpaid' : paymentReceived >= total ? 'Paid' : 'Partially Paid';

  const saveSale = async () => {
    setMessage('');
    if (!product || !customerId) return setMessage('Select a customer and product first.');
    if (quantity < 1 || quantity > product.stockQuantity) return setMessage(`Quantity must be between 1 and ${product.stockQuantity}.`);
    if (paymentReceived < 0) return setMessage('Payment received cannot be negative.');
    if (paymentReceived > total) return setMessage('Payment received cannot be greater than the order total.');
    setSaving(true);
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId, productId, quantity, deliveryFee, paymentReceived, paymentMethod }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save sale.');
      window.location.href = '/orders';
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to save sale.');
      setSaving(false);
    }
  };

  return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto max-w-3xl px-5 py-5 lg:px-8"><Link href="/orders" className="text-sm font-semibold text-slate-500">← Orders</Link><p className="mt-3 text-sm font-extrabold tracking-wide text-indigo-600">QUICK SALE</p><h1 className="mt-1 text-2xl font-bold">Record a Sale</h1><p className="mt-1 text-sm text-slate-500">Capture the order, payment and stock movement in one step.</p></div></header><div className="mx-auto max-w-3xl px-5 py-7 lg:px-8"><div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Customer<select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option value="">Select customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></label><label className="text-sm font-semibold">Product<select value={productId} onChange={(e) => { setProductId(e.target.value); setQuantity(1); }} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option value="">Select product</option>{products.map((p) => <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>{p.name} · {money(Number(p.sellingPrice))} · Stock {p.stockQuantity}</option>)}</select></label><label className="text-sm font-semibold">Quantity<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Delivery fee (GH₵)<input type="number" min="0" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Payment received (GH₵)<input type="number" min="0" step="0.01" value={paymentReceived} onChange={(e) => setPaymentReceived(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><label className="text-sm font-semibold">Payment method<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option>Mobile Money</option><option>Cash</option><option>Bank transfer</option><option>Card</option></select></label></div><div className="grid gap-3 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2"><div><p className="text-sm text-slate-500">Subtotal</p><p className="mt-1 text-lg font-bold">{money(subtotal)}</p></div><div><p className="text-sm text-slate-500">Total</p><p className="mt-1 text-lg font-bold">{money(total)}</p></div><div><p className="text-sm text-slate-500">Outstanding</p><p className="mt-1 text-lg font-bold">{money(outstanding)}</p></div><div><p className="text-sm text-slate-500">Estimated profit</p><p className="mt-1 text-lg font-bold">{money(profit)}</p></div></div>{message && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</p>}<div className="flex items-center justify-between gap-4"><p className="text-sm text-slate-500">Payment status: <span className="font-semibold text-slate-800">{paymentStatus}</span></p><button type="button" disabled={saving} onClick={saveSale} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Sale'}</button></div></div></div></main>;
}
