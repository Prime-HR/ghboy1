const cards = [
  ['Today\'s Sales', 'GH₵ 0'],
  ['Orders', '0'],
  ['Profit', 'GH₵ 0'],
  ['Outstanding', 'GH₵ 0'],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">FASHION SELLER PRO</p>
            <h1 className="text-xl font-bold">Business Dashboard</h1>
          </div>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">+ Quick Sale</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
            <h2 className="font-bold">Sales Overview</h2>
            <div className="mt-8 flex h-48 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
              Sales chart will appear here
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="font-bold">Needs Attention</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <p>✓ No payment reminders</p>
              <p>✓ No deliveries waiting</p>
              <p>✓ No low-stock alerts</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-6">
          <h2 className="font-bold">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['Record Sale', 'Add Product', 'Add Customer', 'Add Expense'].map((action) => (
              <button key={action} className="rounded-xl border px-4 py-4 text-left font-semibold hover:bg-slate-50">
                {action}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
