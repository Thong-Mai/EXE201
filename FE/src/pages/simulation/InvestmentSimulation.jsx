import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  HelpCircle, 
  Sparkles, 
  ArrowUpRight, 
  Coins, 
  AlertTriangle, 
  DollarSign, 
  ChevronRight 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function InvestmentSimulation() {
  const { riskProfile } = useAuth();

  const [monthlyContribution, setMonthlyContribution] = useState(1000000); // 1M VND default
  const [years, setYears] = useState(10); // 10 years default
  const [expectedReturn, setExpectedReturn] = useState(10); // 10% annual yield default
  const [chartData, setChartData] = useState([]);

  // Calculate compound interest and prepare data for Recharts
  useEffect(() => {
    const data = [];
    let principalAccumulated = 0;
    let balanceCompound = 0;
    const monthlyRate = expectedReturn / 100 / 12;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        data.push({
          year: `Năm ${year}`,
          'Tiền gốc gửi': 0,
          'Lãi kép tích lũy': 0
        });
        continue;
      }

      // 12 months compounding per year
      for (let m = 1; m <= 12; m++) {
        principalAccumulated += monthlyContribution;
        balanceCompound = (balanceCompound + monthlyContribution) * (1 + monthlyRate);
      }

      data.push({
        year: `Năm ${year}`,
        'Tiền gốc gửi': Math.round(principalAccumulated),
        'Lãi kép tích lũy': Math.round(balanceCompound)
      });
    }
    setChartData(data);
  }, [monthlyContribution, years, expectedReturn]);

  const finalContribution = monthlyContribution * 12 * years;
  const finalCompound = chartData[chartData.length - 1]?.['Lãi kép tích lũy'] || 0;
  const netEarnings = finalCompound - finalContribution;

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  };

  // Preset button options for user questions
  const setScenario = (presetContribution, presetYears, presetReturn) => {
    setMonthlyContribution(presetContribution);
    setYears(presetYears);
    setExpectedReturn(presetReturn);
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center space-x-2">
          <TrendingUp size={24} className="text-brand-teal" />
          <span>Giả Lập Sức Mạnh Tích Lũy Lãi Kép</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Khám phá cách tiền nhàn rỗi nhỏ hàng tháng sinh sôi qua thời gian khi được tích lũy vào các rổ ETF an toàn.
        </p>
      </div>

      {/* Preset scenario triggers */}
      <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Các câu hỏi thường gặp:</span>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setScenario(500000, 10, 10)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-xs hover:border-brand-teal transition-all"
          >
            🔥 Đầu tư 500k/tháng trong 10 năm?
          </button>
          <button 
            onClick={() => setScenario(2000000, 15, 12)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-xs hover:border-brand-teal transition-all"
          >
            🏠 Tích lũy mua nhà: 2M/tháng trong 15 năm?
          </button>
          <button 
            onClick={() => setScenario(5000000, 20, 15)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-xs hover:border-brand-teal transition-all"
          >
            💰 Nghỉ hưu sớm: 5M/tháng trong 20 năm?
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Sliders Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Thông số thiết lập</h3>
            
            {/* Input 1: Monthly contribution */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Số tiền tiết kiệm/tháng</span>
                <span className="font-bold text-brand-teal dark:text-brand-teallight">{formatVND(monthlyContribution)}</span>
              </div>
              <input 
                type="range"
                min={200000}
                max={20000000}
                step={100000}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>200k</span>
                <span>20M VND</span>
              </div>
            </div>

            {/* Input 2: Return Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Lợi nhuận kỳ vọng / năm</span>
                <span className="font-bold text-brand-teal dark:text-brand-teallight">{expectedReturn}%</span>
              </div>
              <input 
                type="range"
                min={3}
                max={25}
                step={0.5}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>3% (Thấp)</span>
                <span>25% (Cao)</span>
              </div>
            </div>

            {/* Input 3: Horizon */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Thời gian đầu tư tích lũy</span>
                <span className="font-bold text-brand-teal dark:text-brand-teallight">{years} năm</span>
              </div>
              <input 
                type="range"
                min={1}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>1 năm</span>
                <span>40 năm</span>
              </div>
            </div>

            {/* Disclamer Info */}
            <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 flex items-start space-x-1.5">
              <AlertTriangle size={15} className="text-brand-gold shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý:</strong> Hiệu suất đầu tư thực tế phụ thuộc vào thị trường. Đầu tư luôn đi kèm rủi ro biến động giá chứng chỉ quỹ.
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Chart & Scenario Outcomes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Result Cards Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tổng tiền gốc nạp</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1.5">{formatVND(finalContribution)}</h4>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center bg-teal-500/5 dark:bg-teal-900/10">
              <span className="text-[10px] text-brand-teal uppercase font-bold tracking-wider">Lãi kép tăng thêm</span>
              <h4 className="text-sm font-extrabold text-brand-teal dark:text-brand-teallight mt-1.5 font-mono">+{formatVND(netEarnings)}</h4>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center bg-gradient-to-tr from-brand-teal to-brand-green text-white">
              <span className="text-[10px] text-white/80 uppercase font-bold tracking-wider">Tổng tài sản dự kiến</span>
              <h4 className="text-base font-extrabold text-white mt-1.5 font-mono">{formatVND(finalCompound)}</h4>
            </div>
          </div>

          {/* Simulation Graph */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4">Biểu đồ tích lũy qua các năm</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/30" />
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#FFF', 
                      fontSize: '11px' 
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Tiền gốc gửi" stroke="#94A3B8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Lãi kép tích lũy" name="Tổng tài sản (gốc + lãi kép)" stroke="#0D9488" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Scenarios Grid */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Phân tích rủi ro biến động thị trường</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Bad Market */}
              <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 rounded-xl">
                <span className="block text-[10px] text-red-500 font-bold uppercase tracking-wider">Khủng Hoảng (Bear Case)</span>
                <span className="block text-sm font-extrabold text-slate-800 dark:text-white mt-1">{formatVND(finalCompound * 0.75)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Lợi suất trung bình ~4.5%/năm do thị trường suy thoái.</span>
              </div>

              {/* Base Case */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/20 rounded-xl">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thuận Lợi (Base Case)</span>
                <span className="block text-sm font-extrabold text-slate-800 dark:text-white mt-1">{formatVND(finalCompound)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Lợi suất {expectedReturn}%/năm giống kỳ vọng thiết lập.</span>
              </div>

              {/* Bull Case */}
              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 rounded-xl">
                <span className="block text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Bùng Nổ (Bull Case)</span>
                <span className="block text-sm font-extrabold text-slate-800 dark:text-white mt-1">{formatVND(finalCompound * 1.3)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Lợi suất đạt ~14%/năm nhờ chu kỳ phát triển vàng.</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
