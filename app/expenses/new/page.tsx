'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function NewExpensePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Stock');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Mobile Money');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const saveExpense = async () => {
    const numericAmount = Number(amount);
    if (!description.trim()) return setMessage('Enter an expense description.');
    if (!date) return setMessage('Select an expense date.');
    if (!numericAmount || numericAmount <= 0) return setMessage('Enter an amount greater than zero.');

    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, category, description, amount: numericAmount, method }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save expense.');
      window.location.href = '/expenses';
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save expense.');
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto max-w-3xl px-5 py-5 lg:px-8"><Link href="/expenses" className="text-sm font-semibold text-slate-500">← Expenses</Link><p className="mt-3 text-sm font-extrabold tracking-wide text-indigo-600">EXPENSES</p><h1 className="mt-1 text-2xl font-bold">Add Expense</h1></div></header>
      <div className="mx-auto max-w-3xl px-5 py-7 lg:px-8">
        <div className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-semibold">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
          <label className="text-sm font-semibold">Category<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option>Stock</option><option>Delivery</option><option>Packaging</option><option>Marketing</option><option>Transport</option><option>Rent</option><option>Utilities</option><option>Staff</option><option>Other</option></select></label>
          <label className="text-sm font-semibold sm:col-span-2">Description<input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="What was this expense for?" /></label>
          <label className="text-sm font-semibold">Amount (GH₵)<input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="0.00" /></label>
          <label className="text-sm font-semibold">Payment method<select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option>Mobile Money</option><option>Cash</option><option>Bank transfer</option><option>Card</option></select></label>
          {message && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:col-span-2">{message}</p>}
          <div className="sm:col-span-2 flex justify-end"><button type="button" onClick={saveExpense} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save Expense'}</button></div>
        </div>
      </div>
    </main>
  );
}
