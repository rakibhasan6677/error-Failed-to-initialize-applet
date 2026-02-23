import { supabase } from '../supabase';
import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Key, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialSettings = {
    storeName: "IMS Pro Retail",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    lowStockThreshold: 10,
    emailAlerts: true,
    dailySummary: false,
    bkashEnabled: true,
    nagadEnabled: true,
    rocketEnabled: true,
    maxPasswordChanges: 3
  };


  const [showSuccess, setShowSuccess] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  // Generate random 6-digit code
  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setResetCode(code);
    localStorage.setItem('ims_reset_code', code);
    setTimeLeft(60);
  };

  useEffect(() => {
    fetchSettings();
    generateCode();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateCode();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) {
      setError('Failed to fetch settings');
      console.error(error);
      setSettings(initialSettings);
    } else {
      setSettings(data || initialSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase.from('settings').update(settings).eq('id', settings.id);
    if (error) {
      setError('Failed to save settings');
      console.error(error);
    } else {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি পরিবর্তনগুলো বাতিল করতে চান?')) {
      fetchSettings();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your basic store information and preferences.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={settings.storeName} 
                onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BDT">Bangladeshi Taka (৳)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <select 
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
              <input 
                type="number" 
                value={settings.lowStockThreshold} 
                onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Password Changes (Per Month)</label>
              <input 
                type="number" 
                value={settings.maxPasswordChanges} 
                onChange={(e) => setSettings({...settings, maxPasswordChanges: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">Configure how you want to receive alerts.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Bell className="w-5 h-5" /></div>
              <div>
                <p className="font-medium text-slate-900">Email Alerts for Low Stock</p>
                <p className="text-sm text-slate-500">Receive an email when a product hits the low stock threshold.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.emailAlerts}
                onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Shield className="w-5 h-5" /></div>
              <div>
                <p className="font-medium text-slate-900">Daily Summary Report</p>
                <p className="text-sm text-slate-500">Receive a daily digest of sales and inventory changes.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.dailySummary}
                onChange={(e) => setSettings({...settings, dailySummary: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Payment Gateways</h2>
          <p className="text-sm text-slate-500 mt-1">Enable or disable mobile payment methods for POS.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-xs">bKash</div>
              <div>
                <p className="font-medium text-slate-900">bKash Payment</p>
                <p className="text-sm text-slate-500">Enable bKash as a payment method in POS.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.bkashEnabled}
                onChange={(e) => setSettings({...settings, bkashEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs">Nagad</div>
              <div>
                <p className="font-medium text-slate-900">Nagad Payment</p>
                <p className="text-sm text-slate-500">Enable Nagad as a payment method in POS.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.nagadEnabled}
                onChange={(e) => setSettings({...settings, nagadEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">Rocket</div>
              <div>
                <p className="font-medium text-slate-900">Rocket Payment</p>
                <p className="text-sm text-slate-500">Enable Rocket as a payment method in POS.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.rocketEnabled}
                onChange={(e) => setSettings({...settings, rocketEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Security & Password Reset</h2>
          <p className="text-sm text-slate-500 mt-1">Manage user password reset codes.</p>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Password Reset Code</p>
              <div className="text-4xl font-bold text-slate-900 font-mono mt-2 tracking-widest">
                {resetCode}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw className={`w-4 h-4 ${timeLeft < 10 ? 'text-rose-500 animate-spin' : ''}`} />
              <span>Refreshes in <span className={`font-bold ${timeLeft < 10 ? 'text-rose-500' : 'text-indigo-600'}`}>{timeLeft}s</span></span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              এই কোডটি ইউজারকে দিন যাতে তারা তাদের পাসওয়ার্ড পরিবর্তন করতে পারে। এটি প্রতি ১ মিনিট পর পর স্বয়ংক্রিয়ভাবে পরিবর্তন হয়।
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 items-center">
        {showSuccess && (
          <span className="text-emerald-600 font-medium text-sm animate-in fade-in slide-in-from-right-2">
            সেটিংস সফলভাবে সেভ করা হয়েছে!
          </span>
        )}
        <button 
          onClick={handleCancel}
          className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
