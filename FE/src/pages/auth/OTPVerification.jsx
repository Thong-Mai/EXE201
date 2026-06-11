import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Clock, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const email = location.state?.email || '';
  const name = location.state?.name || '';
  const password = location.state?.password || '';
  const idNumber = location.state?.idNumber || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setLoading(true);
    try {
      // Bước 1: Xác minh OTP
      const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.message || 'Mã OTP không hợp lệ.');
        setLoading(false);
        return;
      }

      // Bước 2: Đăng ký tài khoản thật
      await register(name, email, password, idNumber);

      // Bước 3: Chuyển sang setup profile
      navigate('/profile-setup', { state: { email, name } });
    } catch (err) {
      setError('Lỗi xác minh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 text-center fade-in">

        <div className="inline-flex w-14 h-14 rounded-full bg-teal-500/10 items-center justify-center text-brand-teal border border-teal-500/20 mb-4">
          <KeyRound size={26} />
        </div>

        <h1 className="text-xl font-bold text-slate-800 mb-2">Xác thực Email</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-2">
          SAVE+ đã gửi mã OTP <strong>6 chữ số</strong> đến hòm thư
        </p>
        <p className="text-sm font-bold text-brand-teal mb-6">{email}</p>

        {/* Info box */}
        <div className="mb-6 py-2.5 px-3 rounded-xl bg-teal-500/5 border border-teal-500/15 text-[11px] text-brand-teal text-left flex items-start space-x-2">
          <Mail size={13} className="shrink-0 mt-0.5" />
          <span>Kiểm tra hộp thư đến (hoặc Spam) để lấy mã OTP. Mã có hiệu lực <strong>5 phút</strong>.</span>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl text-left">{error}</div>
          )}

          {/* 6 OTP boxes */}
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-13 sm:w-12 h-14 bg-slate-50/50 border-2 border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 rounded-xl text-center text-xl font-extrabold text-slate-900 focus:outline-none transition-all"
              />
            ))}
          </div>

          {/* Resend timer */}
          <div className="flex items-center justify-center space-x-1.5 text-xs">
            <Clock size={13} className="text-slate-400" />
            {timer > 0 ? (
              <span className="text-slate-500">Gửi lại mã sau <strong className="text-slate-700">{timer}s</strong></span>
            ) : (
              <button type="button" onClick={handleResend} disabled={resending}
                className="text-brand-teal font-bold hover:underline flex items-center space-x-1">
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                <span>{resending ? 'Đang gửi...' : 'Gửi lại mã OTP'}</span>
              </button>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-green text-white font-bold text-sm shadow-lg shadow-teal-500/10 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
            {loading
              ? <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckCircle2 size={16} /><span>Xác thực & Kích hoạt tài khoản</span></>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
