import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, FileText, Eye, Edit, Trash, X, CreditCard, Receipt } from 'lucide-react';

export default function Orders({ orders, setOrders, products, setProducts }: { orders: any[], setOrders: (orders: any[]) => void, products: any[], setProducts: (products: any[]) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({ id: '', supplier: '', companyGroup: '', companyPhone: '', date: '', amount: '' as number | '', paid: '' as number | '', due: 0, status: 'Due', items: [] as any[] });
  const [productSearch, setProductSearch] = useState('');

  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [newPayment, setNewPayment] = useState<number | ''>('');

  const handleOpenModal = (order: any = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData(order);
    } else {
      setEditingOrder(null);
      setFormData({ id: `PO-${Date.now().toString().slice(-6)}`, supplier: '', companyGroup: '', companyPhone: '', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount: '', paid: '', due: 0, status: 'Due', items: [] });
    }
    setIsModalOpen(true);
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let autoGroup = formData.companyGroup;
    let autoPhone = formData.companyPhone;

    if (value.trim() !== '') {
      const existingOrder = orders.find(o => o.supplier.toLowerCase() === value.toLowerCase());
      if (existingOrder) {
        autoGroup = existingOrder.companyGroup || '';
        autoPhone = existingOrder.companyPhone || '';
      }
    }

    setFormData({
      ...formData,
      supplier: value,
      companyGroup: autoGroup,
      companyPhone: autoPhone
    });
  };

  const searchResults = productSearch.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProductToPO = (product: any) => {
    const existingItemIndex = formData.items.findIndex(item => item.sku === product.sku);
    let newItems = [...formData.items];
    
    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].qty += 1;
    } else {
      newItems.push({
        name: product.name,
        sku: product.sku,
        qty: 1,
        purchasePrice: product.purchasePrice || '',
        sellingPrice: product.price || ''
      });
    }
    
    const newAmount = newItems.reduce((sum, item) => sum + (item.qty * item.purchasePrice), 0);
    setFormData({ ...formData, items: newItems, amount: newAmount });
    setProductSearch('');
  };

  const updatePOItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    const newAmount = newItems.reduce((sum, item) => sum + (item.qty * (Number(item.purchasePrice) || 0)), 0);
    setFormData({ ...formData, items: newItems, amount: newAmount || '' });
  };

  const removePOItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newAmount = newItems.reduce((sum, item) => sum + (item.qty * (Number(item.purchasePrice) || 0)), 0);
    setFormData({ ...formData, items: newItems, amount: newAmount || '' });
  };

  const handleSave = () => {
    const finalAmount = Number(formData.amount) || 0;
    const finalPaid = Number(formData.paid) || 0;
    const calculatedDue = finalAmount - finalPaid;
    const finalData = {
      ...formData,
      amount: finalAmount,
      paid: finalPaid,
      due: calculatedDue,
      status: calculatedDue <= 0 ? 'Completed' : (finalPaid > 0 ? 'Partially Received' : 'Due')
    };

    // Update products state
    if (!editingOrder) {
      const updatedProducts = [...products];
      finalData.items.forEach(item => {
        const existingIdx = updatedProducts.findIndex(p => p.sku === item.sku);
        if (existingIdx >= 0) {
          updatedProducts[existingIdx].stock += item.qty;
          updatedProducts[existingIdx].price = item.sellingPrice;
          updatedProducts[existingIdx].purchasePrice = item.purchasePrice;
        } else {
          updatedProducts.push({
            id: Date.now() + Math.random(),
            name: item.name,
            sku: item.sku,
            category: 'Uncategorized',
            price: item.sellingPrice,
            purchasePrice: item.purchasePrice,
            stock: item.qty,
            location: 'Main Warehouse',
            status: 'In Stock',
            supplier: formData.supplier,
            company: formData.companyGroup
          });
        }
      });
      setProducts(updatedProducts);
    }

    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? finalData : o));
    } else {
      setOrders([...orders, finalData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(o => o.id !== id));
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

    const updatedOrders = orders.map(o => {
      if (o.id === paymentModal.id) {
        const updatedPaid = o.paid + newPayment;
        const updatedDue = o.amount - updatedPaid;
        return {
          ...o,
          paid: updatedPaid,
          due: updatedDue,
          status: updatedDue <= 0 ? 'Completed' : 'Partially Received'
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    setPaymentModal(null);
    setNewPayment('');
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Purchase Orders</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search PO ID, Supplier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create PO
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">PO Number</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Paid</th>
              <th className="px-6 py-4">Due</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order, index) => (
              <tr key={`${order.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-indigo-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  {order.id}
                </td>
                <td className="px-6 py-4 text-slate-900">{order.supplier}</td>
                <td className="px-6 py-4 text-slate-600">{order.date}</td>
                <td className="px-6 py-4 font-medium">৳ {order.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">৳ {order.paid.toLocaleString()}</td>
                <td className="px-6 py-4 text-rose-600 font-medium">৳ {order.due.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                      order.status === 'Due' ? 'bg-amber-100 text-amber-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button onClick={() => setViewInvoice(order)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="View Invoice"><Eye className="w-4 h-4" /></button>
                  {order.due > 0 && (
                    <button onClick={() => { setPaymentModal(order); setNewPayment(''); }} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors" title="Update Payment"><CreditCard className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => handleOpenModal(order)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(order.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editingOrder ? 'Edit PO' : 'Create PO'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                  <input type="text" value={formData.supplier} onChange={handleSupplierChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Global Textiles Ltd." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Group</label>
                  <input type="text" value={formData.companyGroup} onChange={e => setFormData({...formData, companyGroup: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Fashion Group" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Phone</label>
                  <input type="text" value={formData.companyPhone} onChange={e => setFormData({...formData, companyPhone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 01711000000" />
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-3 border-b border-slate-200">
                  <h4 className="font-medium text-slate-700 mb-2">Order Items</h4>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search products by name or SKU to add..." 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map(product => (
                          <div 
                            key={product.id} 
                            onClick={() => addProductToPO(product)}
                            className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-slate-700">Stock: {product.stock}</p>
                              <p className="text-xs text-slate-500">Buy: ৳{product.purchasePrice}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={item.sku} className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-white p-3 border border-slate-100 rounded-lg shadow-sm">
                      <div className="w-full md:w-1/4">
                        <label className="block text-xs text-slate-500 mb-1">Product Name</label>
                        <input type="text" value={item.name} onChange={e => updatePOItem(idx, 'name', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50" placeholder="Name" />
                      </div>
                      <div className="w-full md:w-1/5">
                        <label className="block text-xs text-slate-500 mb-1">SKU</label>
                        <input type="text" value={item.sku} onChange={e => updatePOItem(idx, 'sku', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50" placeholder="SKU" />
                      </div>
                      <div className="w-full md:w-24">
                        <label className="block text-xs text-slate-500 mb-1">Qty</label>
                        <input type="number" value={item.qty} onChange={e => updatePOItem(idx, 'qty', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" min="1" />
                      </div>
                      <div className="w-full md:w-32">
                        <label className="block text-xs text-slate-500 mb-1">Purchase Price (৳)</label>
                        <input type="number" value={item.purchasePrice} onChange={e => updatePOItem(idx, 'purchasePrice', e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                      </div>
                      <div className="w-full md:w-32">
                        <label className="block text-xs text-slate-500 mb-1">Selling Price (৳)</label>
                        <input type="number" value={item.sellingPrice} onChange={e => updatePOItem(idx, 'sellingPrice', e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="0" />
                      </div>
                      <div className="w-full md:w-auto pt-5">
                        <button onClick={() => removePOItem(idx)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      No items added yet. Click "Add Item" to start.
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (৳) - Auto Calculated</label>
                  <input type="number" value={formData.amount} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-medium" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paid Amount (৳)</label>
                  <input type="number" value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save PO</button>
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
                <h3 className="text-lg font-semibold text-slate-900">Purchase Order {viewInvoice.id}</h3>
              </div>
              <button onClick={() => setViewInvoice(null)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">Supplier:</p>
                  <p className="font-medium text-slate-900">{viewInvoice.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Date:</p>
                  <p className="font-medium text-slate-900">{viewInvoice.date}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">Items</h4>
                  {viewInvoice.items && viewInvoice.items.length > 0 ? (
                    <div className="space-y-2">
                      {viewInvoice.items.map((item: any) => (
                        <div key={item.sku} className="flex justify-between text-slate-600">
                          <span>{item.name} <span className="text-xs text-slate-400">({item.qty} x ৳{item.purchasePrice})</span></span>
                          <span className="font-medium text-slate-900">৳ {(item.qty * item.purchasePrice).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">No items recorded.</p>
                  )}
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount:</span>
                  <span className="font-medium text-slate-900">৳ {viewInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Paid Amount:</span>
                  <span className="font-medium">৳ {viewInvoice.paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600 pt-2 border-t border-slate-200">
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
