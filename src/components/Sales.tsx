import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Edit, Trash, X, Minus, Eye, CreditCard, Receipt } from 'lucide-react';

// Mock products for the POS search
const availableProducts = [
  { id: 1, name: 'Premium Cotton T-Shirt', sku: 'TS-001', price: 450, stock: 120 },
  { id: 2, name: 'Denim Jeans Slim Fit', sku: 'DN-002', price: 1200, stock: 15 },
  { id: 3, name: 'Wireless Earbuds Pro', sku: 'EL-003', price: 2500, stock: 5 },
  { id: 4, name: 'Leather Wallet Classic', sku: 'AC-004', price: 850, stock: 45 },
  { id: 5, name: 'Running Sneakers', sku: 'FW-005', price: 3200, stock: 8 },
];

export default function Sales({ 
  sales, 
  setSales, 
  products, 
  pendingPaymentUpdate, 
  setPendingPaymentUpdate 
}: { 
  sales: any[], 
  setSales: (sales: any[]) => void, 
  products: any[],
  pendingPaymentUpdate?: string | null,
  setPendingPaymentUpdate?: (id: string | null) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [newPayment, setNewPayment] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [enabledGateways, setEnabledGateways] = useState<string[]>(['Cash']);

  const productSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('ims_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const gateways = ['Cash'];
        if (settings.bkashEnabled) gateways.push('bKash');
        if (settings.nagadEnabled) gateways.push('Nagad');
        if (settings.rocketEnabled) gateways.push('Rocket');
        setEnabledGateways(gateways);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, [isModalOpen, paymentModal]);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        productSearchInputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (pendingPaymentUpdate && setPendingPaymentUpdate) {
      const saleToUpdate = sales.find(s => s.id === pendingPaymentUpdate);
      if (saleToUpdate && saleToUpdate.due > 0) {
        setPaymentModal(saleToUpdate);
        setNewPayment('');
        setPaymentMethod('Cash');
      }
      setPendingPaymentUpdate(null);
    }
  }, [pendingPaymentUpdate, sales, setPendingPaymentUpdate]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const calculatedDue = totalAmount - (typeof paidAmount === 'number' ? paidAmount : 0);
  const currentStatus = calculatedDue > 0 ? 'Due' : 'Paid';

  const handleOpenModal = () => {
    setCustomerName('');
    setCart([]);
    setProductSearch('');
    setPaidAmount('');
    setDueDate('');
    setPaymentMethod('Cash');
    setIsModalOpen(true);
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        alert('Not enough stock available!');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        alert('Product is out of stock!');
      }
    }
    setProductSearch('');
    setTimeout(() => {
      productSearchInputRef.current?.focus();
    }, 0);
  };

  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);

    if (value.trim() !== '') {
      // Check for exact SKU match
      const skuMatch = products.find(p => p.sku.toLowerCase() === value.toLowerCase());
      if (skuMatch) {
        addToCart(skuMatch);
      }
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (cart.length === 0) {
      alert('Please add at least one product to the cart.');
      return;
    }

    const finalCustomer = customerName.trim() === '' ? 'Walk-in Customer' : customerName;
    const finalPaid = typeof paidAmount === 'number' ? paidAmount : 0;
    
    const newSale = {
      id: `INV-00${sales.length + 1}`,
      customer: finalCustomer,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: totalAmount,
      paid: finalPaid,
      due: calculatedDue,
      dueDate: calculatedDue > 0 && dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      status: currentStatus,
      items: totalItems,
      cartItems: cart,
      paymentMethod: paymentMethod
    };

    setSales([newSale, ...sales]);
    setIsModalOpen(false);
  };

  const searchResults = productSearch.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this sale record?')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  const handleUpdatePayment = () => {
    if (typeof newPayment !== 'number' || newPayment <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    
    if (newPayment > paymentModal.due) {
      alert('Payment amount cannot be greater than the due amount.');
      return;
    }

    const updatedSales = sales.map(s => {
      if (s.id === paymentModal.id) {
        const updatedPaid = s.paid + newPayment;
        const updatedDue = s.amount - updatedPaid;
        return {
          ...s,
          paid: updatedPaid,
          due: updatedDue,
          status: updatedDue <= 0 ? 'Paid' : 'Due',
          lastPaymentMethod: paymentMethod
        };
      }
      return s;
    });

    setSales(updatedSales);
    setPaymentModal(null);
    setNewPayment('');
  };

  const filteredSales = sales.filter(sale => 
    sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Sales (Stock Out)</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Scan Barcode..." 
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-48 bg-slate-50"
            />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Invoice, Customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button 
            onClick={handleOpenModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Sale
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Invoice No</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Items Sold</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Paid</th>
              <th className="px-6 py-4">Due</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-indigo-600 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  {sale.id}
                </td>
                <td className="px-6 py-4 text-slate-900">{sale.customer}</td>
                <td className="px-6 py-4 text-slate-600">{sale.date}</td>
                <td className="px-6 py-4 text-slate-600">{sale.items} items</td>
                <td className="px-6 py-4 font-medium">৳ {sale.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">৳ {sale.paid.toLocaleString()}</td>
                <td className="px-6 py-4 text-rose-600 font-medium">৳ {sale.due.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{sale.dueDate || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${sale.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button onClick={() => setViewInvoice(sale)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="View Invoice"><Eye className="w-4 h-4" /></button>
                  {sale.due > 0 && (
                    <button onClick={() => { setPaymentModal(sale); setNewPayment(''); setPaymentMethod('Cash'); }} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors" title="Update Payment"><CreditCard className="w-4 h-4" /></button>
                  )}
                  <button onClick={(e) => handleDelete(sale.id, e)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-semibold text-slate-900">Point of Sale (POS)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left Side - Product Search & Cart */}
              <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden min-h-[300px]">
                <div className="p-4 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      ref={productSearchInputRef}
                      type="text" 
                      placeholder="Search products by name or SKU..." 
                      value={productSearch}
                      onChange={handleProductSearchChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(product => (
                          <div 
                            key={product.id} 
                            onClick={() => addToCart(product)}
                            className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500">SKU: {product.sku} | Stock: {product.stock}</p>
                            </div>
                            <p className="text-sm font-semibold text-indigo-600">৳ {product.price}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
                      <p className="text-sm">Cart is empty. Search and add products.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">৳ {item.price} each</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-200 rounded-lg">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg"><Minus className="w-4 h-4" /></button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg"><Plus className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 w-16 text-right">৳ {item.price * item.quantity}</p>
                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Checkout Details */}
              <div className="w-full lg:w-96 flex flex-col bg-white shrink-0 border-t lg:border-t-0 border-slate-100">
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Walk-in Customer" />
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Total Items:</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Amount:</span>
                      <span className="text-indigo-600">৳ {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Paid Amount (৳)</label>
                    <input 
                      type="number" 
                      value={paidAmount} 
                      onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold text-emerald-600" 
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {enabledGateways.map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                            paymentMethod === method 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {calculatedDue > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700">
                        <span className="font-medium">Due Amount:</span>
                        <span className="text-lg font-bold">৳ {calculatedDue.toLocaleString()}</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <input 
                          type="date" 
                          value={dueDate} 
                          onChange={e => setDueDate(e.target.value)} 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50">
                  <button 
                    onClick={handleSave} 
                    disabled={cart.length === 0}
                    className="w-full py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Complete Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-indigo-600">
                <Receipt className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-slate-900">Invoice {viewInvoice.id}</h3>
              </div>
              <button onClick={() => setViewInvoice(null)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">Billed To:</p>
                  <p className="font-medium text-slate-900">{viewInvoice.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Date:</p>
                  <p className="font-medium text-slate-900">{viewInvoice.date}</p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewInvoice.cartItems && viewInvoice.cartItems.map((item: any) => (
                      <tr key={item.id || item.sku}>
                        <td className="px-4 py-3 text-slate-900">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity} x ৳ {item.price.toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">৳ {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!viewInvoice.cartItems && (
                      <tr>
                        <td className="px-4 py-3 text-slate-900">Total Items ({viewInvoice.items})</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">৳ {viewInvoice.amount.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount:</span>
                  <span className="font-medium text-slate-900">৳ {viewInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Paid Amount:</span>
                  <span className="font-medium">৳ {viewInvoice.paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600 pt-2 border-t border-slate-100">
                  <span className="font-medium">Due Amount:</span>
                  <span className="font-bold">৳ {viewInvoice.due.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setViewInvoice(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Update Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Update Payment - {paymentModal.id}</h3>
              <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount:</span>
                  <span className="font-medium text-slate-900">৳ {paymentModal.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Already Paid:</span>
                  <span className="font-medium text-emerald-600">৳ {paymentModal.paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200">
                  <span>Current Due:</span>
                  <span className="text-rose-600">৳ {paymentModal.due.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Payment Amount (৳)</label>
                <input 
                  type="number" 
                  value={newPayment} 
                  onChange={e => setNewPayment(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold text-emerald-600" 
                  placeholder="0"
                  max={paymentModal.due}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {enabledGateways.map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                        paymentMethod === method 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setPaymentModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdatePayment} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
