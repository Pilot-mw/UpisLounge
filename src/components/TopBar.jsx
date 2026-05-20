import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Bell, Menu, ChevronDown, User, Settings, LogOut,
  CheckCircle, AlertTriangle, Info, Building2,
} from 'lucide-react';

const typeIcons = { success: CheckCircle, warning: AlertTriangle, info: Info };
const typeColors = { success: 'text-green-400', warning: 'text-amber-400', info: 'text-blue-400' };

export default function TopBar({ onMenuClick }) {
  const { branches, selectedBranchId, switchBranch, currentBranch, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, message: 'System connected to database', type: 'success', time: 'Just now' },
    { id: 2, message: `${currentBranch?.name || 'All branches'} — data synced`, type: 'info', time: '1 min ago' },
  ];

  return (
    <header className="h-16 bg-dark-800/80 backdrop-blur-xl border-b border-dark-400/30 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white">
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-1 bg-dark-700/60 border border-dark-400/20 rounded-lg p-0.5">
          <Building2 size={14} className="text-gold-500 ml-2 flex-shrink-0" />
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => switchBranch(b.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                selectedBranchId === b.id
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-black shadow-lg shadow-gold-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {b.name?.split(' ').pop() || b.short}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-600/50 rounded-lg transition-all"
          >
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute top-full mt-2 right-0 w-80 bg-dark-700 border border-dark-400/30 rounded-lg shadow-2xl shadow-black/50 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-400/30">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map(n => {
                    const Icon = typeIcons[n.type];
                    const color = typeColors[n.type];
                    return (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-dark-600/50 transition-colors">
                        <Icon size={16} className={`${color} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300">{n.message}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 text-gray-400 hover:text-white hover:bg-dark-600/50 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center">
              <User size={16} className="text-black" />
            </div>
            <ChevronDown size={14} className={`hidden sm:block transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
              <div className="absolute top-full mt-2 right-0 w-52 bg-dark-700 border border-dark-400/30 rounded-lg shadow-2xl shadow-black/50 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-400/30">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-500">admin@upislounge.com</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-600 transition-colors">
                    <Settings size={15} />
                    Settings
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-dark-600 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
