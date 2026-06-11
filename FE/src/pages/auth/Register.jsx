import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, UserPlus, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAvailable, setEmailAvailable] = useState(null); // null, true, false
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEmailDuplication = async (emailVal) => {
    if (!emailVal) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setEmailError('Định dạng email không hợp lệ.');
      setEmailAvailable(null);
      return;
    }
    
    setEmailChecking(true);
    setEmailError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.exists) {
          setEmailAvailable(false);
          setEmailError('Email này đã được đăng ký trên hệ thống.');
        } else {
          setEmailAvailable(true);
          setEmailError('');
        }
      } else {
        setEmailError(data.message || 'Lỗi kiểm tra email.');
        setEmailAvailable(null);
      }
    } catch (err) {
      setEmailError('Không thể kết nối server.');
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin đăng ký.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (emailAvailable === false) {
      setError('Email này đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.');
      return;
    }
    if (!agree) {
      setError('Bạn cần đồng ý với Điều khoản Sử dụng để tiếp tục.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      
      navigate('/otp-verify', { state: { name, email, password, idNumber: null } });
    } catch (err) {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-green items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-teal-500/20 mb-3">
            S+
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-green">
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-slate-500 mt-1">Bắt đầu hành trình làm chủ tài chính cá nhân miễn phí</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Họ và tên của bạn</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><User size={16} /></span>
              <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ Email</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={16} /></span>
                <input type="email" placeholder="email@gmail.com" value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailAvailable(null);
                    setEmailError('');
                  }}
                  onBlur={(e) => checkEmailDuplication(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
              </div>
              <button
                type="button"
                onClick={() => checkEmailDuplication(email)}
                disabled={emailChecking || !email}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 disabled:opacity-50 cursor-pointer">
                {emailChecking ? 'Đang check...' : 'Kiểm tra'}
              </button>
            </div>
            {emailError && (
              <p className="text-[11px] text-red-500 mt-1">{emailError}</p>
            )}
            {emailAvailable && (
              <p className="text-[11px] text-emerald-600 mt-1">✓ Email hợp lệ và có thể đăng ký.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mật khẩu bảo mật</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={16} /></span>
              <input type="password" placeholder="Tối thiểu 6 ký tự" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Xác nhận mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={16} /></span>
              <input type="password" placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all" />
            </div>
          </div>

          <div className="flex items-start space-x-2 py-1">
            <input type="checkbox" id="agree_terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-brand-teal rounded" />
            <label htmlFor="agree_terms" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
              Tôi đồng ý với <a href="#terms" className="text-brand-teal hover:underline">Điều khoản Dịch vụ</a> và <a href="#privacy" className="text-brand-teal hover:underline">Chính sách Bảo mật</a> của SAVE+.
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
            {loading ? <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={16} /><span>Đăng ký tài khoản</span></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Đã có tài khoản?{' '}<Link to="/login" className="text-brand-teal hover:underline font-bold">Đăng nhập</Link>
        </p>
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
          <ShieldCheck size={12} className="text-brand-green" />
          <span>Thông tin cá nhân được bảo mật an toàn</span>
        </div>
      </div>
    </div>
  );
}
