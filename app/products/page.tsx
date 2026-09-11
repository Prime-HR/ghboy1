const products = [
  { name: 'Ankara Dress', sku: 'ANK-001', category: 'Dresses', price: 'GH₵ 350', cost: 'GH₵ 220', stock: 8, status: 'In stock' },
  { name: 'Linen Shirt', sku: 'LIN-002', category: 'Tops', price: 'GH₵ 180', cost: 'GH₵ 100', stock: 3, status: 'Low stock' },
  { name: 'Two-Piece Set', sku: 'SET-003', category: 'Sets', price: 'GH₵ 420', cost: 'GH₵ 260', stock: 0, status: 'Out of stock' },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">FASHION SELLER PRO</p>
            <h1 className="text-xl font-bold">Products</h1>
          </div>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">+ Add Product</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your products</h2>
            <p className="mt-1 text-sm text-slate-500">Manage prices, costs and stock in one place.</p>
          </div>
          <input className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Search products..." />
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Selling price</th>
                  <th className="px-5 py-4 font-semibold">Cost</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.sku} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-4"><p className="font-semibold text-slate-900">{product.name}</p><p className="text-xs text-slate-400">{product.sku}</p></td>
                    <td className="px-5 py-4 text-slate-600">{product.category}</td>
                    <td className="px-5 py-4 font-semibold">{product.price}</td>
                    <td className="px-5 py-4 text-slate-600">{product.cost}</td>
                    <td className="px-5 py-4">{product.stock}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{product.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Total products</p><p className="mt-2 text-2xl font-bold">3</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Low stock</p><p className="mt-2 text-2xl font-bold">1</p></div>
          <div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Out of stock</p><p className="mt-2 text-2xl font-bold">1</p></div>
        </div>
      </div>
    </main>
  );
}
