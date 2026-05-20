import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Search, User, Phone, Clock, Loader } from 'lucide-react';

const roleConfig = {
  Manager: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  Cashier: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  Bartender: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  Waiter: { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const attendanceConfig = {
  Present: { color: 'bg-green-500/20 text-green-400', dot: 'bg-green-500' },
  Absent: { color: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' },
  Late: { color: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-500' },
};

export default function Employees() {
  const { employees, currentBranch, loading } = useApp();
  const [search, setSearch] = useState('');

  const filtered = employees.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading employees…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Employees</h1>
          <p className="text-sm text-gray-500">{currentBranch?.name} — {employees.length} staff</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-800/80 border border-dark-400/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((employee) => {
          const roleStyle = roleConfig[employee.role] || roleConfig.Waiter;
          const attStyle = attendanceConfig[employee.attendance_status] || attendanceConfig.Absent;
          return (
            <div
              key={employee.id}
              className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4 hover:border-gold-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-500/30 to-amber-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-gold-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">{employee.full_name}</h3>
                    <span className={`w-2 h-2 rounded-full ${attStyle.dot} flex-shrink-0`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {employee.branch_name || ''}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${roleStyle.color} flex-shrink-0`}>
                  {employee.role}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${attStyle.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${attStyle.dot}`} />
                  {employee.attendance_status}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {employee.shift_time}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dark-400/20 flex items-center gap-1.5 text-xs text-gray-500">
                <Phone size={12} />
                {employee.phone || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
