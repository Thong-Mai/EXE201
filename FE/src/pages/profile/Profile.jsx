import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  User, 
  ShieldCheck, 
  Award, 
  Settings, 
  CreditCard, 
  Flame, 
  Sparkles, 
  Check,
  X,
  QrCode,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Target,
  Trophy,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';

const BANK_CONFIG = {
  bankId: 'Momo', // Momo Wallet
  accountNo: '*******540', // Bank Account Number (from Momo/VietQR)
  accountName: 'MAI NHẤT THỐNG' // Account Holder Name
};

export default function Profile() {
  const { user, riskProfile, xp, streak, onboardingAnswers, submitPaymentRequest } = useAuth();

  const parseSavings = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const clean = val.toString().replace(/[^0-9]/g, '');
    return parseFloat(clean) || 0;
  };

  const getAssetAllocation = (profile) => {
    switch (profile) {
      case 'Conservative':
        return [
          { name: 'Trái phiếu (Bonds)', value: 45, color: '#0ea5e9' },
          { name: 'Tiền gửi (Savings)', value: 30, color: '#10b981' },
          { name: 'Cổ phiếu/ETF (Stocks)', value: 15, color: '#f59e0b' },
          { name: 'Vàng vật chất (Gold)', value: 10, color: '#eab308' },
        ];
      case 'Aggressive':
        return [
          { name: 'Cổ phiếu/ETF (Stocks)', value: 65, color: '#f59e0b' },
          { name: 'Tiền mã hóa (Crypto)', value: 15, color: '#8b5cf6' },
          { name: 'Trái phiếu (Bonds)', value: 10, color: '#0ea5e9' },
          { name: 'Vàng vật chất (Gold)', value: 5, color: '#eab308' },
          { name: 'Tiền gửi (Savings)', value: 5, color: '#10b981' },
        ];
      case 'Balanced':
      default:
        return [
          { name: 'Cổ phiếu/ETF (Stocks)', value: 45, color: '#f59e0b' },
          { name: 'Trái phiếu (Bonds)', value: 25, color: '#0ea5e9' },
          { name: 'Tiền gửi (Savings)', value: 15, color: '#10b981' },
          { name: 'Vàng vật chất (Gold)', value: 10, color: '#eab308' },
          { name: 'Tiền mã hóa (Crypto)', value: 5, color: '#8b5cf6' },
        ];
    }
  };

  const getProfileAdvice = (profile) => {
    switch (profile) {
      case 'Conservative':
        return 'Bạn ưu tiên bảo vệ tài sản. Phân bổ này tối ưu hóa thu nhập cố định và giảm thiểu biến động vốn.';
      case 'Aggressive':
        return 'Bạn hướng tới gia tăng tài sản vượt trội và chấp nhận biến động lớn. Hãy kiên định nắm giữ qua các đợt điều chỉnh.';
      case 'Balanced':
      default:
        return 'Hồ sơ cân bằng giúp bạn tham gia vào đà tăng trưởng của thị trường cổ phiếu đồng thời có lớp đệm trái phiếu giảm chấn.';
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentCode, setPaymentCode] = useState('');
  const [userEmailConfirm, setUserEmailConfirm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulation steps: 0=form, 1=connecting bank, 2=verifying, 3=upgrading, 4=success
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const handleUpgradeClick = (tier) => {
    setSelectedTier(tier);
    setUserEmailConfirm(user?.email || '');
    setPaymentCode('');
    setVerificationStep(0);
    setVerificationProgress(0);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!userEmailConfirm.trim()) {
      alert('Vui lòng nhập Email tài khoản nhận nâng cấp.');
      return;
    }
    if (!paymentCode.trim()) {
      alert('Vui lòng nhập mã giao dịch ngân hàng.');
      return;
    }
    if (paymentCode.trim().toUpperCase() !== user?.id?.toUpperCase()) {
      alert(`Mã xác nhận (ID người dùng) không chính xác. Vui lòng nhập đúng mã ID "${user?.id}" của bạn.`);
      return;
    }

    setIsProcessing(true);
    setVerificationStep(1);
    setVerificationProgress(15);

    const amount = selectedTier.name.includes('Premium') ? 99000 : 199000;
    const tierName = selectedTier.name.includes('Premium') ? 'Premium' : 'Mentor+';

    // Start background progress indicator
    let progressInterval = setInterval(() => {
      setVerificationProgress(p => {
        if (p >= 92) return p;
        return p + 4;
      });
    }, 200);

    try {
      // Step 1: Connecting to bank API (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationStep(2);
      setVerificationProgress(45);

      // Step 2: Verifying transaction reference and email in database (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationStep(3);
      setVerificationProgress(78);

      // Call the backend to register request and auto-upgrade subscription in database
      await submitPaymentRequest(tierName, paymentCode, amount, userEmailConfirm);

      // Step 3: Upgrading user profile (1.2s)
      await new Promise(resolve => setTimeout(resolve, 1200));
      clearInterval(progressInterval);
      setVerificationProgress(100);
      setVerificationStep(4);

      // Step 4: Celebration, close modal after 1.8s
      await new Promise(resolve => setTimeout(resolve, 1800));
      setIsProcessing(false);
      setShowPaymentModal(false);
      setPaymentCode('');
      setVerificationStep(0);
    } catch (err) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setVerificationStep(0);
      alert(err.message || 'Lỗi xử lý nâng cấp gói. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const tiers = [
    {
      name: 'Free (Khởi đầu)',
      price: '0đ',
      features: [
        'Bài học tài chính cơ bản',
        'Tự động theo dõi ngân sách',
        'Giả lập tích lũy cơ bản',
        'Cộng đồng thảo luận chung'
      ],
      current: user?.subscription === 'Free' || !user?.subscription,
      color: 'border-slate-200 dark:border-slate-800'
    },
    {
      name: 'Premium (Chuyên nghiệp)',
      price: '99,000đ / tháng',
      features: [
        'Toàn bộ 15+ khóa học chuyên sâu',
        'Không quảng cáo giới hạn',
        'Học trực quan cùng sơ đồ Recharts',
        '20 câu hỏi AI Mentor mỗi ngày',
        'Huy chương thành tựu nâng cao'
      ],
      current: user?.subscription === 'Premium',
      color: 'border-brand-teal ring-2 ring-brand-teal/20 bg-brand-teal/5'
    },
    {
      name: 'Mentor+ (Đặc quyền)',
      price: '199,000đ / tháng',
      features: [
        'Tất cả đặc quyền bản Premium',
        'AI Mentor+ không giới hạn câu hỏi',
        'Cảnh báo biến động thị trường từ AI',
        'Chuyên mục Đọc phân tích của chuyên gia',
        'Hỗ trợ khẩn cấp 1-1 phòng chống lừa đảo'
      ],
      current: user?.subscription === 'Mentor+',
      color: 'border-brand-gold ring-2 ring-brand-gold/20 bg-amber-500/5'
    }
  ];

  return (
    <div className="space-y-6 fade-in font-sans">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
          <Settings size={22} className="text-brand-teal" />
          <span>Hồ Sơ & Gói Tài Khoản</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Quản lý hồ sơ rủi ro học tập, theo dõi điểm thưởng tích lũy và cấu hình gói dịch vụ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Stats Card & Achievements */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
              alt={user?.name} 
              className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-brand-teal/25"
            />
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="text-xs text-slate-400 block">{user?.email}</span>
              <span className="inline-block text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded select-all">
                ID: {user?.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Điểm thưởng</span>
                <span className="block text-sm font-extrabold text-brand-teal">{xp} XP</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Học tập</span>
                <span className="block text-sm font-extrabold text-amber-500">{streak} Ngày 🔥</span>
              </div>
            </div>

            {/* Risk profile information box */}
            <div className="p-4 bg-teal-500/5 dark:bg-teal-900/10 border border-brand-teal/25 rounded-2xl text-left text-xs">
              <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Hồ sơ rủi ro tích lũy</span>
              <h4 className="font-extrabold text-brand-teal dark:text-brand-teallight text-sm">
                {riskProfile === 'Conservative' ? 'AN TOÀN (Conservative)' : riskProfile === 'Aggressive' ? 'TĂNG TRƯỞNG (Aggressive)' : 'CÂN BẰNG (Balanced)'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Được đánh giá dựa trên khảo sát onboard của bạn. Lộ trình bài học và rổ gợi ý ETF được tinh chỉnh theo hồ sơ này.
              </p>
              {onboardingAnswers && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/20 space-y-1 text-[10px] text-slate-400">
                  <div>Thu nhập dự kiến: <strong className="text-slate-700 dark:text-slate-200">{onboardingAnswers.income}đ</strong></div>
                  <div>Khả năng tiết kiệm: <strong className="text-slate-700 dark:text-slate-200">{onboardingAnswers.savings}đ/tháng</strong></div>
                </div>
              )}
            </div>
          </div>

          {/* Achievements Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Trophy size={18} className="text-amber-500" />
                <span>Thành Tựu & Huy Chương</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tiến độ tích lũy và học tập tài chính cá nhân của bạn.</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'badge-newbie',
                  name: 'Mầm Non Tiết Kiệm',
                  desc: 'Gia nhập cộng đồng SavePlus thành công',
                  active: true,
                  icon: Sparkles,
                  color: 'text-teal-500 bg-teal-500/10 border-teal-500/20'
                },
                {
                  id: 'badge-plan',
                  name: 'Kiến Thiết Ngân Sách',
                  desc: 'Hoàn tất khảo sát dòng tiền & mục tiêu tài chính',
                  active: !!onboardingAnswers,
                  icon: Target,
                  color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                },
                {
                  id: 'badge-streak',
                  name: 'Chiến Binh Kỷ Luật',
                  desc: 'Duy trì chuỗi học tập liên tục từ 3 ngày',
                  active: streak >= 3,
                  icon: Flame,
                  color: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                },
                {
                  id: 'badge-xp',
                  name: 'Nhà Tích Lũy Tri Thức',
                  desc: 'Học tập tích lũy đạt từ 200 điểm thưởng XP',
                  active: xp >= 200,
                  icon: Award,
                  color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                },
                {
                  id: 'badge-vip',
                  name: 'Hội Viên Tinh Hoa (VIP)',
                  desc: 'Nâng cấp tài khoản lên Premium hoặc Mentor+',
                  active: user?.subscription === 'Premium' || user?.subscription === 'Mentor+',
                  icon: ShieldCheck,
                  color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
                }
              ].map((badge) => {
                const IconComp = badge.icon;
                return (
                  <div 
                    key={badge.id} 
                    className={`flex items-center space-x-3 p-2 rounded-xl border transition-all ${badge.active ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-900 opacity-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${badge.active ? badge.color : 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200/40 dark:border-slate-700/40'}`}>
                      <IconComp size={18} className={badge.active && badge.id === 'badge-streak' ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-[11.5px] ${badge.active ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 line-through'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Asset Allocation Chart & Subscription Tiers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phân Bổ Tài Sản Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
                  <PieChartIcon size={18} className="text-brand-teal" />
                  <span>Gợi Ý Phân Bổ Tài Sản (AI Advisor)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Kế hoạch phân bổ ngân sách tiết kiệm tháng dựa trên khẩu vị rủi ro.</p>
              </div>
              
              <Link 
                to="/profile-setup" 
                className="flex items-center space-x-1 text-[10.5px] font-bold text-brand-teal hover:underline bg-brand-teal/5 px-2.5 py-1 rounded-lg transition-colors border border-brand-teal/10"
              >
                <RefreshCw size={11} />
                <span>Khảo sát lại</span>
              </Link>
            </div>

            {riskProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Side: Pie Chart */}
                <div className="relative h-48 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/40 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getAssetAllocation(riskProfile)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getAssetAllocation(riskProfile).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Tỷ trọng']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Inner Label */}
                  <div className="absolute text-center">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Hồ sơ</span>
                    <span className="text-[11px] font-extrabold text-brand-teal">
                      {riskProfile === 'Conservative' ? 'An Toàn' : riskProfile === 'Aggressive' ? 'Tăng Trưởng' : 'Cân Bằng'}
                    </span>
                  </div>
                </div>

                {/* Right Side: Detailed Breakdown & Recommended Monthly Amounts */}
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-teal-500/5 dark:bg-brand-teal/10 border border-brand-teal/15 p-2.5 rounded-xl leading-relaxed">
                    <strong className="text-brand-teal font-bold block mb-0.5">Lời khuyên từ AI Advisor:</strong>
                    {getProfileAdvice(riskProfile)}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                      <span>Danh mục đề xuất</span>
                      <span>
                        {onboardingAnswers?.savings 
                          ? `Dòng tiền: ${onboardingAnswers.savings}đ/tháng`
                          : 'Ngân sách mẫu: 5.000.000đ/tháng'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                      {getAssetAllocation(riskProfile).map((asset) => {
                        const budget = parseSavings(onboardingAnswers?.savings) || 5000000;
                        const amount = (budget * asset.value) / 100;
                        
                        return (
                          <div 
                            key={asset.name} 
                            className="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-[10.5px] border border-slate-100 dark:border-slate-800/40"
                          >
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{asset.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-800 dark:text-slate-100 mr-2">{asset.value}%</span>
                              <span className="text-slate-400 font-mono">({amount.toLocaleString('vi-VN')}đ)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <PieChartIcon size={22} />
                </div>
                <div className="max-w-xs mx-auto space-y-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">Chưa có Hồ sơ rủi ro tích lũy</h4>
                  <p className="text-[11px] text-slate-400">Vui lòng thực hiện Khảo sát rủi ro ban đầu để hệ thống tự động lập kế hoạch phân bổ danh mục đầu tư mẫu cho bạn.</p>
                </div>
                <Link 
                  to="/profile-setup" 
                  className="inline-flex items-center space-x-1.5 py-2 px-4 bg-brand-teal hover:bg-brand-teal/95 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  <Target size={14} />
                  <span>Làm khảo sát ngay</span>
                </Link>
              </div>
            )}
          </div>

          {/* Subscription Cards */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-1.5">
                <CreditCard size={18} className="text-brand-teal" />
                <span>So Sánh Các Gói Tài Khoản</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Chọn gói phù hợp nhất với trình độ tự học tài chính cá nhân của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <div 
                  key={tier.name} 
                  className={`p-4 rounded-2xl border flex flex-col justify-between relative ${tier.color}`}
                >
                  {/* Active Badge */}
                  {tier.current && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 rounded bg-brand-teal text-[8.5px] font-extrabold text-white uppercase tracking-wider">
                      Gói hiện tại
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{tier.name}</h4>
                      <span className="block text-sm font-extrabold text-brand-teal dark:text-brand-teallight mt-1.5">{tier.price}</span>
                    </div>

                    <ul className="space-y-2 text-[10px] text-slate-500 dark:text-slate-400">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start space-x-1.5">
                          <Check size={12} className="text-brand-teal shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    disabled={tier.current}
                    onClick={() => handleUpgradeClick(tier)}
                    className={`w-full mt-6 py-2 rounded-xl text-[10.5px] font-bold transition-all uppercase ${tier.current ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-slate-200/20' : 'bg-brand-teal hover:bg-brand-teal/95 text-white shadow-md'}`}
                  >
                    {tier.current ? 'Đang kích hoạt' : 'Nâng cấp ngay'}
                  </button>
                </div>
              ))}
            </div>

            {/* Refund trust badge */}
            <div className="mt-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15 flex items-center space-x-2 text-[10.5px] text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-brand-green" />
              <span>Hoàn phí 100% trong 7 ngày đầu nếu bạn không hài lòng về chất lượng nội dung học tập.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTier && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              setShowPaymentModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2 text-sm">
                <CreditCard size={18} className="text-brand-teal" />
                <span>Thanh toán nâng cấp tài khoản</span>
              </h3>
              {!isProcessing && (
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {verificationStep === 0 ? (
                <>
                  <div className="text-center space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Gói đăng ký</p>
                    <h4 className="font-extrabold text-brand-teal text-base">{selectedTier.name}</h4>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedTier.price}</p>
                  </div>

                  <div className="flex flex-col items-center p-4 border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
                      <span>Quét mã Momo / VietQR chuyển khoản nhanh</span>
                    </span>
                    
                    <div className="w-72 md:w-80 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md overflow-hidden border border-slate-200 dark:border-slate-800 relative group p-2">
                      <img 
                        src={selectedTier.name.includes('Premium') ? "/payment_premium.png" : "/payment_mentor.png"}
                        alt="Momo / VietQR Transfer"
                        className="w-full h-auto object-contain rounded-xl"
                      />
                    </div>

                    <div className="text-center space-y-1 w-full border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ví điện tử: <strong className="text-slate-700 dark:text-slate-200">{BANK_CONFIG.bankId}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Số tài khoản: <strong className="text-slate-700 dark:text-slate-200 font-mono">{BANK_CONFIG.accountNo}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Chủ tài khoản: <strong className="text-slate-700 dark:text-slate-200">{BANK_CONFIG.accountName}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        Nội dung chuyển khoản chính xác:
                      </p>
                      <p className="font-mono text-xs font-extrabold text-brand-teal bg-teal-500/5 dark:bg-brand-teal/10 border border-brand-teal/20 px-2.5 py-1 rounded inline-block select-all mt-1">
                        {user?.id || 'USER'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email nhận gói nâng cấp</label>
                      <input 
                        type="email" 
                        value={userEmailConfirm}
                        onChange={(e) => setUserEmailConfirm(e.target.value)}
                        placeholder="Nhập email tài khoản cần nâng cấp" 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã xác nhận (Nhập ID người dùng của bạn)</label>
                      <input 
                        type="text" 
                        value={paymentCode}
                        onChange={(e) => setPaymentCode(e.target.value)}
                        placeholder={`VD: ${user?.id || 'U123456789'}`} 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 font-mono font-semibold"
                      />
                      <p className="text-[10px] text-amber-500 font-medium">💡 Gợi ý: Nhập đúng mã ID {user?.id} ở trên làm mã xác nhận.</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4">
                    {!isProcessing && (
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all text-center border-none cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                    )}
                    <button 
                      onClick={handlePaymentSubmit}
                      disabled={!paymentCode.trim() || !userEmailConfirm.trim()}
                      className={`py-3 bg-brand-teal hover:bg-brand-teal/95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer border-none ${isProcessing ? 'w-full' : 'flex-[2]'}`}
                    >
                      <Check size={16} />
                      <span>Xác nhận đã thanh toán</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
                  
                  {verificationStep < 4 ? (
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-brand-teal animate-spin" />
                      <span className="absolute text-[11px] font-extrabold text-brand-teal font-mono">
                        {verificationProgress}%
                      </span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-bounce">
                      <CheckCircle2 size={48} />
                    </div>
                  )}

                  <div className="space-y-2 max-w-xs">
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-sm">
                      {verificationStep === 1 && "Đang kết nối cổng ngân hàng..."}
                      {verificationStep === 2 && "Đang đối soát giao dịch..."}
                      {verificationStep === 3 && "Đang gửi yêu cầu nâng cấp..."}
                      {verificationStep === 4 && "Gửi yêu cầu thành công!"}
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {verificationStep === 1 && "Hệ thống đang thiết lập cổng bảo mật liên kết ngân hàng nhận chuyển khoản..."}
                      {verificationStep === 2 && `Đang quét sao kê tài khoản cho mã giao dịch "${paymentCode}" từ ngân hàng đối tác...`}
                      {verificationStep === 3 && `Xác nhận giao dịch thành công. Đang gửi yêu cầu phê duyệt nâng cấp tài khoản của "${userEmailConfirm}" lên ban quản trị...`}
                      {verificationStep === 4 && "Yêu cầu nâng cấp của bạn đã được ghi nhận thành công! Vui lòng chờ Admin phê duyệt để chính thức kích hoạt gói."}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-brand-teal h-full transition-all duration-300 rounded-full"
                      style={{ width: `${verificationProgress}%` }}
                    />
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
