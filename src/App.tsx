/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  MapPin,
  ShoppingCart,
  ShoppingBag,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  Calendar,
  Clock,
  Truck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import Locations from './components/Locations';
import Orders from './components/Orders';
import Sales from './components/Sales';
import UsersComponent from './components/Users';
import SettingsComponent from './components/Settings';
import SuppliersComponent from './components/Suppliers';
import Login from './components/Login';

// Mock Data
const chartDataDaily = [
  { name: 'Mon', sales: 4000, purchase: 2400 },
  { name: 'Tue', sales: 3000, purchase: 1398 },
  { name: 'Wed', sales: 2000, purchase: 9800 },
  { name: 'Thu', sales: 2780, purchase: 3908 },
  { name: 'Fri', sales: 1890, purchase: 4800 },
  { name: 'Sat', sales: 2390, purchase: 3800 },
  { name: 'Sun', sales: 3490, purchase: 4300 },
];

const chartDataMonthly = [
  { name: 'Jan', sales: 45000, purchase: 24000 },
  { name: 'Feb', sales: 38000, purchase: 13980 },
  { name: 'Mar', sales: 29000, purchase: 48000 },
  { name: 'Apr', sales: 47800, purchase: 39080 },
  { name: 'May', sales: 58900, purchase: 48000 },
  { name: 'Jun', sales: 43900, purchase: 38000 },
  { name: 'Jul', sales: 64900, purchase: 43000 },
];

const initialProducts = [
  { id: 1, name: 'Premium Cotton T-Shirt', sku: 'TS-001-BLK-M', category: 'Apparel', price: 450, purchasePrice: 300, stock: 120, location: 'Main Warehouse', status: 'In Stock', supplier: 'Global Textiles Ltd.', company: 'Fashion Group' },
  { id: 2, name: 'Denim Jeans Slim Fit', sku: 'DN-002-BLU-32', category: 'Apparel', price: 1200, purchasePrice: 800, stock: 15, location: 'Showroom 1', status: 'Low Stock', supplier: 'Denim Co.', company: 'Fashion Group' },
  { id: 3, name: 'Wireless Earbuds Pro', sku: 'EL-003-WHT', category: 'Electronics', price: 2500, purchasePrice: 1800, stock: 0, location: 'Main Warehouse', status: 'Out of Stock', supplier: 'Tech Accessories Inc.', company: 'Electro Corp' },
  { id: 4, name: 'Leather Wallet Classic', sku: 'AC-004-BRN', category: 'Accessories', price: 850, purchasePrice: 500, stock: 45, location: 'Showroom 2', status: 'In Stock', supplier: 'Leather Goods Co.', company: 'Accessories Ltd' },
  { id: 5, name: 'Running Sneakers', sku: 'FW-005-GRY-42', category: 'Footwear', price: 3200, purchasePrice: 2000, stock: 8, location: 'Main Warehouse', status: 'Low Stock', supplier: 'Sports Gear Inc.', company: 'ActiveWear' },
];

const initialSales = [
  { id: 'INV-001', customer: 'Walk-in Customer', date: 'Oct 24, 2023', amount: 4500, paid: 4500, due: 0, dueDate: null, status: 'Paid', items: 3, cartItems: [{name: 'Premium Cotton T-Shirt', quantity: 3, price: 1500}] },
  { id: 'INV-002', customer: 'Rahim Store', date: 'Oct 24, 2023', amount: 12000, paid: 5000, due: 7000, dueDate: '2023-11-10', status: 'Due', items: 15, cartItems: [{name: 'Denim Jeans Slim Fit', quantity: 10, price: 1200}] },
  { id: 'INV-003', customer: 'Online Order #402', date: 'Oct 23, 2023', amount: 2500, paid: 2500, due: 0, dueDate: null, status: 'Paid', items: 1, cartItems: [{name: 'Wireless Earbuds Pro', quantity: 1, price: 2500}] },
];

const initialOrders = [
  { id: 'PO-2023-001', supplier: 'Global Textiles Ltd.', companyGroup: 'Fashion Group', companyPhone: '01711000000', date: 'Oct 12, 2023', amount: 45000, paid: 45000, due: 0, status: 'Completed', items: [{name: 'Premium Cotton T-Shirt', sku: 'TS-001-BLK-M', qty: 150, purchasePrice: 300, sellingPrice: 450}] },
  { id: 'PO-2023-002', supplier: 'Tech Accessories Inc.', companyGroup: 'Electro Corp', companyPhone: '01811000000', date: 'Oct 15, 2023', amount: 120000, paid: 50000, due: 70000, status: 'Due', items: [] },
  { id: 'PO-2023-003', supplier: 'Leather Goods Co.', companyGroup: 'Accessories Ltd', companyPhone: '01911000000', date: 'Oct 18, 2023', amount: 35500, paid: 20000, due: 15500, status: 'Partially Received', items: [] },
  { id: 'PO-2023-004', supplier: 'Global Textiles Ltd.', companyGroup: 'Fashion Group', companyPhone: '01711000000', date: 'Oct 20, 2023', amount: 85000, paid: 0, due: 85000, status: 'Due', items: [] },
];

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  purchasePrice: number;
  stock: number;
  location: string;
  status: string;
  supplier: string;
  company: string;
}

interface Sale {
  id: string;
  customer: string;
  date: string;
  amount: number;
  paid: number;
  due: number;
  dueDate: string | null;
  status: string;
  items: number;
  cartItems: any[];
  paymentMethod?: string;
}

interface Order {
  id: string;
  supplier: string;
  companyGroup: string;
  companyPhone: string;
  date: string;
  amount: number;
  paid: number;
  due: number;
  status: string;
  items: any[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ims_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('ims_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ims_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id'>>({ name: '', sku: '', category: 'Apparel', price: 0, purchasePrice: 0, stock: 0, location: 'Main Warehouse', status: 'In Stock', supplier: '', company: '' });
  const [chartFilter, setChartFilter] = useState<'daily' | 'monthly'>('monthly');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingPaymentUpdate, setPendingPaymentUpdate] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('ims_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ims_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('ims_orders', JSON.stringify(orders));
  }, [orders]);

  const dueList = sales
    .filter(sale => sale.due > 0)
    .map(sale => ({
      id: sale.id,
      customer: sale.customer,
      amount: sale.due,
      dueDate: sale.dueDate || 'N/A',
      isOverdue: sale.dueDate ? new Date(sale.dueDate) < new Date() : false
    }));

  const overdueNotifications = dueList.filter(due => due.isOverdue);

  const activeOrdersCount = orders.filter(o => o.status !== 'Completed').length;
  const lowStockCount = products.filter(p => p.status !== 'In Stock').length;
  
  const stats = [
    { title: 'Total Inventory Value', value: '৳ 12,45,000', change: '+12.5%', isPositive: true, tab: 'products' },
    { title: 'Low Stock Items', value: lowStockCount.toString(), change: '-2', isPositive: true, tab: 'products' },
    { title: 'Total Locations', value: '3', change: '0', isPositive: true, tab: 'locations' },
    { title: 'Active Purchase Orders', value: activeOrdersCount.toString(), change: '+3', isPositive: false, tab: 'orders' },
  ];

  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData(product);
    } else {
      setEditingProduct(null);
      setProductFormData({ name: '', sku: '', category: 'Apparel', price: 0, purchasePrice: 0, stock: 0, location: 'Main Warehouse', status: 'In Stock', supplier: '', company: '' });
    }
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productFormData, id: p.id } : p));
    } else {
      setProducts([...products, { ...productFormData, id: Date.now() }]);
    }
    setIsAddProductOpen(false);
  };

  const handleDeleteProduct = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales (Out)', icon: ShoppingBag },
    { id: 'orders', label: 'Purchases (In)', icon: ShoppingCart },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderDashboard = () => {
    const gatewayBalances = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'Cash';
      acc[method] = (acc[method] || 0) + sale.paid;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              onClick={() => setActiveTab(stat.tab)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-slate-900">{stat.value}</span>
                <span className={`flex items-center text-xs font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Gateway Balances */}
        {Object.keys(gatewayBalances).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(gatewayBalances).map(([method, balance]) => (
              <div key={method} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px]
                    ${method === 'bKash' ? 'bg-pink-50 text-pink-600' : 
                      method === 'Nagad' ? 'bg-orange-50 text-orange-600' : 
                      method === 'Rocket' ? 'bg-purple-50 text-purple-600' : 
                      method === 'Cash' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-indigo-50 text-indigo-600'}`}>
                    {method}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{method} Balance</p>
                    <p className="text-lg font-bold text-slate-900">৳ {balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Sales vs Purchase Overview</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setChartFilter('daily')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartFilter === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Daily
              </button>
              <button 
                onClick={() => setChartFilter('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartFilter === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartFilter === 'daily' ? chartDataDaily : chartDataMonthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  tickFormatter={(value) => `৳${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }} 
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  labelStyle={{ marginBottom: '4px', fontWeight: 700, color: '#1E293B' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  name="Sales"
                />
                <Area 
                  type="monotone" 
                  dataKey="purchase" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPurchase)" 
                  name="Purchase"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts & Due List */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Low Stock Alerts
              </h3>
              <button onClick={() => setActiveTab('products')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {products.filter(p => p.status !== 'In Stock').slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${product.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {product.stock} left
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{product.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                Customer Dues
              </h3>
              <button onClick={() => setActiveTab('sales')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {dueList.map(due => (
                <div key={due.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{due.customer}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {due.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-600">
                      ৳ {due.amount.toLocaleString()}
                    </p>
                    {due.isOverdue && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded uppercase tracking-wide">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderProducts = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Product Inventory</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products, SKU..." 
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenProductModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku}</td>
                <td className="px-6 py-4 text-slate-600">{product.supplier}</td>
                <td className="px-6 py-4 text-slate-600">{product.company}</td>
                <td className="px-6 py-4 text-slate-600">{product.category}</td>
                <td className="px-6 py-4 text-slate-900">৳ {product.price.toLocaleString()}</td>
                <td className="px-6 py-4 font-medium">{product.stock}</td>
                <td className="px-6 py-4 text-slate-600">{product.location}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${product.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 
                      product.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 
                      'bg-rose-100 text-rose-800'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenProductModal(product)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors mr-2">Edit</button>
                  <button onClick={(e) => handleDeleteProduct(product.id, e)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <span>Showing 1 to {filteredProducts.length} of {filteredProducts.length} entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded font-medium">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileMenu(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={(userData) => {
      setUser(userData);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Package className="w-6 h-6 text-indigo-400 mr-3" />
          <span className="text-lg font-bold text-white tracking-tight">IMS Pro</span>
        </div>
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {overdueNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {overdueNotifications.length > 0 ? (
                      overdueNotifications.map(notification => (
                        <button 
                          key={notification.id} 
                          onClick={() => {
                            setActiveTab('sales');
                            setPendingPaymentUpdate(notification.id);
                            setShowNotifications(false);
                          }}
                          className="w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors block"
                        >
                          <p className="text-sm text-slate-800">
                            Payment overdue for <span className="font-semibold">{notification.customer}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                            <span>Amount: ৳ {notification.amount.toLocaleString()}</span>
                            <span className="text-rose-600 font-medium">Due: {notification.dueDate}</span>
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {user?.name?.charAt(0) || 'A'}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || 'অ্যাডমিন'}</p>
                    <p className="text-xs text-slate-500">{user?.email || 'admin@pos.com'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wide">
                      {user?.role || 'সুপার অ্যাডমিন'}
                    </span>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => { setActiveTab('users'); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      ইউজার ডাটা
                    </button>
                    <button 
                      onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      সেটিংস
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      লগআউট
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'sales' && (
              <Sales 
                sales={sales} 
                setSales={setSales} 
                products={products}
                setProducts={setProducts}
                pendingPaymentUpdate={pendingPaymentUpdate}
                setPendingPaymentUpdate={setPendingPaymentUpdate}
              />
            )}
            {activeTab === 'suppliers' && <SuppliersComponent />}
            {activeTab === 'locations' && <Locations />}
            {activeTab === 'orders' && <Orders orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} />}
            {activeTab === 'users' && <UsersComponent />}
            {activeTab === 'settings' && <SettingsComponent />}
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button 
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input type="text" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Premium T-Shirt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                  <input type="text" value={productFormData.supplier} onChange={e => setProductFormData({...productFormData, supplier: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Global Textiles Ltd." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company/Group</label>
                  <input type="text" value={productFormData.company} onChange={e => setProductFormData({...productFormData, company: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Fashion Group" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input type="text" value={productFormData.sku} onChange={e => setProductFormData({...productFormData, sku: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. TS-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (৳)</label>
                  <input type="number" value={productFormData.price || ''} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (৳)</label>
                  <input type="number" value={productFormData.purchasePrice || ''} onChange={e => setProductFormData({...productFormData, purchasePrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input type="number" value={productFormData.stock || ''} onChange={e => setProductFormData({...productFormData, stock: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Apparel</option>
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Footwear</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <select value={productFormData.location} onChange={e => setProductFormData({...productFormData, location: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Main Warehouse</option>
                    <option>Showroom 1</option>
                    <option>Showroom 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={productFormData.status} onChange={e => setProductFormData({...productFormData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>In Stock</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddProductOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
