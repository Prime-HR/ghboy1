import Link from 'next/link';

const links = [
  { href: '/', label: 'Dashboard', icon: '⌂' },
  { href: '/orders', label: 'Orders', icon: '▣' },
  { href: '/products', label: 'Products', icon: '□' },
  { href: '/customers', label: 'Customers', icon: '♙' },
  { href: '/expenses', label: 'Expenses', icon: '₵' },
  { href: '/reports', label: 'Reports', icon: '▥' },
];

export default function Navigation() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-white lg:block">
      <div className="sticky top-0 flex min-h-screen flex-col p-5">
        <Link href="/" className="mb-8 block">
          <p className="text-sm font-extrabold tracking-wide text-indigo-600">FASHION SELLER PRO</p>
          <p className="mt-1 text-xs text-slate-500">Ghana Edition</p>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">BUSINESS</p>
          <p className="mt-1 font-bold">My Fashion Store</p>
          <p className="mt-1 text-xs text-slate-500">GHS · Ghana</p>
        </div>
      </div>
    </aside>
  );
}
