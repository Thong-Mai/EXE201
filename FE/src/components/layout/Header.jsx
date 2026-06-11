import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, LogOut, Flame, ShieldAlert, Award, CreditCard, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout, xp, streak, balance, notifications, markNotificationRead } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleToggleNotif = () => setShowNotif(!showNotif);
  
  const handleRead = (id) => {
    markNotificationRead(id);
  };

  const formattedBalance = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance);

  const handleRoleSwitch = () => {
    if (user?.role === 'admin') {
      // Switch mock user to standard user
      logout();
      navigate('/login');
    } else {
      // Mock switch to admin
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/40 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-green flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-teal-500/20">
          S+
        </div>
        <div className="hidden sm:block">
          <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-green">SAVE+</span>
          <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-widest">Kiến Thức Là Tài Sản</span>
        </div>
      </div>

      {/* Action center indicators */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {user?.role !== 'admin' && (
          <>
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 bg-amber-500/10 dark:bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 transition-all cursor-pointer" title="Chuỗi học tập hàng ngày">
              <Flame size={18} className="fill-amber-500 streak-active" />
              <span className="font-bold text-sm">{streak} ngày</span>
            </div>

            {/* XP Points */}
            <div className="flex items-center space-x-1.5 bg-indigo-500/10 dark:bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all" title="Điểm kinh nghiệm học tập">
              <Award size={18} />
              <span className="font-bold text-sm">{xp} XP</span>
            </div>

            {/* Virtual Balance */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" title="Số dư tài khoản thử nghiệm">
              <CreditCard size={17} />
              <span className="font-bold text-xs font-mono">{formattedBalance}</span>
            </div>
          </>
        )}

        {/* Role Toggle Badge */}
        {user && (
          <div 
            onClick={() => {
              // Quick helper: switch between user / admin layouts for review purposes
              logout();
              if (user.role === 'admin') {
                login('user@saveplus.vn', '123456', 'user');
                navigate('/');
              } else {
                login('admin@saveplus.vn', '123456', 'admin');
                navigate('/admin');
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 cursor-pointer transition-all"
            title="Nhấn để đổi vai trò chạy thử nhanh"
          >
            <ShieldAlert size={14} />
            <span className="hidden sm:inline">Vai trò:</span>
            <span className="uppercase">{user.role === 'admin' ? 'Quản Trị' : 'Người Học'}</span>
          </div>
        )}

        {/* Dark/Light mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={handleToggleNotif}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative"
          >
            <Bell size={18} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadNotifs}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 glass-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-sm">
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-100/50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="font-bold">Thông báo mới ({unreadNotifs})</span>
                {unreadNotifs > 0 && <span className="text-xs text-brand-teal font-medium">Bấm để đọc</span>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/30">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Không có thông báo mới</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleRead(n.id)}
                      className={`p-3 transition-colors cursor-pointer ${n.read ? 'opacity-65 hover:bg-slate-50 dark:hover:bg-slate-800/20' : 'bg-teal-500/5 dark:bg-teal-500/5 hover:bg-teal-500/10 dark:hover:bg-teal-500/10'}`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`font-semibold ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-1.5 focus:outline-none"
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-teal/20"
              />
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-sm">
                <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/40">
                  <span className="block font-bold text-slate-800 dark:text-white truncate">{user.name}</span>
                  <span className="block text-xs text-slate-400 truncate">{user.email}</span>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate(user.role === 'admin' ? '/admin' : '/profile'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Thông tin tài khoản
                  </button>
                  <button 
                    onClick={() => { setShowProfileDropdown(false); logout(); navigate('/login'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/30 text-red-500 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-teal to-brand-green text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:opacity-90 transition-all"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}

// In case AuthProvider needs to toggle roles, we inject login helper directly in action switch
function login(email, password, role) {
  const userName = role === 'admin' ? 'Admin Quản Trị' : 'Nguyễn Hoàng Lâm';
  const mockUser = {
    id: role === 'admin' ? 'A001' : 'U001',
    name: userName,
    email: email,
    role: role,
    avatar: role === 'admin' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  };
  localStorage.setItem('saveplus_user', JSON.stringify(mockUser));
  window.location.reload();
}
