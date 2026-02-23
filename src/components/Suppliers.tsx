import { supabase } from '../supabase';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, MapPin, Building2, Trash, Edit, X } from 'lucide-react';



export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'Apparel',
    status: 'Active'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        category: 'Apparel',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) {
      setError('Failed to fetch suppliers');
      console.error(error);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.contactPerson) {
      alert('Please fill in required fields');
      return;
    }

    if (editingSupplier) {
      const { error } = await supabase.from('suppliers').update(formData).eq('id', editingSupplier.id);
      if (error) {
        setError('Failed to update supplier');
        console.error(error);
      } else {
        fetchSuppliers();
        handleCloseModal();
      }
    } else {
      const { error } = await supabase.from('suppliers').insert([formData]);
      if (error) {
        setError('Failed to create supplier');
        console.error(error);
      } else {
        fetchSuppliers();
        handleCloseModal();
      }
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== null) {
      const { error } = await supabase.from('suppliers').delete().eq('id', deleteConfirmation);
      if (error) {
        setError('Failed to delete supplier');
        console.error(error);
      } else {
        fetchSuppliers();
        setDeleteConfirmation(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const filteredSuppliers = suppliers.filter((s: any) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Suppliers</h2>
          <p className="text-slate-500 text-sm">Manage your product suppliers and contact information</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search suppliers, contact person, category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((supplier, index) => (
                <tr key={`${supplier.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{supplier.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {supplier.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{supplier.contactPerson}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {supplier.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {supplier.phone}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {supplier.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{supplier.totalOrders}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${supplier.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(supplier)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(supplier.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Full address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmation !== null && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <Trash className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Supplier?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this supplier? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
