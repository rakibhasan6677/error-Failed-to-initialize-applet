import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Plus, UserPlus, Edit, Trash, X } from 'lucide-react';

const initialUsers = [
  { id: 0, name: 'অ্যাডমিন', email: 'admin@pos.com', role: 'Admin', location: 'All Locations', status: 'Active', username: 'admin' },
  { id: 1, name: 'Rahim Uddin', email: 'rahim@example.com', role: 'Admin', location: 'All Locations', status: 'Active', username: 'rahim' },
  { id: 2, name: 'Karim Hasan', email: 'karim@example.com', role: 'Manager', location: 'Main Warehouse', status: 'Active', username: 'karim' },
  { id: 3, name: 'Salma Akter', email: 'salma@example.com', role: 'Staff', location: 'Showroom 1', status: 'Inactive', username: 'salma' },
  { id: 4, name: 'Jamil Ahmed', email: 'jamil@example.com', role: 'Staff', location: 'Showroom 2', status: 'Active', username: 'jamil' },
];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  location: string;
  status: string;
  username?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ims_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse users from localStorage", e);
        return initialUsers;
      }
    }
    return initialUsers;
  });

  useEffect(() => {
    localStorage.setItem('ims_users', JSON.stringify(users));
  }, [users]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id'>>({ name: '', email: '', role: 'Staff', location: 'Main Warehouse', status: 'Active', username: '' });

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user, username: user.username || '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'Staff', location: 'Main Warehouse', status: 'Active', username: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(prevUsers => prevUsers.map(u => u.id === editingUser.id ? { ...formData, id: u.id } : u));
    } else {
      setUsers(prevUsers => [...prevUsers, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (id === 0) { // Assuming admin user has id 0
      alert("Admin user cannot be deleted.");
      return;
    }
    if(window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
    }
  };

  const handleUnblock = (username: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে আপনি ${username}-কে আনব্লক করতে চান?`)) {
      localStorage.removeItem(`ims_blocked_${username}`);
      localStorage.removeItem(`ims_pass_history_${username}`);
      alert(`${username} সফলভাবে আনব্লক করা হয়েছে।`);
    }
  };

  const filteredUsers = users.map(u => {
    if (u.username) {
      const isBlocked = localStorage.getItem(`ims_blocked_${u.username}`) === 'true';
      if (isBlocked) return { ...u, status: 'Blocked' };
    }
    return u;
  }).filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users, roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Assigned Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 
                      'bg-slate-100 text-slate-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.location}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 
                      user.status === 'Blocked' ? 'bg-rose-100 text-rose-800 animate-pulse' : 
                      'bg-slate-100 text-slate-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.status === 'Blocked' && user.username && (
                    <button 
                      onClick={() => handleUnblock(user.username!)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors mr-2 text-xs font-bold underline"
                    >
                      Unblock
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(user)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors mr-2"><Edit className="w-4 h-4" /></button>
                  <button 
                    onClick={(e) => handleDelete(user.id, e)} 
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed"
                    disabled={user.id === 0}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
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
              <h3 className="text-lg font-semibold text-slate-900">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. rahim123" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Location</label>
                <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Locations</option>
                  <option>Main Warehouse</option>
                  <option>Showroom 1</option>
                  <option>Showroom 2</option>
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
    </div>
  );
}
