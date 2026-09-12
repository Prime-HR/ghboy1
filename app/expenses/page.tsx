'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Expense = { id: string; date: string; category: string; description: string; amount: number; method: string };

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/expenses')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load expenses.');
        setExpenses(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load expenses.'))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter((expense) => expense.date.startsWith(monthKey));
    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const stock = monthExpenses.filter((expense) => expense.category === 'Stock').reduce((sum, expense) => sum + expense.amount, 0);
    return { monthTotal, stock, other: monthTotal - stock };
  }, [expenses]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">EXPENSES</p><h1 className="mt-1 text-2xl font-bold">Business Expenses</h1></div><Link href="/expenses/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">+ Add Expense</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">This month</p><p className="mt-2 text-2xl font-bold">{money(totals.monthTotal)}</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Stock</p><p className="mt-2 text-2xl font-bold">{money(totals.stock)}</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Other expenses</p><p className="mt-2 text-2xl font-bold">{money(totals.other)}</p></div>
        </div>
        {error && <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr>{['Date','Category','Description','Amount','Payment method'].map(h=><th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>
          {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Loading expenses...</td></tr>}
          {!loading && expenses.map(e=><tr key={e.id} className="border-b last:border-0 hover:bg-slate-50"><td className="px-5 py-4">{e.date}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{e.category}</span></td><td className="px-5 py-4 font-semibold">{e.description}</td><td className="px-5 py-4 font-semibold">{money(e.amount)}</td><td className="px-5 py-4 text-slate-600">{e.method || '—'}</td></tr>)}
          {!loading && !expenses.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No expenses recorded yet.</td></tr>}
        </tbody></table></div></div>
      </div>
    </main>
  );
}
