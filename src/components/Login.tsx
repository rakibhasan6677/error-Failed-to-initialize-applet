import React, { useState } from 'react';
import { Lock, User, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [view, setView] = useState<'login' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset password states
  const [resetUsername, setResetUsername] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      // Check if blocked
      const isBlocked = localStorage.getItem(`ims_blocked_${username}`) === 'true';
      if (isBlocked) {
        setError('আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।');
        setIsLoading(false);
        return;
      }

      // Check for updated password in localStorage if any
      const savedPassword = localStorage.getItem(`ims_pass_${username}`);
      const effectivePassword = savedPassword || 'admin123';

      if (username === 'admin' && password === effectivePassword) {
        onLogin({ name: 'অ্যাডমিন', email: 'admin@pos.com', role: 'সুপার অ্যাডমিন' });
      } else {
        setError('ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে।');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const currentCode = localStorage.getItem('ims_reset_code');
    const savedSettings = localStorage.getItem('ims_settings');
    let maxChanges = 3;
    if (savedSettings) {
      try {
        maxChanges = JSON.parse(savedSettings).maxPasswordChanges || 3;
      } catch (e) {}
    }

    setTimeout(() => {
      const isMasterCode = adminCode === '173804' && resetUsername === 'admin';
      
      // Check if blocked
      const isBlocked = localStorage.getItem(`ims_blocked_${resetUsername}`) === 'true';
      if (isBlocked && !isMasterCode) {
        setError('আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।');
        setIsLoading(false);
        return;
      }

      if (adminCode === currentCode || isMasterCode) {
        if (resetUsername === 'admin') {
          // Check history
          const historyKey = `ims_pass_history_${resetUsername}`;
          const historyStr = localStorage.getItem(historyKey);
          let history: number[] = historyStr ? JSON.parse(historyStr) : [];
          
          const now = Date.now();
          const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
          
          // Filter history to last 30 days
          history = history.filter(ts => ts > thirtyDaysAgo);
          
          if (history.length >= maxChanges && !isMasterCode) {
            localStorage.setItem(`ims_blocked_${resetUsername}`, 'true');
            setError('আপনি এক মাসে পাসওয়ার্ড পরিবর্তনের সীমা অতিক্রম করেছেন। আপনার অ্যাকাউন্ট ব্লক করা হয়েছে।');
            setIsLoading(false);
            return;
          }

          // Update password and history
          localStorage.setItem(`ims_pass_${resetUsername}`, newPassword);
          if (isMasterCode) {
            // Unblock if master code used
            localStorage.removeItem(`ims_blocked_${resetUsername}`);
          }
          history.push(now);
          localStorage.setItem(historyKey, JSON.stringify(history));

          setResetSuccess(true);
          setTimeout(() => {
            setView('login');
            setResetSuccess(false);
            setResetUsername('');
            setAdminCode('');
            setNewPassword('');
          }, 2000);
        } else {
          setError('ইউজার খুঁজে পাওয়া যায়নি।');
        }
      } else {
        setError('অ্যাডমিন কোডটি ভুল অথবা মেয়াদোত্তীর্ণ।');
      }
      setIsLoading(false);
    }, 1000);
  };

  if (view === 'reset') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-indigo-600 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">পাসওয়ার্ড পরিবর্তন</h2>
            <p className="text-indigo-100 mt-1">অ্যাডমিন কোড ব্যবহার করে পাসওয়ার্ড সেট করুন</p>
          </div>

          {resetSuccess ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">সফল হয়েছে!</h3>
              <p className="text-slate-500">আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। লগইন পেজে নিয়ে যাওয়া হচ্ছে...</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="p-8 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ইউজারনেম</label>
                <input 
                  type="text" 
                  required
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">অ্যাডমিন কোড (১ মিনিট মেয়াদী)</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono tracking-widest text-center text-xl" 
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">নতুন পাসওয়ার্ড</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'পাসওয়ার্ড আপডেট করুন'
                )}
              </button>

              <button 
                type="button"
                onClick={() => setView('login')}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                লগইন পেজে ফিরে যান
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">IMS Pro Retail</h2>
          <p className="text-indigo-100 mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইউজারনেম</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                placeholder="admin"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'লগইন করুন'
            )}
          </button>
          
          <div className="text-center">
            <button 
              type="button"
              onClick={() => setView('reset')}
              className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন? অ্যাডমিন কোড দিয়ে রিসেট করুন।
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
