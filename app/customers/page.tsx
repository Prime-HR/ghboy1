'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Customer = { id: string; name: string; phone: string; type: 'New' | 'Returning' | 'VIP'; orders: number; spent: number; outstanding: number };

const seedCustomers: Customer[] = [
  { id: 'cus-001', name: 'Ama Mensah', phone: '024 123 4567', type: 'VIP', orders: 8, spent: 2840, outstanding: 0 },
  { id: 'cus-002', name: 'Esi Boateng', phone: '055 234 5678', type: 'Returning', orders: 4, spent: 1420, outstanding: 220 },
  { id: 'cus-003', name: 'Adwoa Owusu', phone: '020 345 6789', type: 'New', orders: 1, spent: 180, outstanding: 180 },
];

const money = (value: number) => `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('fashion-seller-customers');
    if (stored) setCustomers(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fashion-seller-customers', JSON.stringify(customers));
  }, [customers]);

  const filtered = useMemo(() => customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="text-sm font-extrabold tracking-wide text-indigo-600">CUSTOMERS</p><h1 className="mt-1 text-2xl font-bold">Customer Management</h1></div><Link href="/customers/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">+ Add Customer</Link></div></header>
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="mb-5 rounded-2xl border bg-white p-4"><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Search by customer name or phone..." /></div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr>{['Customer','Phone','Type','Orders','Total spent','Outstanding'].map(h => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{filtered.map(c => <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50"><td className="px-5 py-4 font-semibold">{c.name}</td><td className="px-5 py-4 text-slate-600">{c.phone}</td><td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{c.type}</span></td><td className="px-5 py-4">{c.orders}</td><td className="px-5 py-4 font-semibold">{money(c.spent)}</td><td className="px-5 py-4 font-semibold">{money(c.outstanding)}</td></tr>)}</tbody></table></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Total customers</p><p className="mt-2 text-2xl font-bold">{customers.length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">VIP customers</p><p className="mt-2 text-2xl font-bold">{customers.filter(c => c.type === 'VIP').length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Outstanding</p><p className="mt-2 text-2xl font-bold">{money(customers.reduce((sum, c) => sum + c.outstanding, 0))}</p></div></div>
      </div>
    </main>
  );
}
