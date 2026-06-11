import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  BarChart, 
  ChevronRight, 
  ChevronLeft,
  Award, 
  Compass, 
  HelpCircle, 
  CheckCircle,
  TrendingUp,
  Sparkles,
  Zap,
  Share2,
  BookOpen,
  DollarSign,
  Heart,
  AlertTriangle,
  Layers,
  ArrowRight,
  User,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileSetup() {
  const { saveOnboarding, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const name = location.state?.name || '';

  const [step, setStep] = useState(1); // 1: Demographics, 2: Personality Quiz, 3: Results
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Demographics Answers
  const [demographics, setDemographics] = useState({
    age: '24',
    income: '15000000',
    savings: '3000000',
    confidence: 'Trung bình',
    goal: 'Tự do tài chính',
    fear: 'Sợ bị lừa đảo',
    preference: 'Trắc nghiệm tương tác & Quizzes'
  });

  // Quiz Answers (scenarios)
  const [quizAnswers, setQuizAnswers] = useState({
    q1: '', // dropped 20%
    q2: '', // 10M windfall
    q3: '', // exciting future
    q4: ''  // risk tolerance
  });

  const [calculatedProfile, setCalculatedProfile] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(63); // Mock readiness score e.g. 63%

  const experienceOptions = [
    { label: 'Cơ bản - Trực quan', desc: 'Thích học bằng hình ảnh, sơ đồ và quiz ngắn.' },
    { label: 'Video bài giảng', desc: 'Thích xem video 3 phút của giảng viên AI.' },
    { label: 'Thực hành giả lập', desc: 'Muốn trực tiếp trải nghiệm ví, gửi thử token.' },
    { label: 'Đọc hiểu chuyên sâu', desc: 'Thích đọc bài viết phân tích chi tiết cơ chế.' }
  ];

  const goalOptions = [
    { label: 'Tự do tài chính', emoji: '🕊️' },
    { label: 'Mua nhà / Tiết kiệm lớn', emoji: '🏡' },
    { label: 'Xây dựng quỹ khẩn cấp', emoji: '🛡️' },
    { label: 'Khám phá Blockchain & Web3', emoji: '🚀' },
    { label: 'Tích lũy tài sản dài hạn', emoji: '📈' }
  ];

  const fearOptions = [
    { label: 'Sợ mất sạch tiền', desc: 'Lo sợ tài khoản sụt giảm mạnh khi thị trường đỏ lửa.' },
    { label: 'Sợ bị scam đa cấp', desc: 'E ngại các dự án tiền mã hóa ma, Ponzi lừa đảo.' },
    { label: 'Thiếu kiến thức nền', desc: 'Không dám đầu tư vì chưa hiểu blockchain là gì.' },
    { label: 'Quên mật khẩu / Mất ví', desc: 'Sợ mất mã bảo mật khóa cá nhân (private key) không khôi phục được.' }
  ];

  const quizQuestions = [
    {
      id: 'q1',
      question: 'Tài sản đầu tư blockchain của bạn đột ngột giảm 20% giá trị trong một ngày. Bạn sẽ làm gì?',
      options: [
        { value: 'sell', label: 'Cắt lỗ ngay lập tức', desc: 'Bán toàn bộ để bảo toàn phần vốn còn lại, không chịu được cảm giác mất tiền.', points: 1 },
        { value: 'hold', label: 'Tắt app và tiếp tục nắm giữ', desc: 'Nhận thức biến động là bản chất của crypto. Đợi thị trường hồi phục dài hạn.', points: 2 },
        { value: 'buy', label: 'Bơm thêm tiền để bắt đáy', desc: 'Hào hứng mua thêm vì giá các đồng coin nền tảng đã rẻ hơn 20%.', points: 3 }
      ]
    },
    {
      id: 'q2',
      question: 'Bạn bất ngờ nhận được khoản tiền thưởng 10 triệu đồng nhàn rỗi. Kế hoạch lý tưởng nhất của bạn là gì?',
      options: [
        { value: 'save', label: 'Gửi tiết kiệm ngân hàng lấy lãi 5%', desc: 'An toàn tuyệt đối, không phải lo nghĩ biến động giá.', points: 1 },
        { value: 'etf', label: 'Trích 50% gửi tiết kiệm, 50% mua rổ tài sản kỹ thuật số', desc: 'Vừa giữ được một khoản chắc chắn, vừa thử nghiệm học đầu tư.', points: 2 },
        { value: 'crypto', label: 'Mua ngay các token công nghệ mới nổi', desc: 'Săn lùng cơ hội nhân 2, nhân 3 tài sản dù có nguy cơ mất trắng.', points: 3 }
      ]
    },
    {
      id: 'q3',
      question: 'Bức tranh tương lai tài chính nào khiến bạn cảm thấy bị thu hút nhất?',
      options: [
        { value: 'secure', label: 'Cuộc sống an bình, không nợ nần', desc: 'Sở hữu sổ tiết kiệm lớn, dòng tiền thu nhập ổn định.', points: 1 },
        { value: 'builder', label: 'Sở hữu danh mục tài sản số đa dạng hóa', desc: 'Có hiểu biết sâu về tài chính cá nhân kết hợp phân bổ blockchain.', points: 2 },
        { value: 'web3', label: 'Trở thành chuyên gia Web3 sành sỏi', desc: 'Tự vận hành node blockchain, khai thác tài chính phi tập trung DeFi.', points: 3 }
      ]
    }
  ];

  const handleDemographicsNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleQuizAnswer = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentQuizStep < quizQuestions.length - 1) {
      setCurrentQuizStep(prev => prev + 1);
    } else {
      calculateProfileResult();
    }
  };

  const calculateProfileResult = () => {
    let score = 0;
    
    // Q1 points
    const q1Ans = quizQuestions[0].options.find(o => o.value === (quizAnswers.q1 || 'hold'));
    score += q1Ans ? q1Ans.points : 2;

    // Q2 points
    const q2Ans = quizQuestions[1].options.find(o => o.value === (quizAnswers.q2 || 'etf'));
    score += q2Ans ? q2Ans.points : 2;

    // Q3 points
    const q3Ans = quizQuestions[2].options.find(o => o.value === (quizAnswers.q3 || 'builder'));
    score += q3Ans ? q3Ans.points : 2;

    // Determine personality
    let profile = 'Balanced Builder';
    if (score <= 3) {
      profile = 'Safe Saver';
    } else if (score === 4 || score === 5) {
      profile = 'Balanced Builder';
    } else if (score === 6) {
      profile = 'Future Explorer';
    } else if (score === 7) {
      profile = 'Blockchain Curious';
    } else {
      profile = 'High Growth Seeker';
    }

    setCalculatedProfile(profile);

    // Calculate dynamic readiness score
    const baseReady = 60 + (score * 2.5);
    setConfidenceScore(Math.min(99, baseReady));

    saveOnboarding({
      ...demographics,
      riskTolerance: profile,
      score
    });

    confetti({
      particleCount: 140,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#7C3AED', '#10B981']
    });

    setStep(3);
  };

  const handleFinishOnboarding = () => {
    // Session is already authenticated from registration, navigate directly to dashboard
    navigate('/');
  };

  const handleShare = () => {
    setCopied(true);
    navigator.clipboard.writeText(`Tôi vừa khám phá tính cách tài chính của mình là "${calculatedProfile}" trên SAVE+! Độ sẵn sàng tài chính: ${confidenceScore}%. Cùng học blockchain và tài chính cá nhân miễn phí nhé!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProfileMeta = (profileName) => {
    switch (profileName) {
      case 'Safe Saver':
        return {
          title: 'Nhà Tích Lũy An Toàn (Safe Saver) 🛡️',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
          gradient: 'from-blue-50/80 to-purple-50/50 border-blue-200/80',
          gaugeColor: 'stroke-blue-500',
          strengths: 'Kỷ luật tài chính cao, ưu tiên bảo vệ nguồn vốn trước mọi cám dỗ.',
          weaknesses: 'Dễ mất đi giá trị tài sản thực tế do lạm phát bào mòn nếu chỉ gửi tiết kiệm truyền thống.',
          description: 'Bạn cực kỳ nhạy cảm với rủi ro và biến động ngắn hạn. SAVE+ gợi ý bạn tập trung vào bài giảng Lãi kép, Lạm phát và tìm hiểu cách quỹ mở Trái phiếu phòng vệ danh mục.',
          alloc: '90% Gửi tích lũy ngân hàng, 10% Chứng chỉ quỹ Trái phiếu.',
          roadmap: ['Tài chính cá nhân', 'Lãi kép & Lạm phát', 'Phòng ngừa lừa đảo tài chính', 'Mô phỏng tích lũy'],
          course: 'Nguyên lý Tiết kiệm lãi kép & Bảo vệ dòng tiền'
        };
      case 'Balanced Builder':
        return {
          title: 'Nhà Kiến Tạo Cân Bằng (Balanced Builder) ⚖️',
          badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
          gradient: 'from-teal-50/80 to-slate-50/50 border-teal-200/80',
          gaugeColor: 'stroke-emerald-500',
          strengths: 'Điềm tĩnh phân bổ vốn hợp lý, kết hợp hài hòa giữa sinh lời và an toàn.',
          weaknesses: 'Dễ do dự khi thị trường biến động mạnh đột ngột, cản trở việc cơ cấu lại tài sản.',
          description: 'Bạn mong muốn dòng vốn tăng trưởng tốt hơn lãi suất ngân hàng nhưng vẫn đảm bảo tính an toàn. Phù hợp nắm giữ danh mục hỗn hợp tài sản truyền thống và tài sản số vốn hóa lớn.',
          alloc: '50% Ví tích lũy an toàn, 40% Quỹ ETF VN30, 10% Crypto đầu ngành (BTC/ETH).',
          roadmap: ['Quản lý chi tiêu', 'Quy tắc vàng 50/30/20', 'Đa dạng hóa rổ tài sản', 'Blockchain cơ bản'],
          course: 'Phân bổ tài sản & Đa dạng hóa danh mục cho người mới'
        };
      case 'Future Explorer':
        return {
          title: 'Nhà Khai Phá Tương Lai (Future Explorer) 🌌',
          badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          gradient: 'from-indigo-50/80 to-slate-50/50 border-indigo-200/80',
          gaugeColor: 'stroke-indigo-500',
          strengths: 'Tinh thần cởi mở học hỏi công nghệ mới, thích trải nghiệm tài chính số.',
          weaknesses: 'Đôi khi hơi nôn nóng mong muốn gia tăng lợi nhuận nhanh chóng.',
          description: 'Bạn tin tưởng vào sự bứt phá của công nghệ số và mong muốn đón đầu các xu hướng mới. Phù hợp phân bổ vốn dài hạn vào các đồng chỉ số công nghệ cốt lõi.',
          alloc: '40% Quỹ cổ phiếu công nghệ, 30% Crypto nền tảng (BTC/ETH), 30% Gửi an toàn.',
          roadmap: ['Tài sản công nghệ', 'Công nghệ Blockchain là gì?', 'Bảo mật ví điện tử', 'DCA tích lũy đều đặn'],
          course: 'Nhập môn Công nghệ số & Sức mạnh của tích lũy dài hạn'
        };
      case 'Blockchain Curious':
        return {
          title: 'Chiến Binh Blockchain (Blockchain Curious) 🚀',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
          gradient: 'from-purple-50/80 to-slate-50/50 border-purple-200/80',
          gaugeColor: 'stroke-purple-500',
          strengths: 'Hiểu biết ban đầu về Web3, nhạy bén công nghệ, thích nghiên cứu dự án.',
          weaknesses: 'Dễ rơi vào bẫy tâm lý sợ bỏ lỡ cơ hội (FOMO) hoặc scam tinh vi trên không gian số.',
          description: 'Bạn vô cùng tò mò về thế giới blockchain, smart contract và crypto. SAVE+ khuyến nghị bạn học thật kỹ bài học Bảo mật khóa cá nhân và Nhận diện scam trước khi thực hành.',
          alloc: '50% Crypto nền tảng (BTC/ETH), 20% Token Web3 tiềm năng, 30% Quỹ an toàn dự phòng.',
          roadmap: ['Cơ chế Blockchain', 'Ví nóng vs Ví lạnh', 'Bẫy bảo mật & Scam Crypto', 'Trải nghiệm DeFi giả lập'],
          course: 'Bảo mật khóa cá nhân & Phòng ngừa lừa đảo không gian Web3'
        };
      case 'High Growth Seeker':
      default:
        return {
          title: 'Nhà Đầu Cơ Bản Lĩnh (High Growth Seeker) 🔥',
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
          gradient: 'from-rose-50/80 to-slate-50/50 border-rose-200/80',
          gaugeColor: 'stroke-rose-500',
          strengths: 'Sức chịu đựng rủi ro cực tốt, tâm lý vững trước các pha sụt giảm 30-40%.',
          weaknesses: 'Có nguy cơ giao dịch quá nhiều hoặc rơi vào tình trạng phân bổ thiếu phòng vệ.',
          description: 'Bạn săn tìm lợi nhuận tối đa và muốn tối ưu hóa nguồn vốn nhàn rỗi thông qua các tài sản tăng trưởng nóng. Bạn cần thiết lập kỷ luật cắt lỗ rõ ràng.',
          alloc: '60% Crypto nền tảng & Web3, 20% Đầu cơ công nghệ cao, 20% Ví khẩn cấp.',
          roadmap: ['Phân tích chu kỳ thị trường', 'Đọc hiểu Whitepaper dự án', 'Quản lý rủi ro đòn bẩy', 'Tâm lý học hành vi đầu tư'],
          course: 'Tâm lý học hành vi trong đầu cơ & Kỷ luật quản lý vốn'
        };
    }
  };

  const meta = getProfileMeta(calculatedProfile || 'Balanced Builder');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-10 px-4 relative overflow-hidden text-slate-800 font-sans">
      {/* Visual background gradient orbs (Neon Blue / Purple theme) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Glassmorphic card container */}
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-2xl relative z-10 fade-in">
        
        {/* Step progress header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black text-slate-500">Khảo sát cá tính tài chính</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-bold">Bước {step} / 3</span>
            <div className="flex space-x-1.5">
              <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-200'}`} />
              <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-200'}`} />
              <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>

        {/* STEP 1: DEMOGRAPHICS INFO */}
        {step === 1 && (
          <form onSubmit={handleDemographicsNext} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                <Compass size={12} />
                <span>Thiết lập hồ sơ tài chính</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                Tìm Hiểu Hồ Sơ Tân Binh Của Bạn 🌌
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Chào mừng đến với hệ thống SAVE+. Hãy cho chúng tôi biết thông tin cơ bản để cá nhân hóa sơ đồ khóa học.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Tuổi</label>
                <input 
                  type="number"
                  value={demographics.age}
                  onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/35"
                  min="18"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mục tiêu ưu tiên</label>
                <select
                  value={demographics.goal}
                  onChange={(e) => setDemographics({ ...demographics, goal: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/35"
                >
                  {goalOptions.map(g => (
                    <option key={g.label} value={g.label} className="bg-white text-slate-800">
                      {g.emoji} {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Thu nhập hàng tháng (VND)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₫</span>
                  <input 
                    type="number"
                    value={demographics.income}
                    onChange={(e) => setDemographics({ ...demographics, income: e.target.value })}
                    placeholder="Ví dụ: 15,000,000"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/35 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mức tiết kiệm mong muốn / tháng</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₫</span>
                  <input 
                    type="number"
                    value={demographics.savings}
                    onChange={(e) => setDemographics({ ...demographics, savings: e.target.value })}
                    placeholder="Ví dụ: 3,000,000"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/35 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Financial fears selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Nỗi sợ lớn nhất khi tìm hiểu đầu tư</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fearOptions.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDemographics({ ...demographics, fear: opt.label })}
                    className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                      demographics.fear === opt.label 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 font-medium' 
                        : 'border-slate-200 bg-slate-50/30 text-slate-500 hover:border-slate-350'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Learning preference selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Hình thức học tập ưa thích</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {experienceOptions.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDemographics({ ...demographics, preference: opt.label })}
                    className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                      demographics.preference === opt.label 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 font-medium' 
                        : 'border-slate-200 bg-slate-50/30 text-slate-500 hover:border-slate-350'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Next trigger */}
            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Vào câu hỏi tình huống</span>
              <ChevronRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: SCENARIO QUIZ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                <Zap size={12} />
                <span>Trắc nghiệm kịch bản tâm lý</span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900">Discover Your Financial Personality 🌌</h1>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Đưa ra quyết định của bạn trước các kịch bản thực tế dưới đây. Trả lời trung thực để có kết quả chính xác nhất.
              </p>
              
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300" 
                  style={{ width: `${((currentQuizStep) / quizQuestions.length) * 100}%` }} 
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest font-mono">Tình huống {currentQuizStep + 1} / {quizQuestions.length}</span>
              <h2 className="text-sm font-bold text-slate-800 leading-relaxed">{quizQuestions[currentQuizStep].question}</h2>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {quizQuestions[currentQuizStep].options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleQuizAnswer(quizQuestions[currentQuizStep].id, opt.value)}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-blue-500 transition-all text-xs cursor-pointer group"
                  >
                    <div className="flex justify-between items-center font-bold text-slate-800 group-hover:text-blue-600">
                      <span>{opt.label}</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-all" />
                    </div>
                    <span className="block text-[10px] text-slate-400 mt-1 leading-normal font-light">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Back button */}
            <button 
              onClick={() => {
                if (currentQuizStep > 0) {
                  setCurrentQuizStep(prev => prev - 1);
                } else {
                  setStep(1);
                }
              }}
              className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700 font-bold transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Quay lại</span>
            </button>
          </div>
        )}

        {/* STEP 3: SHAREABLE DIAGNOSTIC RESULTS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex w-12 h-12 rounded-full bg-emerald-500/10 items-center justify-center text-emerald-600 border border-emerald-500/20 mb-1">
                <CheckCircle size={28} />
              </div>
              <h1 className="text-xl font-black text-slate-900">Nhận diện Tính cách Tài chính!</h1>
              <p className="text-xs text-slate-500 font-light">Báo cáo chẩn đoán mức độ sẵn sàng tài chính & rổ kiến thức phù hợp.</p>
            </div>

            {/* Results shareable badge */}
            <div className={`p-6 rounded-3xl border bg-gradient-to-br ${meta.gradient} shadow-xl relative overflow-hidden`}>
              <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                {/* Confidence meter */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center shrink-0">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" className="stroke-slate-200" strokeWidth="8" fill="transparent" />
                      <circle cx="56" cy="56" r="48" className={meta.gaugeColor} strokeWidth="8" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 48} 
                        strokeDashoffset={2 * Math.PI * 48 * (1 - confidenceScore / 100)} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black font-mono text-slate-800">{confidenceScore}%</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Độ sẵn sàng</span>
                    </div>
                  </div>
                  <span className="mt-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">FCS Score Giai đoạn 1</span>
                </div>

                {/* Profile card detail */}
                <div className="flex-1 space-y-3">
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-black tracking-widest uppercase mb-1.5 ${meta.badgeColor}`}>
                      {calculatedProfile}
                    </span>
                    <h2 className="text-base font-black tracking-tight text-slate-900 leading-snug">
                      {meta.title}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-light">
                    {meta.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] border-t border-slate-200/60 pt-3">
                    <div>
                      <span className="block font-bold text-emerald-600 uppercase tracking-wider text-[9px]">Điểm mạnh:</span>
                      <p className="text-slate-600 mt-0.5 leading-normal">{meta.strengths}</p>
                    </div>
                    <div>
                      <span className="block font-bold text-rose-600 uppercase tracking-wider text-[9px]">Hạn chế:</span>
                      <p className="text-slate-600 mt-0.5 leading-normal">{meta.weaknesses}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Allocation suggested */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-100/60 border border-slate-200/50 space-y-2.5">
                <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">📊 Gợi Ý Cấu Trúc Phân Bổ Vốn Thử Nghiệm</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-light">Tỷ lệ rổ gợi ý:</span>
                  <span className="font-extrabold text-brand-teal font-mono text-[11px]">{meta.alloc}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Roadmap Node list */}
            <div className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-5 space-y-3">
              <div className="flex items-center space-x-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Layers size={14} />
                <span>Lộ trình học tập cá nhân hóa được ghim</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 font-light">
                {meta.roadmap.map((stepName, sIdx) => (
                  <div key={stepName} className="flex items-center text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-white text-slate-700 border border-slate-200">
                      {sIdx + 1}. {stepName}
                    </span>
                    {sIdx < meta.roadmap.length - 1 && <ArrowRight size={12} className="mx-1 text-slate-400" />}
                  </div>
                ))}
              </div>
              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[11px] leading-relaxed text-slate-600">
                📖 <strong>Mở đầu đề xuất:</strong> {meta.course}. Chúng tôi đã đưa bài học này lên hàng đầu trong học trình của bạn.
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={handleShare}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Share2 size={15} />
                <span>{copied ? 'Đã sao chép liên kết!' : 'Chia sẻ chẩn đoán này'}</span>
              </button>

              <button 
                onClick={handleFinishOnboarding}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Nhận lộ trình & Vào Dashboard</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
