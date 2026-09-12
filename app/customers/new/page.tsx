'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CustomerType = 'New' | 'Returning' | 'VIP';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>('New');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const saveCustomer = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (!cleanName || !cleanPhone) {
      setError('Customer name and phone number are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, phone: cleanPhone, type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create customer.');
      router.push('/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create customer.');
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto max-w-3xl px-5 py-5 lg:px-8"><Link href="/customers" className="text-sm font-semibold text-indigo-600">← Back to Customers</Link><p className="mt-4 text-sm font-extrabold tracking-wide text-indigo-600">CUSTOMERS</p><h1 className="mt-1 text-2xl font-bold">Add Customer</h1></div></header>
      <div className="mx-auto max-w-3xl px-5 py-7 lg:px-8"><form onSubmit={(e) => { e.preventDefault(); saveCustomer(); }} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold">Customer name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="Full name" /></label>
        <label className="block text-sm font-semibold">Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" placeholder="024 000 0000" /></label>
        <label className="block text-sm font-semibold">Customer type<select value={type} onChange={(e) => setType(e.target.value as CustomerType)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"><option>New</option><option>Returning</option><option>VIP</option></select></label>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <div className="flex justify-end"><button disabled={saving} type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save Customer'}</button></div>
      </form></div>
    </main>
  );
}
