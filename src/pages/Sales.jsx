import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Beer, Wine, Package, X, ShoppingCart, Check, CreditCard, Loader } from 'lucide-react';

const categoryIcons = { Beer: Beer, Spirit: Wine };
const categoryColors = {
  Beer: 'border-l-green-500',
  Spirit: 'border-l-amber-500',
};

function formatMWK(value) {
  return 'MWK ' + Number(value).toLocaleString();
}

export default function Sales() {
  const { branchData, confirmSale, loading } = useApp();
  const { products } = branchData;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [soldQty, setSoldQty] = useState(1);
  const [editRemain, setEditRemain] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('');
  const [error, setError] = useState('');

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setSoldQty(1);
    setEditRemain(String(product.remain));
    setEditPrice(String(product.sellingPrice));
    setError('');
  };

  const closeModal = () => {
    if (processing) return;
    setSelectedProduct(null);
    setCheckoutStep('');
    setError('');
  };

  const handleSoldQtyChange = (val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setSoldQty(qty);
    if (selectedProduct) {
      const projectedRemain = selectedProduct.remain - qty;
      setEditRemain(String(Math.max(0, projectedRemain)));
    }
  };

  const handleConfirm = async () => {
    if (!selectedProduct || soldQty <= 0) return;
    if (soldQty > selectedProduct.remain) {
      setError('Not enough stock available');
      return;
    }
    const price = parseInt(editPrice) || selectedProduct.sellingPrice;
    setProcessing(true);
    setCheckoutStep('processing');

    try {
      await confirmSale(selectedProduct.id, soldQty, price);
      setCheckoutStep('approved');
      showToast(`${soldQty} × ${selectedProduct.productName} sold`, 'success');
      setTimeout(() => {
        setProcessing(false);
        setCheckoutStep('');
        closeModal();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Sale failed. Please try again.');
      setProcessing(false);
      setCheckoutStep('');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading POS data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fadeIn relative w-full">
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-slideInRight">
          <div className="bg-green-500/90 backdrop-blur-xl border border-green-400/30 rounded-lg px-4 py-3 shadow-2xl shadow-green-500/20 flex items-center gap-2.5">
            <Check size={16} className="text-white" />
            <span className="text-sm font-medium text-white">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">POS — Point of Sale</h1>
          <p className="text-sm text-gray-500">Click a product to record a sale</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-800/80 border border-dark-400/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              category === cat
                ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                : 'bg-dark-800/60 border-dark-400/20 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 content-start pb-4">
        {filtered.map(product => {
          const Icon = categoryIcons[product.category] || Package;
          const borderColor = categoryColors[product.category] || 'border-l-gray-500';
          return (
            <button
              key={product.id}
              onClick={() => openModal(product)}
              className={`bg-dark-800/70 border border-dark-400/20 hover:border-gold-500/40 rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-gold-500/5 border-l-2 ${borderColor} ${
                product.remain <= 0 ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-dark-600/80 flex items-center justify-center text-gray-400 mb-2">
                <Icon size={18} />
              </div>
              <p className="text-sm font-medium text-white truncate">{product.productName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-semibold text-gold-400">{formatMWK(product.sellingPrice)}</p>
                <span className={`text-[10px] font-medium ${product.remain <= 0 ? 'text-red-400' : product.remain <= 5 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {product.remain} left
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-dark-800 border border-dark-400/30 rounded-2xl w-full max-w-md shadow-2xl shadow-black/60 overflow-hidden" onClick={e => e.stopPropagation()}>
            {!checkoutStep ? (
              <>
                <div className="flex items-center justify-between p-5 border-b border-dark-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-amber-500/10 border border-gold-500/20 flex items-center justify-center">
                      <ShoppingCart size={18} className="text-gold-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Record Sale</h3>
                      <p className="text-xs text-gray-500">{selectedProduct.branch}</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-gray-500 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="bg-dark-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Product</p>
                    <p className="text-sm font-semibold text-white">{selectedProduct.productName}</p>
                    <p className="text-xs text-gray-500">{selectedProduct.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Sold Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.remain}
                        value={soldQty}
                        onChange={(e) => handleSoldQtyChange(e.target.value)}
                        className="w-full bg-dark-700 border border-dark-400/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Remaining Stock</label>
                      <input
                        type="number"
                        min="0"
                        max={selectedProduct.total}
                        value={editRemain}
                        readOnly
                        className="w-full bg-dark-700/50 border border-dark-400/20 rounded-lg px-3 py-2 text-sm text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Selling Price (MWK)</label>
                    <input
                      type="number"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-dark-700 border border-dark-400/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  <div className="bg-dark-700/50 rounded-lg p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Current Stock</span>
                      <span className="text-white font-medium">{selectedProduct.remain}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>After Sale</span>
                      <span className="text-white font-bold">{Math.max(0, selectedProduct.remain - soldQty)}</span>
                    </div>
                    <div className="flex justify-between text-gold-400 border-t border-dark-400/20 pt-1.5 mt-1.5">
                      <span>Total Amount</span>
                      <span className="font-bold">{formatMWK(soldQty * (parseInt(editPrice) || selectedProduct.sellingPrice))}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-dark-400/20">
                  <button onClick={closeModal} className="flex-1 py-2 rounded-lg border border-dark-400/30 text-sm text-gray-400 hover:text-white hover:bg-dark-600 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={soldQty <= 0 || processing}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-amber-500 text-black font-semibold text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={15} />
                    Charge
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center gap-4 animate-fadeIn">
                {checkoutStep === 'processing' && (
                  <>
                    <div className="w-14 h-14 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">Processing payment…</p>
                      <p className="text-xs text-gray-500 mt-1">Please wait</p>
                    </div>
                  </>
                )}
                {checkoutStep === 'approved' && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center animate-fadeIn">
                      <Check size={28} className="text-green-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm">Payment Approved</p>
                      <p className="text-xs text-gray-500 mt-1">Receipt generated</p>
                    </div>
                    <div className="bg-dark-700/50 rounded-lg p-3 w-full text-sm space-y-1">
                      <div className="flex justify-between text-gray-400">
                        <span>Product</span>
                        <span className="text-white">{selectedProduct.productName}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Qty</span>
                        <span className="text-white">{soldQty}</span>
                      </div>
                      <div className="flex justify-between text-gold-400 border-t border-dark-400/20 pt-1 mt-1">
                        <span>Total</span>
                        <span className="font-bold">{formatMWK(soldQty * (parseInt(editPrice) || selectedProduct.sellingPrice))}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
