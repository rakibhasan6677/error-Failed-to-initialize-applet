import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Package, Search, Plus, Edit, Trash, X } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    purchasePrice: '',
    stock: '',
    location: '',
    status: 'In Stock',
    supplier: '',
    company: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      setError('Failed to fetch products');
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: '',
        price: '',
        purchasePrice: '',
        stock: '',
        location: '',
        status: 'In Stock',
        supplier: '',
        company: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingProduct) {
      const { error } = await supabase.from('products').update(formData).eq('id', editingProduct.id);
      if (error) {
        setError('Failed to update product');
        console.error(error);
      } else {
        fetchProducts();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase.from('products').insert([formData]);
      if (error) {
        setError('Failed to create product');
        console.error(error);
      } else {
        fetchProducts();
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        setError('Failed to delete product');
        console.error(error);
      } else {
        fetchProducts();
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Product Inventory</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
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
            Add Product
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Supplier Name</th>
              <th className="px-6 py-4">Company/Group</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Selling Price (৳)</th>
              <th className="px-6 py-4">Purchase Price (৳)</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{product.supplier}</td>
                <td className="px-6 py-4 text-slate-600">{product.company}</td>
                <td className="px-6 py-4 text-slate-600">{product.sku}</td>
                <td className="px-6 py-4 text-slate-600">৳ {product.price}</td>
                <td className="px-6 py-4 text-slate-600">৳ {product.purchasePrice}</td>
                <td className="px-6 py-4 text-slate-600">{product.stock}</td>
                <td className="px-6 py-4 text-slate-600">{product.category}</td>
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
                  <button onClick={() => handleOpenModal(product)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors mr-2"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="text" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="number" placeholder="Purchase Price" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
                <input type="text" placeholder="Supplier" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                <input type="text" placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
