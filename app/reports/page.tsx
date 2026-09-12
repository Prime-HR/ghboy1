'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Report = {
  summary: { revenue: number; productCosts: number; deliveryCosts: number; expenses: number; netProfit: number; orders: number; collected: number; outstanding: number };
  topProducts: { name: string; quantity: number; revenue: number }[];
  expenseBreakdown: { category: string; amount: number }[];
};
const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

type Range = 'this-month' | 'last-month';

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [range, setRange] = useState<Range>('this-month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?range=${range}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [range]);

  const summary = report?.summary;
  const stats = [
    ['Revenue', money(summary?.revenue ?? 0), 'Order totals'],
    ['Product costs', money(summary?.productCosts ?? 0), 'Cost of goods sold'],
    ['Expenses', money(summary?.expenses ?? 0), 'Recorded business expenses'],
    ['Net profit', money(summary?.netProfit ?? 0), 'After product, delivery and business costs'],
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">REPORTS</p><h1 className="mt-1 text-2xl font-bold">Profit & Reports</h1><p className="mt-1 text-sm text-slate-500">Real business performance from your database.</p></div><Link href="/" className="text-sm font-semibold text-indigo-600">Dashboard →</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2"><button onClick={() => setRange('this-month')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${range === 'this-month' ? 'bg-indigo-600 text-white' : 'border bg-white text-slate-700'}`}>This month</button><button onClick={() => setRange('last-month')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${range === 'last-month' ? 'bg-indigo-600 text-white' : 'border bg-white text-slate-700'}`}>Last month</button></div>
        {loading && <p className="mb-5 text-sm text-slate-500">Loading report…</p>}
        {!loading && !report && <div className="rounded-2xl border bg-white p-6 text-sm text-rose-600">Unable to load the report.</div>}
        {report && <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, note]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></div>)}</section>
          <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[['Orders', summary.orders], ['Collected', money(summary.collected)], ['Outstanding', money(summary.outstanding)], ['Delivery costs', money(summary.deliveryCosts)]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}
          </section>
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Top products</h2><p className="mt-1 text-xs text-slate-400">Ranked by sales revenue</p><div className="mt-5 space-y-4">{report.topProducts.length ? report.topProducts.map((product) => <div key={product.name} className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="truncate font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.quantity} unit{product.quantity === 1 ? '' : 's'}</p></div><span className="font-bold">{money(product.revenue)}</span></div>) : <p className="text-sm text-slate-500">No product sales recorded for this period.</p>}</div></div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Expense breakdown</h2><p className="mt-1 text-xs text-slate-400">Ranked by amount</p><div className="mt-5 space-y-3">{report.expenseBreakdown.length ? report.expenseBreakdown.map((expense) => <div key={expense.category} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="font-semibold">{expense.category}</span><span className="font-bold">{money(expense.amount)}</span></div>) : <p className="text-sm text-slate-500">No expenses recorded for this period.</p>}</div></div>
          </section>
        </>}
      </div>
    </main>
  );
}
