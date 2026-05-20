import { useApp } from '../context/AppContext';
import { Building2, DollarSign, Users, Package, MapPin, Loader } from 'lucide-react';

export default function Branches() {
  const { branches, dashboardData, loading } = useApp();

  if (loading && branches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading branch data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-white">Branch Management</h1>
        <p className="text-sm text-gray-500">Manage all UPIS Lounge locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => {
          const branchSales = dashboardData?.sales_by_branch?.find(b => b.id === branch.id);
          const salesToday = Number(branchSales?.total_sales) || 0;
          return (
            <div
              key={branch.id}
              className="group bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-gold-500 to-amber-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-amber-500/10 border border-gold-500/20 flex items-center justify-center">
                      <Building2 size={22} className="text-gold-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{branch.name?.split(' ').pop()}</h3>
                      <p className="text-xs text-gray-500">{branch.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <MapPin size={12} className="text-gold-500" />
                  {branch.location}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                    <DollarSign size={16} className="text-green-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">MWK {salesToday.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">Sales Today</p>
                  </div>
                  <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                    <Package size={16} className="text-amber-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">Active</p>
                    <p className="text-[10px] text-gray-500">Status</p>
                  </div>
                  <div className="bg-dark-700/50 rounded-lg p-3 text-center">
                    <Users size={16} className="text-blue-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">—</p>
                    <p className="text-[10px] text-gray-500">Staff</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-400/20 space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Manager</span>
                    <span className="text-gray-300">{branch.manager_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact</span>
                    <span className="text-gray-300">{branch.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email</span>
                    <span className="text-gray-300">{branch.email || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
