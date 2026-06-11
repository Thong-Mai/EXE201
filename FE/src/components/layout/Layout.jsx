import React, { useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingAIChat from './FloatingAIChat';
import { LayoutDashboard, BookOpen, TrendingUp, BarChart2, Compass, Shield, Globe } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Double check admin route security
  if (location.pathname.startsWith('/admin') && user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  // Double check standard user route security
  if (!location.pathname.startsWith('/admin') && (user.role === 'admin' || user.role === 'staff') && location.pathname !== '/profile') {
    return <Navigate to="/admin" replace />;
  }

  // Mobile navigation options depending on role
  let mobileNavItems = [];
  if (user.role === 'admin') {
    mobileNavItems = [
      { name: 'Admin', path: '/admin', icon: Shield },
      { name: 'Khách', path: '/admin/users', icon: Shield },
      { name: 'Khóa Học', path: '/admin/courses', icon: BookOpen },
      { name: 'Phân Tích', path: '/admin/analytics', icon: BarChart2 }
    ];
  } else if (user.role === 'staff') {
    mobileNavItems = [
      { name: 'Admin', path: '/admin', icon: Shield },
      { name: 'Khách', path: '/admin/users', icon: Shield },
      { name: 'Duyệt', path: '/admin/approvals', icon: Compass }
    ];
  } else {
    mobileNavItems = [
      { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
      { name: 'Học tập', path: '/learning', icon: BookOpen },
      { name: 'Giả lập', path: '/simulation', icon: TrendingUp },
      { name: 'AI Mentor', path: '/mentor', icon: Compass }
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Header />
      
      <div className="flex flex-1 relative">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden pb-20 md:pb-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200/50 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 flex justify-around items-center py-2 px-1 z-40 shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center space-y-0.5 px-2 py-1 rounded-xl transition-all ${
                  isActive 
                    ? 'text-brand-teal font-semibold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Global Floating AI Chat Window */}
      <FloatingAIChat />
    </div>
  );
}
