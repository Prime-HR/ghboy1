import Link from 'next/link';

const cards = [
  ['Today’s Sales', 'GH₵ 0', 'No sales recorded today'],
  ['Orders', '0', 'No orders yet'],
  ['Profit', 'GH₵ 0', 'No profit recorded today'],
  ['Outstanding', 'GH₵ 0', 'All payments are settled'],
];

const attention = [
  ['Payment pending', 'No outstanding customer payments', 'text-emerald-600'],
  ['Delivery queue', 'No deliveries waiting', 'text-emerald-600'],
  ['Stock alerts', 'No low-stock alerts', 'text-emerald-600'],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div>
            <p className="text-sm font-extrabold tracking-wide text-indigo-600">FASHION SELLER PRO</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Business Dashboard</h1>
          </div>
          <Link href="/orders/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">+ Quick Sale</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, note]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
              <p className="mt-2 text-xs text-slate-400">{note}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between">
              <div><h2 className="font-bold">Sales Overview</h2><p className="mt-1 text-xs text-slate-400">Last 7 days</p></div>
              <Link href="/reports" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View reports →</Link>
            </div>
            <div className="mt-6 flex h-56 items-end gap-3 rounded-xl bg-slate-50 p-5">
              {[18, 35, 26, 52, 42, 68, 48].map((height, i) => (
                <div key={i} className="flex h-full flex-1 items-end">
                  <div className="w-full rounded-t-lg bg-indigo-500/80" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">Needs Attention</h2>
            <div className="mt-5 space-y-4">
              {attention.map(([title, text, color]) => (
                <div key={title} className="flex gap-3">
                  <span className={`mt-0.5 ${color}`}>✓</span>
                  <div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-slate-500">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Record Sale', '/orders/new', 'Record a customer order'],
              ['Add Product', '/products/new', 'Add stock to your catalog'],
              ['Add Customer', '/customers/new', 'Save a customer'],
              ['Add Expense', '/expenses/new', 'Record a business expense'],
            ].map(([label, href, description]) => (
              <Link key={label} href={href} className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                <p className="font-semibold">{label}</p><p className="mt-1 text-xs text-slate-500">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
