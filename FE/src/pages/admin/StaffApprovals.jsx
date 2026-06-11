import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Search, User, CreditCard, Filter, ShieldCheck, Clock } from 'lucide-react';

export default function StaffApprovals() {
  const { 
    users, 
    approveKYC, 
    paymentRequests, 
    getPaymentRequests, 
    approvePaymentRequest, 
    rejectPaymentRequest 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('kyc'); // kyc | payments
  const [filterStatus, setFilterStatus] = useState('Pending KYC');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('Pending');

  useEffect(() => {
    getPaymentRequests();
  }, [activeTab]);

  // Khách hàng cần duyệt là những user có idNumber
  const pendingUsers = users.filter(u => u.status === filterStatus || (filterStatus === 'All' && u.idNumber));

  // Lọc yêu cầu thanh toán
  const filteredPayments = paymentRequests.filter(req => req.status === filterPaymentStatus || filterPaymentStatus === 'All');

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleRejectPayment = (id) => {
    const reason = prompt('Nhập lý do từ chối nâng cấp gói:');
    if (reason !== null) {
      rejectPaymentRequest(id, reason);
    }
  };

  return (
    <div className="space-y-6 fade-in text-slate-850 dark:text-white pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <ShieldCheck size={24} className="text-brand-teal" />
            <span>Trung Tâm Phê Duyệt Hệ Thống</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Xác thực thông tin khách hàng KYC và phê duyệt nâng cấp các gói hội viên trả phí.
          </p>
        </div>
      </div>

      {/* Main Tabs switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button 
          onClick={() => setActiveTab('kyc')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'kyc' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Duyệt Hồ Sơ KYC ({users.filter(u => u.status === 'Pending KYC').length})
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'payments' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Duyệt Nâng Cấp Gói ({paymentRequests.filter(r => r.status === 'Pending').length})
        </button>
      </div>

      {/* TAB 1: KYC APPROVALS */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setFilterStatus('Pending KYC')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterStatus === 'Pending KYC' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
            >
              Chờ Duyệt
            </button>
            <button 
              onClick={() => setFilterStatus('Active')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterStatus === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
            >
              Đã Duyệt
            </button>
            <button 
              onClick={() => setFilterStatus('Rejected KYC')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterStatus === 'Rejected KYC' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
            >
              Từ Chối
            </button>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-500">
                Không có hồ sơ KYC nào trong trạng thái này.
              </div>
            ) : (
              pendingUsers.map(u => (
                <div key={u.id} className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-900">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">{u.name}</h3>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.status === 'Pending KYC' ? 'bg-amber-500/20 text-amber-500' :
                      u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' :
                      'bg-rose-500/20 text-rose-500'
                    }`}>
                      {u.status}
                    </span>
                  </div>

                  <div className="p-4 flex-1 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                        <CreditCard size={16} />
                        <span className="text-xs font-semibold">Số CCCD:</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-white">{u.idNumber || 'Chưa cung cấp'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-[3/2] bg-slate-250 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-400 relative overflow-hidden group border border-slate-300 dark:border-slate-700">
                        Mặt trước CCCD
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                          Xem ảnh
                        </div>
                      </div>
                      <div className="aspect-[3/2] bg-slate-250 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-400 relative overflow-hidden group border border-slate-300 dark:border-slate-700">
                        Mặt sau CCCD
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                          Xem ảnh
                        </div>
                      </div>
                    </div>
                  </div>

                  {u.status === 'Pending KYC' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex space-x-3">
                      <button 
                        onClick={() => approveKYC(u.id, false)}
                        className="flex-1 py-2 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Từ chối</span>
                      </button>
                      <button 
                        onClick={() => approveKYC(u.id, true)}
                        className="flex-1 py-2 text-xs font-bold text-emerald-600 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle size={14} />
                        <span>Chấp nhận</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION UPGRADE APPROVALS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setFilterPaymentStatus('Pending')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterPaymentStatus === 'Pending' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
            >
              Chờ Phê Duyệt
            </button>
            <button 
              onClick={() => setFilterPaymentStatus('Approved')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterPaymentStatus === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
            >
              Đã Chấp Thuận
            </button>
            <button 
              onClick={() => setFilterPaymentStatus('Rejected')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterPaymentStatus === 'Rejected' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
            >
              Đã Từ Chối
            </button>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-500">
                Không có yêu cầu nâng cấp gói nào trong trạng thái này.
              </div>
            ) : (
              filteredPayments.map(req => (
                <div key={req.id} className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-900">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">{req.userName}</h3>
                      <p className="text-xs text-slate-400">{req.userEmail}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {req.status === 'Pending' ? 'Đang Chờ' : req.status === 'Approved' ? 'Thành Công' : 'Từ Chối'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Gói đăng ký:</span>
                      <span className="font-bold text-brand-teal">{req.targetTier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Số tiền:</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-white">{formatVND(req.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mã giao dịch (Banking):</span>
                      <span className="font-mono font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{req.paymentCode}</span>
                    </div>
                    {req.note && (
                      <div className="mt-2 p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-[11px] text-rose-600">
                        <strong>Lý do từ chối:</strong> {req.note}
                      </div>
                    )}
                    {req.resolvedAt && (
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <Clock size={11} />
                        <span>Xử lý ngày: {new Date(req.resolvedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                  </div>

                  {req.status === 'Pending' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex space-x-3 mt-auto">
                      <button 
                        onClick={() => handleRejectPayment(req.id)}
                        className="flex-1 py-2 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Từ chối</span>
                      </button>
                      <button 
                        onClick={() => approvePaymentRequest(req.id)}
                        className="flex-1 py-2 text-xs font-bold text-emerald-600 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle size={14} />
                        <span>Phê duyệt</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
