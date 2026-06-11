import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setLoading(true);
    try {
      const assignedRole = await login(email, password);
      if (assignedRole === 'admin' || assignedRole === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-green items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-teal-500/20 mb-3">
            S+
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-green">
            Chào mừng đến với SAVE+
          </h1>
          <p className="text-xs text-slate-500 mt-1">Nền tảng giáo dục tài chính số 1 cho nhà đầu tư trẻ Việt Nam</p>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email tài khoản</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input 
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs text-brand-teal hover:underline font-medium">Quên mật khẩu?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
              />
            </div>
          </div>

          {/* End Role Choice */}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Register Redirect */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-brand-teal hover:underline font-bold">Đăng ký ngay</Link>
        </p>

        {/* Security / Trust Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
          <ShieldCheck size={12} className="text-brand-green" />
          <span>Dữ liệu được mã hóa an toàn 256-bit SSL</span>
        </div>
      </div>
    </div>
  );
}
