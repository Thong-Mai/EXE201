import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  TrendingUp, 
  BarChart2, 
  Target, 
  MessageSquare, 
  Users, 
  Bell, 
  User, 
  LayoutDashboard, 
  Compass,
  Award,
  Settings,
  Shield,
  LogOut,
  HelpCircle,
  FolderLock,
  Globe
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav item list for standard learner role
  const userNavItems = [
    { name: 'Bảng Điều Khiển', path: '/', icon: LayoutDashboard },
    { name: 'Khóa Học Của Tôi', path: '/learning', icon: BookOpen },
    { name: 'Giả Lập Đầu Tư', path: '/simulation', icon: TrendingUp },
    { name: 'Kế Hoạch & Mục Tiêu', path: '/goals', icon: Target },
    { name: 'Người Bạn AI Mentor', path: '/mentor', icon: Compass },
    { name: 'Cộng Đồng Tự Học', path: '/community', icon: MessageSquare },
    { name: 'Hồ Sơ Cá Nhân', path: '/profile', icon: User }
  ];

  // Nav item list for administrative role
  const adminNavItems = [
    { name: 'Tổng Quan Admin', path: '/admin', icon: Shield },
    { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: Users },
    { name: 'Quản Lý Khóa Học', path: '/admin/courses', icon: BookOpen },
    { name: 'Phân Tích Học Tập', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Gói Hội Viên & Cài Đặt', path: '/admin/subscriptions', icon: Settings }
  ];

  const staffNavItems = [
    { name: 'Tổng Quan Admin', path: '/admin', icon: Shield },
    { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: Users },
    { name: 'Duyệt Hồ Sơ (KYC)', path: '/admin/approvals', icon: Compass }
  ];

  let currentItems = userNavItems;
  if (user?.role === 'admin') currentItems = adminNavItems;
  if (user?.role === 'staff') currentItems = staffNavItems;

  return (
    <aside className="w-64 h-[calc(100vh-65px)] sticky top-[65px] glass-panel border-r border-slate-200/50 dark:border-slate-800/40 p-4 flex flex-col justify-between hidden md:flex shrink-0">
      {/* Menu links list */}
      <div className="space-y-1">
        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider px-3 mb-2">
          {user?.role === 'admin' || user?.role === 'staff' ? 'Bảng Quản Trị' : 'Danh mục chính'}
        </span>
        {currentItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-teal/10 dark:bg-brand-teal/15 text-brand-teal dark:text-brand-teallight border-l-4 border-brand-teal pl-2.5 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-205'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer in sidebar */}
      <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/30 space-y-2">
        {(user?.role !== 'admin' && user?.role !== 'staff') && (
          <div className="p-3 bg-gradient-to-tr from-brand-teal/10 to-brand-green/5 rounded-xl border border-brand-teal/15 text-center">
            <span className="block text-[10px] font-bold text-brand-teal uppercase tracking-widest mb-1">SAVE+ Premium</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Mở khóa chuyên gia AI Mentor+ và các bài phân tích chuyên sâu.</p>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full py-1 text-[10px] font-bold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-md shadow-sm transition-all uppercase"
            >
              Nâng cấp ngay
            </button>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:bg-red-500/10 transition-all text-left"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
