import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Gift, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

export default function GoalsSavings() {
  const { goals, addGoal, contributeToGoal, balance } = useAuth();
  
  // Modals visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState(null);

  // Form states
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Emergency fund');
  const [newGoalMonthly, setNewGoalMonthly] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget) return;

    addGoal({
      name: newGoalName,
      target: parseFloat(newGoalTarget),
      category: newGoalCategory,
      monthlyContribution: parseFloat(newGoalMonthly) || 0
    });

    // Reset form & close
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalMonthly('');
    setShowAddModal(false);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleOpenDeposit = (goal) => {
    setSelectedGoalForDeposit(goal);
    setDepositAmount(goal.monthlyContribution.toString());
    setShowDepositModal(true);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || !selectedGoalForDeposit) return;

    const amount = parseFloat(depositAmount);
    if (amount > balance) {
      alert('Số dư tài khoản mô phỏng không đủ để trích tiết kiệm!');
      return;
    }

    contributeToGoal(selectedGoalForDeposit.id, amount);
    setShowDepositModal(false);

    // If goal is fully completed after this deposit
    const isCompleted = selectedGoalForDeposit.current + amount >= selectedGoalForDeposit.target;
    if (isCompleted) {
      confetti({
        particleCount: 150,
        spread: 90,
        colors: ['#F59E0B', '#10B981', '#3B82F6']
      });
    } else {
      confetti({
        particleCount: 50,
        spread: 40
      });
    }
  };

  // Recharts data mapper
  const chartData = goals.map(g => ({
    name: g.name.substring(0, 15) + '...',
    'Đã tích lũy': g.current,
    'Mục tiêu': g.target
  }));

  return (
    <div className="space-y-6 fade-in">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
            <Target size={24} className="text-brand-teal" />
            <span>Kế Hoạch & Mục Tiêu Tiết Kiệm</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Lập mục tiêu tài chính, theo dõi tiền tích lũy và mở khóa các huy chương thành tựu.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-brand-teal hover:bg-brand-teal/95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer self-start"
        >
          <Plus size={16} />
          <span>Thêm mục tiêu mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Goals list */}
        <div className="lg:col-span-2 space-y-4">
          {goals.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 rounded-2xl">
              Bạn chưa có mục tiêu tiết kiệm nào. Hãy nhấn "Thêm mục tiêu mới" để khởi động!
            </div>
          ) : (
            goals.map(goal => {
              const progressPct = Math.min(100, Math.round((goal.current / goal.target) * 100));
              const isFinished = progressPct >= 100;
              
              return (
                <div 
                  key={goal.id} 
                  className={`glass-panel p-5 rounded-2xl border transition-all ${isFinished ? 'border-brand-gold bg-amber-500/5' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
                        <span>{goal.name}</span>
                        {isFinished && (
                          <span className="px-2 py-0.5 rounded bg-brand-gold/10 text-[9px] font-extrabold text-brand-gold uppercase tracking-wider flex items-center space-x-1">
                            <Award size={10} className="fill-brand-gold" />
                            <span>Đã hoàn thành</span>
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{goal.category}</span>
                    </div>

                    <button 
                      disabled={isFinished}
                      onClick={() => handleOpenDeposit(goal)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isFinished ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/20' : 'bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal'}`}
                    >
                      Trích tiền tích lũy
                    </button>
                  </div>

                  {/* Progress values */}
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Đã gom: <strong className="text-slate-700 dark:text-slate-200">{formatVND(goal.current)}</strong></span>
                    <span>Mục tiêu: <strong className="text-slate-700 dark:text-slate-200">{formatVND(goal.target)}</strong></span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-500 ${isFinished ? 'bg-brand-gold' : 'bg-brand-teal'}`} 
                      style={{ width: `${progressPct}%` }} 
                    />
                  </div>

                  <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-bold uppercase">
                    <span>Mức tích lũy dự kiến: {formatVND(goal.monthlyContribution)}/tháng</span>
                    <span className={isFinished ? 'text-brand-gold' : 'text-brand-teal font-mono'}>{progressPct}%</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right side widgets: Analytics & Achievements */}
        <div className="space-y-6">
          
          {/* Recharts target values compare */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4">So sánh mục tiêu tích lũy</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/30" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#FFF', 
                      fontSize: '11px' 
                    }}
                  />
                  <Bar dataKey="Đã tích lũy" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Mục tiêu" fill="#94A3B8" radius={[4, 4, 0, 0]} opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Badges system */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <Award size={14} className="text-brand-gold" />
              <span>Huy chương thành tựu</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-amber-500/10 border border-brand-gold/20 rounded-xl flex flex-col items-center">
                <span className="text-lg">🔥</span>
                <span className="text-[9px] font-bold text-brand-gold mt-1 block leading-tight">Chuỗi 3 ngày</span>
              </div>
              <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl flex flex-col items-center">
                <span className="text-lg">🧠</span>
                <span className="text-[9px] font-bold text-brand-teal mt-1 block leading-tight">Vượt Quiz 1</span>
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/35 rounded-xl flex flex-col items-center opacity-40">
                <span className="text-lg">🏆</span>
                <span className="text-[9px] font-bold text-slate-400 mt-1 block leading-tight">Gom Quỹ Đạt 100%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* CREATE GOAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative fade-in text-slate-850 dark:text-white">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base mb-4 flex items-center space-x-2">
              <Target size={18} className="text-brand-teal" />
              <span>Thiết lập mục tiêu tiết kiệm mới</span>
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Tên mục tiêu tích lũy</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Mua xe Vision mới, Quỹ du lịch..."
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Số tiền cần tích lũy (VND)</label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 45000000"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Dự tính tích lũy/tháng (VND)</label>
                  <input 
                    type="number" 
                    placeholder="Ví dụ: 2000000"
                    value={newGoalMonthly}
                    onChange={(e) => setNewGoalMonthly(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Danh mục phân loại</label>
                <select 
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal text-slate-600 dark:text-slate-400"
                >
                  <option value="Emergency fund">Quỹ dự phòng khẩn cấp</option>
                  <option value="Buy motorbike">Mua xe máy / Phương tiện</option>
                  <option value="Buy house">Mua nhà / Năng cấp không gian sống</option>
                  <option value="Wedding">Kế hoạch kết hôn</option>
                  <option value="Retirement">Tích lũy nghỉ hưu</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Tạo mục tiêu ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {showDepositModal && selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative fade-in text-slate-850 dark:text-white">
            <button 
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base mb-2">Trích tiền vào mục tiêu</h3>
            <p className="text-xs text-slate-400 mb-4">Gom góp thêm tiền từ số dư lương hàng tháng của bạn vào <strong>{selectedGoalForDeposit.name}</strong>.</p>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 mb-4 text-xs">
              <div className="flex justify-between mb-1 text-slate-400">
                <span>Ví lương khả dụng:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{formatVND(balance)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Đã có mục tiêu:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{formatVND(selectedGoalForDeposit.current)} / {formatVND(selectedGoalForDeposit.target)}</span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Số tiền trích gửi (VND)</label>
                <input 
                  type="number" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-teal font-mono"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Xác nhận chuyển tích lũy
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
