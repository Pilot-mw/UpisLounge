import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText, Download, Calendar, BarChart3, LineChart, Loader,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line,
} from 'recharts';
import { reportsAPI } from '../services/api';

const CHART_COLORS = ['#d4a853', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

const reportTypes = [
  { id: 'daily', label: 'Daily Report', icon: Calendar },
  { id: 'weekly', label: 'Weekly Report', icon: BarChart3 },
  { id: 'monthly', label: 'Monthly Report', icon: LineChart },
];

export default function Reports() {
  const { currentBranch, branches, selectedBranchId } = useApp();
  const [activeReport, setActiveReport] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { period: activeReport };
        if (selectedBranchId) params.branch = selectedBranchId;
        const res = await reportsAPI.data(params);
        setData(res.data);
      } catch {
        setData(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeReport, selectedBranchId]);

  const branchPerf = data?.branch_performance || branches.map(b => ({
    name: b.name?.split(' ').pop(),
    sales_total: 0,
    sales_count: 0,
  }));

  const branchSales = branchPerf.map(b => ({
    name: b.name?.split(' ').pop() || b.name,
    Sales: Number(b.sales_total) || 0,
    Profit: Math.round((Number(b.sales_total) || 0) * 0.35),
  }));

  const summaryData = {
    daily: {
      total: data?.total_revenue ? `MWK ${Number(data.total_revenue).toLocaleString()}` : 'MWK 0',
      transactions: data?.total_transactions?.toString() || '0',
      avgTicket: data?.avg_ticket ? `MWK ${Math.round(data.avg_ticket).toLocaleString()}` : 'MWK 0',
    },
    weekly: {
      total: data?.total_revenue ? `MWK ${Number(data.total_revenue).toLocaleString()}` : 'MWK 0',
      transactions: data?.total_transactions?.toString() || '0',
      avgTicket: data?.avg_ticket ? `MWK ${Math.round(data.avg_ticket).toLocaleString()}` : 'MWK 0',
    },
    monthly: {
      total: data?.total_revenue ? `MWK ${Number(data.total_revenue).toLocaleString()}` : 'MWK 0',
      transactions: data?.total_transactions?.toString() || '0',
      avgTicket: data?.avg_ticket ? `MWK ${Math.round(data.avg_ticket).toLocaleString()}` : 'MWK 0',
    },
  };

  const current = summaryData[activeReport];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-sm text-gray-500">{currentBranch?.name} — Analytics & Insights</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-amber-500 text-black font-semibold text-sm rounded-lg transition-all duration-200">
          <Download size={15} />
          Export PDF
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {reportTypes.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              activeReport === r.id
                ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                : 'bg-dark-800/60 border-dark-400/20 text-gray-400 hover:text-white hover:border-dark-400/40'
            }`}
          >
            <r.icon size={15} />
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading report data…</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">{current.total}</p>
            </div>
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Transactions</p>
              <p className="text-2xl font-bold text-white mt-1">{current.transactions}</p>
            </div>
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Avg. Ticket</p>
              <p className="text-2xl font-bold text-white mt-1">{current.avgTicket}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Branch Performance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={branchSales.length > 0 ? branchSales : [{ name: 'No data', Sales: 0, Profit: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                  <Bar dataKey="Sales" fill="#d4a853" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Revenue Summary</h3>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center p-3 bg-dark-700/50 rounded-lg">
                  <span className="text-sm text-gray-400">Total Revenue ({activeReport})</span>
                  <span className="text-lg font-bold text-gold-400">{current.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-700/50 rounded-lg">
                  <span className="text-sm text-gray-400">Total Transactions</span>
                  <span className="text-lg font-bold text-white">{current.transactions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-700/50 rounded-lg">
                  <span className="text-sm text-gray-400">Average Ticket</span>
                  <span className="text-lg font-bold text-green-400">{current.avgTicket}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
