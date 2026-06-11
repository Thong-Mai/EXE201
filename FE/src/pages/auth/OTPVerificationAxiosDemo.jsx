import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mail, Clock, KeyRound, CheckCircle2, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function OTPVerificationAxiosDemo() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Input Email, 2: Input OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0 && !verified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer, verified]);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/send-otp`, { email });
      if (response.data.success) {
        setSuccess('Mã OTP đã được gửi đến email của bạn thành công!');
        setStep(2);
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(response.data.message || 'Không thể gửi mã OTP.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối server. Vui lòng thử lại.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit inputs
  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const otpCode = otp.join('');

    if (otpCode.length < 6) {
      setError('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        email,
        otp: otpCode
      });

      if (response.data.success && response.data.verified) {
        setSuccess('Xác minh thành công! Tài khoản của bạn đã được kích hoạt.');
        setVerified(true);
      } else {
        setError(response.data.message || 'Mã OTP không đúng.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Xác thực thất bại. Vui lòng kiểm tra lại.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset demo screen
  const resetDemo = () => {
    setEmail('');
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
    setVerified(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 transition-all duration-300">
        
        {/* Verification Success UI */}
        {verified ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-100 items-center justify-center text-emerald-600 mb-6 border border-emerald-200">
              <ShieldCheck size={36} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Đã Xác Thực!</h1>
            <p className="text-sm text-slate-600 mb-8 max-w-xs mx-auto">
              Email của bạn (<strong className="text-slate-800">{email}</strong>) đã được xác minh thành công trên hệ thống SAVE+.
            </p>
            
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-xs text-left mb-8">
              <span className="font-bold block mb-1">Trạng thái: verified</span>
              Hệ thống đã ghi nhận trạng thái đã xác thực thành công. Bạn có thể tiếp tục truy cập các bài học và tính năng giả lập tài chính.
            </div>

            <button
              onClick={resetDemo}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
            >
              Thử Lại Với Email Khác
            </button>
          </div>
        ) : (
          /* Main Verification Process UI */
          <div>
            {/* Step 1: Input Email */}
            {step === 1 ? (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex w-14 h-14 rounded-full bg-teal-500/10 items-center justify-center text-teal-600 border border-teal-500/20 mb-4">
                    <Mail size={26} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Xác Thực Email OTP</h1>
                  <p className="text-xs text-slate-500 mt-2">
                    Nhập email của bạn để nhận mã xác thực 6 chữ số gửi từ hệ thống SAVE+.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 block">Địa chỉ Email</label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-teal-600/10 hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Gửi Mã OTP</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: Input 6-digit OTP code */
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 transition-all font-semibold"
                  >
                    <ArrowLeft size={14} className="mr-1" /> Quay lại
                  </button>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                    Bước 2/2
                  </span>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex w-14 h-14 rounded-full bg-teal-500/10 items-center justify-center text-teal-600 border border-teal-500/20 mb-4">
                    <KeyRound size={26} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Nhập Mã OTP</h1>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                    Mã xác thực gồm 6 chữ số đã được gửi đến email:
                  </p>
                  <p className="text-sm font-bold text-teal-600 mt-1">{email}</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl text-center">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 text-xs rounded-xl text-center">
                      {success}
                    </div>
                  )}

                  {/* 6 split OTP Input boxes */}
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
                        className="w-12 h-14 bg-slate-50 border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 rounded-xl text-center text-xl font-extrabold text-slate-900 focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Timer & Resend block */}
                  <div className="flex items-center justify-center space-x-1.5 text-xs">
                    <Clock size={13} className="text-slate-400" />
                    {timer > 0 ? (
                      <span className="text-slate-500">
                        Gửi lại mã sau <strong className="text-slate-700">{timer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-teal-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        <span>Gửi lại mã OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-teal-600/10 hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Xác Thực OTP</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
