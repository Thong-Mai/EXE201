import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mật khẩu mới, 3: thành công
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi email → chuyển sang bước đặt mật khẩu
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Vui lòng nhập email.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setStep(2);
    } catch {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setStep(3);
    } catch {
      setError('Lỗi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 fade-in">

        <Link to="/login" className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-700 text-xs mb-6 transition-colors font-medium">
          <ArrowLeft size={14} /><span>Quay lại Đăng nhập</span>
        </Link>

        {/* Progress bar */}
        {step < 3 && (
          <div className="flex items-center mb-6">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step >= s ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
                {s < 2 && <div className={`flex-1 h-0.5 mx-1 transition-all ${step > s ? 'bg-brand-teal' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Bước 3: Thành công */}
        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center text-brand-green border border-brand-green/20 mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Đặt lại mật khẩu thành công!</h2>
            <p className="text-sm text-slate-500">Mật khẩu mới của bạn đã được cập nhật. Hãy đăng nhập lại.</p>
            <button onClick={() => navigate('/login')}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer">
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Bước 2: Nhập mật khẩu mới */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Đặt mật khẩu mới</h2>
              <p className="text-xs text-slate-500 mt-1">Nhập mật khẩu mới cho tài khoản <strong>{email}</strong></p>
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">{error}</div>}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={16} /></span>
                  <input type={showPass ? 'text' : 'password'} placeholder="Tối thiểu 6 ký tự" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={16} /></span>
                  <input type={showPass ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
                {loading ? <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Xác nhận đặt lại mật khẩu</span>}
              </button>
            </form>
          </div>
        )}

        {/* Bước 1: Nhập email */}
        {step === 1 && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-green">
                Khôi phục mật khẩu
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Nhập email đã đăng ký để tiến hành đặt lại mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmitEmail} className="space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ Email đăng ký</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={16} /></span>
                  <input type="email" placeholder="email@gmail.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
                {loading ? <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Tiếp tục</span>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
