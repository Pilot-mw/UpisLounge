import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function PageLoader() {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl animate-shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="h-72 rounded-xl animate-shimmer" />
        <div className="h-72 rounded-xl animate-shimmer" />
        <div className="h-72 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}

export default function Layout() {
  const { isLoggedIn } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-dark-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        {loading ? <PageLoader /> : <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 w-full"><Outlet /></main>}
      </div>
    </div>
  );
}
