import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Sparkles, 
  Award, 
  CheckSquare, 
  TrendingUp, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck, 
  BookOpen, 
  ArrowUpRight, 
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  HelpCircle as QuestionIcon,
  Compass,
  Trophy,
  Zap,
  Globe,
  Wallet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, riskProfile, xp, streak, balance, goals, addXP } = useAuth();
  const { courses } = useCourses();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleRoadmapClick = (courseId) => {
    const courseIndex = courses.findIndex(c => c.id === courseId);
    const isLocked = courseIndex > 0 && (courses[courseIndex - 1]?.progress || 0) < 100;
    if (isLocked) {
      alert("Bài học này đang bị khóa. Bạn cần hoàn thành bài học trước đó đạt 100% (gồm bài đọc & trắc nghiệm) để mở khóa!");
      return;
    }
    navigate('/learning', { state: { startCourseId: courseId } });
  };

  // Onboarding checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Hoàn thành Khảo sát Cá tính tài chính', done: riskProfile ? true : false, xp: 50 },
    { id: 2, text: 'Học bài giảng: Tiết kiệm & Tích lũy', done: false, xp: 20 },
    { id: 3, text: 'Chạy thử giả lập lãi kép 2M/tháng', done: false, xp: 30 },
    { id: 4, text: 'Đọc cẩm nang nhận diện Ponzi lừa đảo', done: false, xp: 25 },
    { id: 5, text: 'Hỏi AI Mentor về rổ tài sản ETF', done: false, xp: 15 }
  ]);

  const toggleChecklist = (id) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        if (!item.done) {
          addXP(item.xp); // Grant XP on check
        }
        return { ...item, done: !item.done };
      }
      return item;
    }));
  };

  // Recharts compound interest simulator data (Saving 2M/month vs diversified saving over 6 months)
  const chartData = [
    { name: 'Tháng 1', Cash: 2000000, Diversified: 2000000 },
    { name: 'Tháng 2', Cash: 4000000, Diversified: 4100000 },
    { name: 'Tháng 3', Cash: 6000000, Diversified: 6250000 },
    { name: 'Tháng 4', Cash: 8000000, Diversified: 8480000 },
    { name: 'Tháng 5', Cash: 10000000, Diversified: 10790000 },
    { name: 'Tháng 6', Cash: 12000000, Investing: 12000000, Diversified: 13240000 },
  ];

  // Calculate learning score based on progress average
  const totalProgress = courses.reduce((acc, c) => acc + c.progress, 0);
  const confidenceScore = courses.length ? Math.round(totalProgress / courses.length) : 0;

  // Level info
  const calculateLevelInfo = (xpPoints) => {
    const xpPerLevel = 250;
    const currentLvl = Math.floor((xpPoints || 150) / xpPerLevel) + 1;
    const nextLvlXp = currentLvl * xpPerLevel;
    const prevLvlXp = (currentLvl - 1) * xpPerLevel;
    const relativeXp = xpPoints - prevLvlXp;
    return {
      level: currentLvl,
      relativeXp,
      neededXp: xpPerLevel,
      pct: Math.min(100, Math.round((relativeXp / xpPerLevel) * 100))
    };
  };

  const lvlInfo = calculateLevelInfo(xp || 150);

  // AI recommendations
  const getAIRecommendation = () => {
    switch (riskProfile) {
      case 'Safe Saver':
        return {
          title: 'Gợi ý AI: Ưu tiên bảo vệ dòng tiền & Nhận diện cạm bẫy',
          message: 'Chào Lâm, là một Safe Saver, việc bảo mật tài khoản và nhận diện các dự án lừa đảo tài chính Ponzi cam kết lãi suất cao là rất quan trọng. Hãy đọc bài "Nhận diện lừa đảo" trước nhé.'
        };
      case 'Blockchain Curious':
        return {
          title: 'Gợi ý AI: Tìm hiểu đa dạng hóa tài sản & Chứng chỉ quỹ',
          message: 'Chào Lâm, với tư duy cởi mở tìm tòi, hãy bắt đầu tìm hiểu về Quỹ chỉ số ETF để hiểu cách phân tán rủi ro đầu tư hiệu quả vào top doanh nghiệp Việt Nam.'
        };
      case 'High Growth Seeker':
        return {
          title: 'Gợi ý AI: Học Kỷ luật vốn & Thực hành Giả lập tích lũy',
          message: 'Chào Lâm, khẩu vị tăng trưởng mạnh mẽ của bạn rất tốt, nhưng cần đi kèm tính kỷ luật cao. Hãy hoàn thành giả lập tích lũy tài sản 2 triệu/tháng để thấy rõ sức mạnh lãi kép.'
        };
      default:
        return {
          title: 'Gợi ý AI: Tích lũy đều đặn & Khám phá lãi suất kép',
          message: 'Chào Lâm, dựa trên cá tính tài chính của bạn, hãy tiếp tục học bài học "Lãi kép: Kỳ quan thế giới" để hiểu cách bắt đầu tích lũy sớm tạo ra sự khác biệt khổng lồ.'
        };
    }
  };

  const aiRec = getAIRecommendation();

  // Next course suggestion
  const nextCourse = courses.find(c => c.progress < 100) || courses[0];

  // Dynamic Course progress checks for Roadmap
  const c01Progress = courses.find(c => c.id === 'C01')?.progress || 0;
  const c02Progress = courses.find(c => c.id === 'C02')?.progress || 0;
  const c03Progress = courses.find(c => c.id === 'C03')?.progress || 0;
  const c04Progress = courses.find(c => c.id === 'C04')?.progress || 0;
  const c05Progress = courses.find(c => c.id === 'C05')?.progress || 0;

  return (
    <div className="space-y-6 fade-in text-slate-800 dark:text-white font-sans">
      
      {/* 1. PERSONALIZED WELCOME CARD (Indigo/Blue/Emerald fintech gradient) */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-505 to-emerald-500 border border-white/10 shadow-xl overflow-hidden text-white">
        {/* Soft decorative background orbs */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 rounded-full border border-white/20 text-[10px] uppercase font-black tracking-widest">
              <Sparkles size={11} className="fill-white" />
              <span>Học trình Tài chính & Tích lũy Nền Tảng</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Chào buổi sáng, {user?.name || 'Lâm'} 👋
            </h1>
            <p className="text-xs text-white/90 max-w-xl leading-relaxed font-light">
              Bạn đang quản lý tiền thông minh hơn mỗi ngày. Bạn đã hoàn thành <strong className="text-emerald-300 font-mono">{confidenceScore}%</strong> lộ trình kiến thức nền tảng.
            </p>

            {/* Level indicator bar */}
            <div className="pt-3 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                <span className="flex items-center space-x-1">
                  <Trophy size={14} className="text-amber-400 fill-amber-400/25" />
                  <span>Cấp độ: Level {lvlInfo.level} Explorer</span>
                </span>
                <span className="font-mono text-slate-350">{xp || 150} / {lvlInfo.level * 250} XP</span>
              </div>
              <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-sky-400 h-full transition-all duration-500" 
                  style={{ width: `${lvlInfo.pct}%` }} 
                />
              </div>
              <span className="text-[10px] text-white/70 block mt-1">Còn {lvlInfo.neededXp - lvlInfo.relativeXp} XP nữa để thăng cấp tiếp theo!</span>
            </div>
          </div>

          {/* Streak indicator */}
          <div className="shrink-0 flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame size={24} className="fill-amber-400 streak-active" />
            </div>
            <div>
              <span className="block text-[10px] text-white/80 font-bold uppercase tracking-wider">Chuỗi chuyên cần</span>
              <span className="block text-lg font-black">{streak || 4} Ngày Học Tập</span>
              <span className="text-[9px] text-emerald-300 font-bold">Duy trì thói quen mỗi ngày 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CURIOSITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div 
          onClick={() => navigate('/profile')}
          className="glass-panel p-5 rounded-2xl cursor-pointer group flex items-start space-x-3 hover-scale"
        >
          <div className="p-2 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl border border-blue-500/15">
            <Compass size={18} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider block">Tính cách tài chính</span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Xem lại cá tính rủi ro của bạn</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Hệ thống gợi ý các bài học và danh mục đầu tư dựa trên khẩu vị rủi ro: {riskProfile || 'Safe Saver'}.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => navigate('/learning')}
          className="glass-panel p-5 rounded-2xl cursor-pointer group flex items-start space-x-3 hover-scale"
        >
          <div className="p-2 bg-purple-500/10 text-purple-650 dark:text-purple-400 rounded-xl border border-purple-500/15">
            <Lock size={18} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-purple-605 dark:text-purple-400 uppercase tracking-wider block">Tiến độ học tập</span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Học tuần tự từng bài học</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Hoàn thành 100% bài học trước (gồm bài đọc & mini-quiz) để mở khóa bài học tiếp theo trong lộ trình.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => navigate('/simulation')}
          className="glass-panel p-5 rounded-2xl cursor-pointer group flex items-start space-x-3 hover-scale"
        >
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/15">
            <QuestionIcon size={18} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-emerald-605 dark:text-emerald-400 uppercase tracking-wider block">Giả lập thực chiến</span>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Trải nghiệm sức mạnh Lãi Kép</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Thử thiết lập hạn mức đầu tư tích lũy định kỳ để xem biến động giá trị tài sản 10 năm sau.
            </p>
          </div>
        </div>
      </div>

      {/* 3. VISUAL ROADMAP TIMELINE */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Compass size={18} className="text-blue-500 dark:text-blue-400" />
            <span>Sơ Đồ Học Trình Quản Lý Vốn & Tích Lũy</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Hoàn thành bài đọc & trắc nghiệm để mở khóa chuyên đề tiếp theo.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {/* Step 1: ETF & Chứng chỉ quỹ */}
          <div 
            onClick={() => handleRoadmapClick('C01')}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:scale-102 ${
              c01Progress === 100 
                ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              c01Progress === 100 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
            }`}>
              {c01Progress === 100 ? <CheckCircle size={16} /> : <Sparkles size={14} className="animate-pulse" />}
            </div>
            <h4 className="font-bold text-[10px]">1. ETF & CC Quỹ</h4>
          </div>

          {/* Step 2: Lãi kép */}
          <div 
            onClick={() => handleRoadmapClick('C02')}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:scale-102 ${
              c02Progress === 100 
                ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                : c01Progress === 100
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-white/5 bg-slate-100/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {c02Progress === 100 ? (
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-450" />
              ) : c01Progress === 100 ? (
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
              ) : (
                <Lock size={14} />
              )}
            </div>
            <h4 className="font-bold text-[10px]">2. Sức mạnh Lãi kép</h4>
          </div>

          {/* Step 3: Đa dạng hóa danh mục */}
          <div 
            onClick={() => handleRoadmapClick('C03')}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:scale-102 ${
              c03Progress === 100 
                ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                : c02Progress === 100
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-white/5 bg-slate-100/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {c03Progress === 100 ? (
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-450" />
              ) : c02Progress === 100 ? (
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
              ) : (
                <Lock size={14} />
              )}
            </div>
            <h4 className="font-bold text-[10px]">3. Đa dạng hóa</h4>
          </div>

          {/* Step 4: Tâm lý đầu tư */}
          <div 
            onClick={() => handleRoadmapClick('C04')}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:scale-102 ${
              c04Progress === 100 
                ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                : c03Progress === 100
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-white/5 bg-slate-100/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {c04Progress === 100 ? (
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-450" />
              ) : c03Progress === 100 ? (
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
              ) : (
                <Lock size={14} />
              )}
            </div>
            <h4 className="font-bold text-[10px]">4. Tâm lý đầu tư</h4>
          </div>

          {/* Step 5: Lạm phát */}
          <div 
            onClick={() => handleRoadmapClick('C05')}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all hover:scale-102 ${
              c05Progress === 100 
                ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                : c04Progress === 100
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-white/5 bg-slate-100/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {c05Progress === 100 ? (
                <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-450" />
              ) : c04Progress === 100 ? (
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
              ) : (
                <Lock size={14} />
              )}
            </div>
            <h4 className="font-bold text-[10px]">5. Tác động Lạm phát</h4>
          </div>

          {/* Step 6: Simulation */}
          <div 
            onClick={() => c05Progress === 100 ? navigate('/simulation') : alert("Bạn cần hoàn thành toàn bộ 5 bài học (đạt 100% tiến độ) để mở khóa Giả lập tích lũy thực chiến!")}
            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 ${
              c05Progress === 100
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-102 transition-all'
                : 'border-slate-200 dark:border-white/5 bg-slate-100/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {c05Progress === 100 ? (
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
              ) : (
                <Lock size={14} />
              )}
            </div>
            <h4 className="font-bold text-[10px]">6. Giả lập tích lũy</h4>
          </div>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (AI recommendation + Compound growth Simulator) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Mentor Recommendation */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-purple-500/10 pointer-events-none">
              <Sparkles size={80} className="fill-purple-500/5" />
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-650 dark:text-purple-400 shrink-0 border border-purple-500/15">
                <Sparkles size={20} className="fill-purple-650 dark:fill-purple-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs flex items-center gap-2 flex-wrap text-slate-800 dark:text-slate-205">
                  <span>{aiRec.title}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-[8.5px] font-black text-purple-600 dark:text-purple-300 uppercase tracking-widest">
                    Hồ sơ: {riskProfile || 'Safe Saver'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light mt-1">
                  {aiRec.message}
                </p>
                <button 
                  onClick={() => navigate('/mentor')}
                  className="pt-2 text-[10.5px] font-black text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>Trò chuyện trực tiếp với AI Mentor</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Simple compound growth chart (savings vs diversified savings) */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-200">Hiệu Ứng Lãi Kép & Đầu Tư Định Kỳ</h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Giả lập gửi góp 2,000,000₫/tháng trong vòng 6 tháng.</span>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                <TrendingUp size={13} />
                <span>Rổ đầu tư tăng trưởng thêm +10% lợi suất</span>
              </span>
            </div>

            <div className="h-56 w-full pt-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDiv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#E2E8F0'} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? 'rgba(7, 11, 22, 0.95)' : '#FFF', 
                      borderRadius: '12px', 
                      border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', 
                      color: darkMode ? '#FFF' : '#1E293B', 
                      fontSize: '11px' 
                    }}
                    formatter={(val) => [`${parseFloat(val).toLocaleString()} ₫`]}
                  />
                  <Area type="monotone" dataKey="Diversified" name="Danh mục đa dạng hóa (ETF)" stroke="#2563EB" strokeWidth={2.2} fillOpacity={1} fill="url(#colorDiv)" />
                  <Area type="monotone" dataKey="Cash" name="Tiết kiệm tiền mặt thường" stroke="#94A3B8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center text-[10.5px] pt-3 border-t border-slate-200 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400">Xem giải nghĩa đầy đủ tại chuyên đề Lãi kép.</span>
              <button 
                onClick={() => navigate('/learning')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                Học tích lũy an toàn
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: FCS speedometer & Gamified checklist */}
        <div className="space-y-6">
          
          {/* Animated FCS Speedometer */}
          <div className="glass-panel p-5 rounded-2xl text-center flex flex-col items-center justify-center">
            <h3 className="font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-3">Điểm Tự Tin Tài Chính (FCS)</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <defs>
                  <linearGradient id="fcsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                  </linearGradient>
                </defs>
                <circle cx="48" cy="48" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke="url(#fcsGradient)" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 40} 
                  strokeDashoffset={2 * Math.PI * 40 * (1 - confidenceScore / 100)} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{confidenceScore}%</span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase">Sẵn sàng</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-3 max-w-xs font-light">
              Mức độ sẵn sàng tâm lý của bạn trước khi bước vào đầu tư thật. Hoàn tất các bài trắc nghiệm để cải thiện điểm số.
            </p>
          </div>

          {/* Daily Challenge Widget & Checklist */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="font-bold text-xs flex items-center space-x-1.5 border-b pb-2 border-slate-250 dark:border-white/10 text-slate-800 dark:text-slate-200">
                <CheckSquare size={16} className="text-blue-500" />
                <span>Nhiệm Vụ Tân Binh Hôm Nay</span>
              </h3>
              
              {/* Daily Motivation quote */}
              <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 p-2.5 rounded-xl text-[10.5px] leading-normal text-blue-600 dark:text-blue-300 mt-2">
                📢 <strong>Động lực:</strong> Hoàn thành nhiệm vụ giúp bạn gia tăng điểm kinh nghiệm nhanh chóng!
              </div>
            </div>

            <div className="space-y-2.5">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start space-x-2.5 cursor-pointer select-none text-[11.5px] hover:opacity-85"
                >
                  <input 
                    type="checkbox" 
                    checked={item.done}
                    onChange={() => {}} // toggled on container click
                    className="mt-0.5 accent-blue-500 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 leading-normal">
                    <span className={`${item.done ? 'line-through text-slate-450 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                      {item.text}
                    </span>
                    {!item.done && (
                      <span className="inline-block text-[8px] bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-300 px-1 rounded ml-1 font-bold font-mono">
                        +{item.xp} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 5. BOTTOM ROW: QUICK LINK & RECOMMENDED LESSON CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Next recommended Lesson Card */}
        {nextCourse && (
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-4 pr-3">
              <img 
                src={nextCourse.thumbnail || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=150&q=80'} 
                alt={nextCourse.title} 
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200/40 dark:border-white/10"
              />
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Bài học đề xuất tiếp theo</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{nextCourse.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{nextCourse.duration || '5 phút'} • Cấp độ: {nextCourse.level || 'Beginner'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/learning')}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Investment simulation preview card */}
        <div 
          onClick={() => navigate('/simulation')}
          className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer group hover-scale"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15 flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Giả Lập Thực Chiến</span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Vào Giả Lập Tích Lũy & Compound</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-normal">Mô phỏng thói quen đầu tư dài hạn với rổ tài sản thực tế ảo.</p>
            </div>
          </div>
          <button className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-xl shadow-md transition-all shrink-0">
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
