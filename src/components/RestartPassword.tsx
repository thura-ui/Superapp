import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { resetPasswordApi } from '../lib/authApi';
import { showAlert } from '../lib/customAlert';

interface RestartPasswordProps {
  onGoToSignIn: () => void;
  onBack: () => void;
}

export default function RestartPassword({ onGoToSignIn, onBack }: RestartPasswordProps) {
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const emailFromUrl = urlParams.get('email');

    if (tokenFromUrl && emailFromUrl) {
      setResetToken(tokenFromUrl);
      setResetEmail(emailFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({
        email: resetEmail.trim().toLowerCase(),
        token: resetToken,
        password: password,
        password_confirmation: confirmPassword
      });

      window.history.replaceState({}, document.title, window.location.pathname);

      // 🔴 CustomAlertHost ရှိ 'restart-password-success' Payload Type အား တိုက်ရိုက် ချိတ်ဆက်ထားသည်
      showAlert('restart-password-success', () => {
        onGoToSignIn();
      });

    } catch (err: any) {
      setError(err.message || 'The reset link has expired or is invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfb_100%)] pb-20 relative overflow-hidden font-['Poppins']">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-teal-400/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto px-4 pt-12 sm:pt-20">
        <div className="rounded-[36px] bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200/70">
            <button type="button" onClick={onBack} className="p-2 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm cursor-pointer">
              <ArrowLeft className="w-6 h-6 text-cyan-600" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 text-center flex-1 pr-10 tracking-tight">
              Restart Password
            </h1>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-200 p-4 rounded-2xl backdrop-blur-md">
                  <p className="text-rose-600 text-sm font-black text-center uppercase tracking-widest">{error}</p>
                </motion.div>
              )}

              {/* New Password */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/75 rounded-3xl border border-white/80" />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password (Min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full pl-16 pr-16 py-5 bg-transparent rounded-3xl focus:outline-none font-bold text-slate-900"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-cyan-600 cursor-pointer bg-transparent border-none">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm New Password */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/75 rounded-3xl border border-white/80" />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative w-full pl-16 pr-16 py-5 bg-transparent rounded-3xl focus:outline-none font-bold text-slate-900"
                  required
                />
              </div>

              <motion.button 
                whileTap={{ scale: loading ? 1 : 0.98 }} 
                type="submit" 
                disabled={loading} 
                className="w-full relative overflow-hidden py-4 rounded-2xl sm:rounded-3xl shadow-[0_8px_25px_rgba(37,99,235,0.35)] group/btn disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none active:scale-95 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 opacity-95 group-hover/btn:opacity-100 transition-opacity" />
                <span className="relative z-10 text-white font-extrabold text-base tracking-[0.15em] uppercase">
                  {loading ? 'Processing...' : 'Reset Password'}
                </span>
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ); 
}