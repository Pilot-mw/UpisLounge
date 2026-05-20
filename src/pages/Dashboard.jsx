import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, Package, AlertTriangle, Users,
  ArrowUp, ArrowDown, Activity, Clock, ShoppingCart,
  Zap, Bell, Loader,
} from 'lucide-react';

const CHART_COLORS = ['#d4a853', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];
const PIE_COLORS = ['#d4a853', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#6b7280'];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-700 border border-dark-400/50 rounded-lg p-3 shadow-xl">
        <p className="text-white text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-xs">
            {entry.name}: MWK {Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function AnimatedValue({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = Number(value) || 0;
    const duration = 800;
    const startTime = performance.now();
    prevValue.current = end;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

const activityIcons = { sale: ShoppingCart, stock: Package, alert: AlertTriangle, info: Bell };
const activityColors = { sale: 'text-green-400', stock: 'text-blue-400', alert: 'text-amber-400', info: 'text-gray-400' };
const activityBg = {
  sale: 'bg-green-500/10 border-green-500/20',
  stock: 'bg-blue-500/10 border-blue-500/20',
  alert: 'bg-amber-500/10 border-amber-500/20',
  info: 'bg-dark-600/50 border-dark-400/20',
};

export default function Dashboard() {
  const {
    selectedBranchId, currentBranch, branches,
    branchData, dashboardData,
    activityFeed, transactionsCount, lastSync, loading,
  } = useApp();

  const { totalStockValue, lowStockItems, activeStaff } = branchData;
  const salesToday = dashboardData?.sales_today || 0;
  const profit = Math.round(salesToday * 0.35);

  const summaryCards = [
    {
      label: 'Total Sales Today',
      value: salesToday,
      prefix: 'MWK ',
      change: dashboardData ? 'Real-time' : '—',
      up: true,
      icon: DollarSign,
      gradient: 'from-green-500/20 to-emerald-500/5',
      border: 'border-green-500/20',
      textColor: 'text-green-400',
    },
    {
      label: 'Total Profit',
      value: profit,
      prefix: 'MWK ',
      change: 'Est. 35% margin',
      up: true,
      icon: TrendingUp,
      gradient: 'from-gold-500/20 to-amber-500/5',
      border: 'border-gold-500/20',
      textColor: 'text-gold-400',
    },
    {
      label: 'Stock Value',
      value: totalStockValue,
      prefix: 'MWK ',
      change: '',
      up: true,
      icon: Package,
      gradient: 'from-blue-500/20 to-cyan-500/5',
      border: 'border-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      label: 'Low Stock Items',
      value: lowStockItems.length,
      change: lowStockItems.length > 3 ? 'Needs attention' : 'Good',
      up: lowStockItems.length <= 3,
      icon: AlertTriangle,
      gradient: lowStockItems.length > 3 ? 'from-red-500/20 to-orange-500/5' : 'from-emerald-500/20 to-green-500/5',
      border: lowStockItems.length > 3 ? 'border-red-500/20' : 'border-emerald-500/20',
      textColor: lowStockItems.length > 3 ? 'text-red-400' : 'text-emerald-400',
    },
    {
      label: 'Active Staff',
      value: activeStaff,
      change: `${branchData.staff.length} total`,
      up: true,
      icon: Users,
      gradient: 'from-purple-500/20 to-pink-500/5',
      border: 'border-purple-500/20',
      textColor: 'text-purple-400',
    },
  ];

  const barData = (dashboardData?.sales_by_branch || branches.map(b => ({
    id: b.id, name: b.short || b.name, total_sales: null,
  }))).map(b => ({
    name: b.name?.split(' ').pop() || b.name,
    Sales: Number(b.total_sales) || 0,
  }));

  const trendData = dashboardData?.revenue_trend || [];
  const topSellingData = dashboardData?.top_selling || [];

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {currentBranch?.name || 'All Branches'} — Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            System Online
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            {lastSync}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.gradient} backdrop-blur-sm p-4 hover:scale-[1.02] transition-all duration-200 cursor-default group`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-bold text-white">
                  {typeof card.value === 'number' ? (
                    <AnimatedValue value={card.value} prefix={card.prefix} suffix={card.suffix || ''} />
                  ) : (
                    card.prefix ? card.prefix + card.value : card.value?.toString() || '0'
                  )}
                </p>
                <div className={`flex items-center gap-1 text-xs ${card.up ? 'text-green-400' : 'text-red-400'}`}>
                  {card.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {card.change}
                </div>
              </div>
              <div className={`p-2.5 rounded-lg ${card.textColor} bg-dark-800/50 group-hover:scale-110 transition-transform`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Activity size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">System Status</p>
                <p className="text-sm font-semibold text-green-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Activity size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Database</p>
                <p className="text-sm font-semibold text-green-400">Connected</p>
              </div>
            </div>
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Zap size={18} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Transactions Today</p>
                <p className="text-sm font-semibold text-white">
                  <AnimatedValue value={transactionsCount} />
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Sales per Branch</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData.length > 0 ? barData : [{ name: 'No data', Sales: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Sales" fill="#d4a853" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Revenue Trend (7 days)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData.length > 0 ? trendData : [{ day: '—', revenue: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#d4a853" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Top Selling Drinks</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={topSellingData.length > 0 ? topSellingData : [{ product_name: 'No data', total_qty: 1 }]}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="total_qty"
                    nameKey="product_name"
                  >
                    {(topSellingData.length > 0 ? topSellingData : [{ product_name: 'No data', total_qty: 1 }]).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: '#888' }}
                    formatter={(value) => <span className="text-gray-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4 flex flex-col h-[400px] lg:h-[500px] xl:h-auto">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-dark-400/20">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-gold-400" />
              <h3 className="text-sm font-semibold text-white">Live Activity</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
            {activityFeed.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs">
                <Activity size={24} className="mx-auto mb-2 opacity-30" />
                Waiting for activity…
              </div>
            )}
            {activityFeed.map((event) => {
              const Icon = activityIcons[event.type] || Bell;
              const color = activityColors[event.type] || 'text-gray-400';
              const bg = activityBg[event.type] || 'bg-dark-600/50 border-dark-400/20';
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border ${bg} animate-fadeIn`}
                >
                  <div className={`mt-0.5 ${color}`}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-300 leading-snug">{event.msg}</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">{event.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
