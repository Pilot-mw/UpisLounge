import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Edit3, Trash2, Search, Beer, Wine, Loader,
} from 'lucide-react';

const statusConfig = {
  'In Stock': { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'Low Stock': { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'Out of Stock': { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const categoryIcons = { Beer: Beer, Spirit: Wine };

function formatMWK(value) {
  return 'MWK ' + Number(value).toLocaleString();
}

export default function Stock() {
  const { branchData, loading } = useApp();
  const { products } = branchData;
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filtered = products.filter(p => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading stock data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Stock Management</h1>
          <p className="text-sm text-gray-500">Castel Malawi — Inventory Overview</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-amber-500 text-black font-semibold text-sm rounded-lg transition-all duration-200">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-800/80 border border-dark-400/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                filterCategory === cat
                  ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                  : 'bg-dark-800/60 border-dark-400/20 text-gray-400 hover:text-white hover:border-dark-400/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-dark-400/30">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-dark-800/80">
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ITEM</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">OPEN</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">ADD</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">TOTAL</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">SELLING PRICE</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">REMAIN</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">SOLD</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">TOTAL AMOUNT</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">STATUS</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-400/20">
            {filtered.map((product) => {
              const Icon = categoryIcons[product.category] || Beer;
              const { color } = statusConfig[product.status] || statusConfig['In Stock'];
              return (
                <tr key={product.id} className="hover:bg-dark-700/30 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dark-600/80 flex items-center justify-center text-gray-400">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{product.productName}</p>
                        <p className="text-gray-500 text-xs">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-white font-medium text-sm">{product.open}</td>
                  <td className="px-3 py-3 text-right text-white font-medium text-sm">{product.add}</td>
                  <td className="px-3 py-3 text-right text-white font-bold text-sm">{product.total}</td>
                  <td className="px-3 py-3 text-right text-gold-400 font-medium text-sm">{formatMWK(product.sellingPrice)}</td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-sm font-bold ${product.remain <= 0 ? 'text-red-400' : product.remain <= 5 ? 'text-amber-400' : 'text-white'}`}>
                      {product.remain}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-white font-medium text-sm">{product.sold}</td>
                  <td className="px-3 py-3 text-right text-green-400 font-bold text-sm">{formatMWK(product.totalAmount)}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${color}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-gold-400 hover:bg-dark-600/50 rounded transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-dark-600/50 rounded transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No products found</div>
        )}
      </div>
    </div>
  );
}
