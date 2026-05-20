import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Users,
  ClipboardList,
  FileText,
  LogOut,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stock', icon: Package, label: 'Stock' },
  { to: '/sales', icon: ShoppingCart, label: 'POS' },
  { to: '/branches', icon: Building2, label: 'Branches' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/purchases', icon: ClipboardList, label: 'Purchases' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useApp();
  const navigate = useNavigate();
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen h-dvh w-64 bg-dark-800/95 backdrop-blur-xl border-r border-dark-400/30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-400/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center">
              <span className="text-black font-bold text-sm">UL</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">UPIS Lounge</h1>
              <p className="text-[10px] text-gold-500/80">Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-400 border-l-2 border-gold-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-dark-400/30">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
