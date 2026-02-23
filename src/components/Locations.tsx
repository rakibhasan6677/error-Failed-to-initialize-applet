import { supabase } from '../supabase';
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, X } from 'lucide-react';



export default function Locations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Warehouse', address: '', capacity: '0%', status: 'Active' });

  const handleOpenModal = (location: any = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData(location);
    } else {
      setEditingLocation(null);
      setFormData({ name: '', type: 'Warehouse', address: '', capacity: '0%', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('locations').select('*');
    if (error) {
      setError('Failed to fetch locations');
      console.error(error);
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (editingLocation) {
      const { error } = await supabase.from('locations').update(formData).eq('id', editingLocation.id);
      if (error) {
        setError('Failed to update location');
        console.error(error);
      } else {
        fetchLocations();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase.from('locations').insert([formData]);
      if (error) {
        setError('Failed to create location');
        console.error(error);
      } else {
        fetchLocations();
        setIsModalOpen(false);
      }
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== null) {
      const { error } = await supabase.from('locations').delete().eq('id', deleteConfirmation);
      if (error) {
        setError('Failed to delete location');
        console.error(error);
      } else {
        fetchLocations();
        setDeleteConfirmation(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Locations Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search locations..." 
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
            Add Location
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Capacity Used</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLocations.map((loc, index) => (
              <tr key={`${loc.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {loc.name}
                </td>
                <td className="px-6 py-4 text-slate-600">{loc.type}</td>
                <td className="px-6 py-4 text-slate-600">{loc.address}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: loc.capacity }}></div>
                    </div>
                    <span className="text-xs text-slate-500">{loc.capacity}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {loc.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(loc)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors mr-2"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteClick(loc.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editingLocation ? 'Edit Location' : 'Add Location'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Warehouse</option>
                    <option>Showroom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacity Used</label>
                  <input type="text" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmation !== null && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Location?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this location? This action cannot be undone.
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
