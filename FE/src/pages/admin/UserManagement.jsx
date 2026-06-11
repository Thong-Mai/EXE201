import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Search, 
  Ban, 
  Unlock, 
  Check, 
  ShieldAlert, 
  Filter, 
  Edit3, 
  X, 
  UserCheck,
  Trash2
} from 'lucide-react';

export default function UserManagement() {
  const { users, blockUser, verifyUser, deleteUser, updateUserDetails } = useAuth();
  
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, free, premium, mentor
  const [filterRisk, setFilterRisk] = useState('all'); // all, Conservative, Balanced, Aggressive
  
  // Selected user for editing modal
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubscription, setEditSubscription] = useState('');
  const [editRisk, setEditRisk] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);

  // Handle mock edits
  const handleEditOpen = (u) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditSubscription(u.subscription);
    setEditRisk(u.riskProfile || 'None');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUserDetails(editingUser.id, {
      name: editName,
      subscription: editSubscription,
      riskProfile: editRisk === 'None' ? null : editRisk
    });
    if (success) {
      setEditingUser(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    
    let matchRole = true;
    if (filterRole !== 'all') {
      matchRole = u.subscription.toLowerCase() === filterRole.toLowerCase();
    }

    let matchRisk = true;
    if (filterRisk !== 'all') {
      matchRisk = (u.riskProfile || '').toLowerCase() === filterRisk.toLowerCase();
    }

    return matchSearch && matchRole && matchRisk;
  });

  return (
    <div className="space-y-6 fade-in text-slate-850 dark:text-white">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <Users size={24} className="text-brand-teal" />
            <span>Quản Lý Danh Sách Người Dùng</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Tra cứu học viên, phê duyệt nâng cấp tài khoản, điều chỉnh hồ sơ khẩu vị rủi ro và khóa người dùng vi phạm.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
        
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email học viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-teal"
          />
        </div>

        {/* Filter sub */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">Hội viên:</span>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs focus:outline-none"
          >
            <option value="all">Tất cả gói</option>
            <option value="Free">Gói Free</option>
            <option value="Premium">Gói Premium</option>
            <option value="Mentor+">Gói Mentor+</option>
          </select>
        </div>

        {/* Filter Risk */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">Khẩu vị rủi ro:</span>
          <select 
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs focus:outline-none"
          >
            <option value="all">Tất cả hồ sơ</option>
            <option value="Conservative">An Toàn</option>
            <option value="Balanced">Cân Bằng</option>
            <option value="Aggressive">Tăng Trưởng</option>
          </select>
        </div>

      </div>

      {/* Users Data Table */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">ID</th>
                <th className="p-3">Học viên</th>
                <th className="p-3">Hồ Sơ Rủi Ro</th>
                <th className="p-3 text-center">Tiến độ Học</th>
                <th className="p-3">Gói Hội Viên</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {filteredUsers.map((u) => {
                const isBlocked = u.status === 'Blocked';
                
                return (
                  <tr key={u.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10 transition-colors">
                    {/* ID */}
                    <td className="p-3 font-mono font-bold text-slate-400">{u.id}</td>
                    
                    {/* User info */}
                    <td className="p-3">
                      <div>
                        <span className="block font-bold text-slate-900 dark:text-slate-200">{u.name}</span>
                        <span className="block text-[10px] text-slate-400">{u.email}</span>
                      </div>
                    </td>

                    {/* Risk profile */}
                    <td className="p-3">
                      {u.riskProfile ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.riskProfile === 'Conservative' ? 'bg-teal-500/10 text-brand-teal' : u.riskProfile === 'Aggressive' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-600'}`}>
                          {u.riskProfile === 'Conservative' ? 'An Toàn' : u.riskProfile === 'Aggressive' ? 'Tăng Trưởng' : 'Cân Bằng'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa kiểm tra</span>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="p-3">
                      <div className="flex items-center justify-center flex-col max-w-[100px] mx-auto space-y-1">
                        <span className="font-bold text-[10px] text-slate-500 font-mono">{u.learningProgress}%</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-teal h-full" style={{ width: `${u.learningProgress}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Subscription */}
                    <td className="p-3 font-bold text-slate-600 dark:text-slate-300">{u.subscription}</td>

                    {/* Status */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBlocked ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                        {isBlocked ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right space-x-2">
                      <button 
                        onClick={() => handleEditOpen(u)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-350 transition-colors"
                        title="Chỉnh sửa hồ sơ học tập"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => verifyUser(u.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500/20 text-emerald-500 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors"
                        title="Nâng cấp quyền Premium"
                      >
                        <UserCheck size={14} />
                      </button>
                      <button 
                        onClick={() => blockUser(u.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isBlocked ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                        title={isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản học viên'}
                      >
                        {isBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                      </button>
                      <button 
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-500/20 text-red-500 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT USER DETAILS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative fade-in text-slate-850 dark:text-white">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base mb-4">Chỉnh sửa hồ sơ học tập</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Tên học viên</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Gói dịch vụ hội viên</label>
                <select 
                  value={editSubscription}
                  onChange={(e) => setEditSubscription(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500"
                >
                  <option value="Free">Gói Free</option>
                  <option value="Premium">Gói Premium</option>
                  <option value="Mentor+">Gói Mentor+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Hồ sơ khẩu vị rủi ro</label>
                <select 
                  value={editRisk}
                  onChange={(e) => setEditRisk(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500"
                >
                  <option value="None">Chưa khảo sát (None)</option>
                  <option value="Conservative">An Toàn (Conservative)</option>
                  <option value="Balanced">Cân Bằng (Balanced)</option>
                  <option value="Aggressive">Tăng Trưởng (Aggressive)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Cập nhật thông tin học viên
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative text-slate-850 dark:text-white">
            <button 
              onClick={() => setUserToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:scale-105 transition-transform"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Xác nhận xóa tài khoản</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bạn có chắc chắn muốn xóa tài khoản của <strong>{userToDelete.name}</strong> ({userToDelete.email})? 
                  Hành động này sẽ xóa vĩnh viễn tài khoản và toàn bộ dữ liệu liên quan, không thể hoàn tác.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer border-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const success = await deleteUser(userToDelete.id);
                    if (success) {
                      setUserToDelete(null);
                    }
                  }}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border-none"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
