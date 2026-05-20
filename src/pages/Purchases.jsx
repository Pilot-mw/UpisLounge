import { useApp } from '../context/AppContext';
import { ClipboardList, Search, Loader } from 'lucide-react';
import { useState } from 'react';

export default function Purchases() {
  const { purchases, currentBranch, loading } = useApp();
  const [search, setSearch] = useState('');

  const filtered = purchases.filter(p =>
    p.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && purchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading purchases…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Purchases</h1>
          <p className="text-sm text-gray-500">{currentBranch?.name} — {purchases.length} records</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-800/80 border border-dark-400/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-dark-400/30">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-dark-800/80">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Qty</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Cost</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-400/20">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-dark-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark-600/80 flex items-center justify-center text-gray-400">
                      <ClipboardList size={15} />
                    </div>
                    <span className="text-white text-sm">{p.supplier_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{p.product_name || p.product_name_field}</td>
                <td className="px-4 py-3 text-right text-white font-medium">{p.quantity}</td>
                <td className="px-4 py-3 text-right text-gold-400 font-medium">MWK {Number(p.cost).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{p.date}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-gray-500 bg-dark-700/50 px-2 py-1 rounded">{p.invoice_number || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No purchases found</div>
        )}
      </div>
    </div>
  );
}
