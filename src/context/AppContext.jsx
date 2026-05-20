import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import api, { branchesAPI, inventoryAPI, employeesAPI, purchasesAPI, reportsAPI } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('upis_access_token'));
  const [dashboardData, setDashboardData] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [lastSync, setLastSync] = useState('Just now');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const fetchRef = useRef(null);

  const loginAction = useCallback((access, refresh) => {
    localStorage.setItem('upis_access_token', access);
    localStorage.setItem('upis_refresh_token', refresh);
    setIsLoggedIn(true);
  }, []);

  const logoutAction = useCallback(() => {
    localStorage.removeItem('upis_access_token');
    localStorage.removeItem('upis_refresh_token');
    setIsLoggedIn(false);
    setBranches([]);
    setInventory([]);
    setEmployees([]);
    setPurchases([]);
    setDashboardData(null);
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await branchesAPI.list();
      setBranches(res.data.results || res.data);
      if (res.data.results?.length > 0 && !selectedBranchId) {
        setSelectedBranchId(res.data.results[0].id);
      } else if (res.data.length > 0 && !selectedBranchId) {
        setSelectedBranchId(res.data[0].id);
      }
    } catch { /* ignore */ }
  }, [selectedBranchId]);

  const fetchInventory = useCallback(async () => {
    try {
      const params = selectedBranchId ? { branch: selectedBranchId } : {};
      const res = await inventoryAPI.list(params);
      setInventory(res.data.results || res.data);
    } catch { /* ignore */ }
  }, [selectedBranchId]);

  const fetchEmployees = useCallback(async () => {
    try {
      const params = selectedBranchId ? { branch: selectedBranchId } : {};
      const res = await employeesAPI.list(params);
      setEmployees(res.data.results || res.data);
    } catch { /* ignore */ }
  }, [selectedBranchId]);

  const fetchPurchases = useCallback(async () => {
    try {
      const params = selectedBranchId ? { branch: selectedBranchId } : {};
      const res = await purchasesAPI.list(params);
      setPurchases(res.data.results || res.data);
    } catch { /* ignore */ }
  }, [selectedBranchId]);

  const fetchDashboard = useCallback(async () => {
    try {
      const params = selectedBranchId ? { branch: selectedBranchId } : {};
      const res = await reportsAPI.dashboard(params);
      setDashboardData(res.data);
      setTransactionsCount(res.data.transactions_today || 0);
    } catch { /* ignore */ }
  }, [selectedBranchId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchBranches(),
      fetchInventory(),
      fetchEmployees(),
      fetchPurchases(),
      fetchDashboard(),
    ]);
    setLoading(false);
  }, [fetchBranches, fetchInventory, fetchEmployees, fetchPurchases, fetchDashboard]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAll();
      const iv = setInterval(fetchAll, 30000);
      return () => clearInterval(iv);
    }
  }, [isLoggedIn, selectedBranchId]);

  useEffect(() => {
    if (isLoggedIn) {
      const iv = setInterval(() => {
        const now = new Date();
        const secs = Math.floor((now - new Date(now.getTime() - 3000)) / 1000);
        setLastSync(secs <= 5 ? 'Just now' : `${secs}s ago`);
      }, 5000);
      return () => clearInterval(iv);
    }
  }, [isLoggedIn]);

  const switchBranch = useCallback((id) => {
    setSelectedBranchId(Number(id));
  }, []);

  const confirmSale = useCallback(async (productId, soldQty, unitPrice) => {
    if (!selectedBranchId) return;
    const branchId = branches.find(b => b.id === selectedBranchId)?.id || selectedBranchId;
    try {
      const res = await (await import('../services/api')).salesAPI.create({
        branch_id: branchId,
        items: [{ product_id: productId, quantity: soldQty, unit_price: unitPrice }],
      });
      setActivityFeed(prev => [
        {
          id: Date.now(),
          msg: `POS Sale: ${soldQty} × ${res.data.items?.[0]?.product_name || 'Product'} — MWK ${(soldQty * unitPrice).toLocaleString()}`,
          type: 'sale',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 50));
      setTransactionsCount(c => c + 1);
      await fetchInventory();
      await fetchDashboard();
      return res.data;
    } catch (err) {
      throw err;
    }
  }, [selectedBranchId, branches, fetchInventory, fetchDashboard]);

  const currentBranch = useMemo(
    () => branches.find(b => b.id === selectedBranchId),
    [branches, selectedBranchId]
  );

  const branchData = useMemo(() => {
    const branchInv = selectedBranchId
      ? inventory.filter(i => i.branch === selectedBranchId || i.branch_id === selectedBranchId)
      : inventory;
    const branchEmp = selectedBranchId
      ? employees.filter(e => e.branch === selectedBranchId || e.branch_id === selectedBranchId)
      : employees;
    const branchPur = selectedBranchId
      ? purchases.filter(p => p.branch === selectedBranchId || p.branch_id === selectedBranchId)
      : purchases;

    const totalStockValue = branchInv.reduce((sum, i) => sum + ((i.remaining_stock || 0) * parseFloat(i.selling_price || 0)), 0);
    const lowStockItems = branchInv.filter(i => (i.remaining_stock || 0) <= (i.reorder_level || 5));
    const activeStaff = branchEmp.filter(e => e.attendance_status === 'Present').length;

    return {
      products: branchInv.map(i => ({
        id: i.id,
        productId: i.product,
        productName: i.product_name || 'Unknown',
        category: i.category_name || 'N/A',
        branch: i.branch_name || '',
        branchId: i.branch || i.branch_id,
        open: i.open_stock || 0,
        add: i.added_stock || 0,
        total: (i.open_stock || 0) + (i.added_stock || 0),
        sellingPrice: parseFloat(i.selling_price || 0),
        remain: i.remaining_stock || 0,
        sold: i.sold_stock || 0,
        totalAmount: (i.sold_stock || 0) * parseFloat(i.selling_price || 0),
        status: i.remaining_stock <= 0 ? 'Out of Stock' : i.remaining_stock <= (i.reorder_level || 5) ? 'Low Stock' : 'In Stock',
      })),
      sales: null,
      staff: branchEmp,
      purchases: branchPur,
      totalStockValue,
      lowStockItems,
      activeStaff,
    };
  }, [inventory, employees, purchases, selectedBranchId]);

  const value = {
    branches,
    selectedBranchId: selectedBranchId || branches[0]?.id || null,
    switchBranch,
    currentBranch,
    branchData,
    inventory,
    employees,
    purchases,
    dashboardData,
    confirmSale,
    isLoggedIn,
    setIsLoggedIn: loginAction,
    logout: logoutAction,
    activityFeed,
    setActivityFeed,
    transactionsCount,
    lastSync,
    notifications,
    loading,
    refreshData: fetchAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
