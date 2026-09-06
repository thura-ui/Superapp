import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Lock, User, Eye, EyeOff, X } from 'lucide-react';
import { register, login, forgotPasswordApi } from '../lib/authApi';
import { showAlert } from '../lib/customAlert';

interface AccountAuthProps {
  onAuthSuccess: (isLoggedIn: boolean) => void;
  onBack: () => void;
  initialMode?: 'sign-in' | 'sign-up';
  isOpen?: boolean;
}

export default function AccountAuth({ 
  onAuthSuccess, 
  onBack, 
  initialMode = 'sign-in',
  isOpen = true 
}: AccountAuthProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'sign-up');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('09');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🌟 Login မှားယွင်းမှု အကြိမ်အရေအတွက်နှင့် အတိအကျ ၃ ကြိမ်မြောက်မှ ပိတ်မည့် State များ
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // 🌟 Modal ပွင့်နေချိန်တွင် Navbar နှင့် Footer များကို အလိုအလျောက် ပုန်းဖျောက်ပေးမည့် Effect
  useEffect(() => {
    if (!isOpen) return;

    const elementsToHide = document.querySelectorAll<HTMLElement>('header, nav, footer, [data-floating-chat]');
    
    const originalDisplays: string[] = [];
    elementsToHide.forEach((el, index) => {
      originalDisplays[index] = el.style.display;
      el.style.display = 'none';
    });

    return () => {
      elementsToHide.forEach((el, index) => {
        el.style.display = originalDisplays[index] || '';
      });
    };
  }, [isOpen]);

  // 🌟 3 Seconds Countdown ထိန်းချုပ်မည့် Effect (၃ ကြိမ်မြောက်မှသာ အလုပ်လုပ်မည်)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimer) {
      const remaining = Math.ceil((lockoutTimer - Date.now()) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
        timer = setInterval(() => {
          const currentRemaining = Math.ceil((lockoutTimer - Date.now()) / 1000);
          if (currentRemaining <= 0) {
            setLockoutTimer(null);
            setCountdown(0);
            setFailedAttempts(0); // ၃ စက္ကန့် စောင့်ပြီးပါက အကြိမ်အရေအတွက် Reset ပြန်လုပ်ပေးမည်
            clearInterval(timer);
          } else {
            setCountdown(currentRemaining);
          }
        }, 500);
      } else {
        setLockoutTimer(null);
        setCountdown(0);
        setFailedAttempts(0);
      }
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 🌟 စောင့်ဆိုင်းချိန် ၃ စက္ကန့် မပြည့်သေးပါက Submit ခလုတ်နှိပ်မရအောင် တားဆီးမည်
    if (lockoutTimer && Date.now() < lockoutTimer) {
      return;
    }

    // FLOW ၁။ Forgot Password Request
    if (isForgotPassword) {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setLoading(true);
      try {
        const data = await forgotPasswordApi(email.trim().toLowerCase());
        showAlert(data?.message || 'If an account exists with this email, a password reset link has been sent.');
        setIsForgotPassword(false);
      } catch (err: any) {
        setError(err.message || 'Failed to request password reset.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // FLOW ၂။ ပုံမှန် Sign In / Sign Up အပိုင်း
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await register({
          name: userName.trim(),
          email: email.trim().toLowerCase(),
          phone: phoneNumber.trim(),
          password,
          password_confirmation: confirmPassword,
        });
        showAlert('registration-success');
        setIsSignUp(false);
      } else {
        await login({ email: email.trim().toLowerCase(), password });
        // Login အောင်မြင်သွားပါက Failed attempts အားလုံး Reset လုပ်မည်
        setFailedAttempts(0);
        setLockoutTimer(null);
        showAlert('login-success', () => {
          onAuthSuccess(true);
        });
      }
    } catch (err: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      // 🔴 အတိအကျ ၃ ကြိမ်မြောက် မှားမှသာ ၃ စက္ကန့် ခလုတ် ပိတ်ထားမည် 🔴
      if (newAttempts >= 3) {
        const lockDuration = 3000; // 3 seconds
        setLockoutTimer(Date.now() + lockDuration);
        setError('Too many failed attempts (3/3). Please wait 3 seconds.');
      } else {
        // ၁ ကြိမ် သို့မဟုတ် ၂ ကြိမ်မြောက်တွင် စောင့်ခိုင်းခြင်းမရှိဘဲ မည်မျှမှားယွင်းကြောင်း စာသားသာပြသမည်
        setError(`${err.message || 'Authentication failed'} (${newAttempts}/3 attempts)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 🔴 ခလုတ်အား Loading ဖြစ်ချိန် သို့မဟုတ် ၃ ကြိမ်မြောက်အမှားကြောင့် ၃ စက္ကန့် Countdown ပွင့်ချိန်မှသာ Disable လုပ်မည် 🔴
  const isButtonDisabled = loading || (lockoutTimer !== null && Date.now() < lockoutTimer);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onBack}
            className="fixed inset-0 bg-white z-0"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/80 shadow-[0_25px_60px_rgba(15,23,42,0.3)] z-10"
          >
            {/* Header section */}
            <div className="relative flex items-center justify-center pt-6 px-6 pb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 text-center tracking-tight whitespace-nowrap">
                {isForgotPassword ? 'Forgot Password' : isSignUp ? 'Create Account' : 'Welcome'}
              </h1>

              {/* Close (X) Button */}
              <button 
                type="button" 
                onClick={onBack} 
                className="absolute right-5 top-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors border border-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content section */}
            <div className="p-6 pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-200 p-3 rounded-2xl backdrop-blur-md">
                    <p className="text-rose-600 text-xs sm:text-sm font-extrabold text-center uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                {/* Sign Up Fields */}
                {isSignUp && !isForgotPassword && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                    {/* User Name */}
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600" />
                      <input type="text" placeholder="User Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400" required={isSignUp} />
                    </div>
                    
                    {/* Phone Number */}
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600" />
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400" 
                        required={isSignUp} 
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600" />
                  <input type="email" placeholder="Gmail Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400" required />
                </div>

                {/* Password Fields */}
                {!isForgotPassword && (
                  <>
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder={isSignUp ? "New Password" : "Password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full pl-12 pr-12 py-3.5 bg-transparent focus:outline-none font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400 [::-ms-reveal]:hidden [::-ms-clear]:hidden" 
                        required 
                      />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-sky-500 group-focus-within:text-blue-600 cursor-pointer bg-transparent border-none">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {!isSignUp && (
                      <div className="text-right px-1">
                        <button type="button" onClick={() => { setError(null); setIsForgotPassword(true); }} className="text-xs font-black text-sky-600 hover:text-blue-700 uppercase bg-transparent border-none cursor-pointer">Forgot Password?</button>
                      </div>
                    )}

                    {isSignUp && (
                      <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Confirm New Password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          className="w-full pl-12 pr-12 py-3.5 bg-transparent focus:outline-none font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400 [::-ms-reveal]:hidden [::-ms-clear]:hidden" 
                          required 
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Submit Button */}
                <motion.button 
                  whileTap={{ scale: isButtonDisabled ? 1 : 0.98 }} 
                  type="submit" 
                  disabled={isButtonDisabled} 
                  className="w-full relative overflow-hidden py-4 rounded-2xl sm:rounded-3xl shadow-[0_8px_25px_rgba(37,99,235,0.3)] group/btn disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none mt-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 opacity-95 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-white font-extrabold text-base tracking-[0.15em] uppercase">
                    {countdown > 0 
                      ? `Please wait (${countdown}s)` 
                      : loading 
                      ? 'Processing...' 
                      : isForgotPassword 
                      ? 'Send Reset Link' 
                      : isSignUp 
                      ? 'Sign Up' 
                      : 'Sign In'}
                  </span>
                </motion.button>
              </form>

              {/* Switcher */}
              <div className="mt-5 mb-1 text-center">
                <p className="text-slate-600 font-bold text-xs sm:text-sm">
                  {isForgotPassword ? (
                    <>Remember your password?<button type="button" onClick={() => setIsForgotPassword(false)} className="ml-2 font-black text-blue-600 uppercase text-xs cursor-pointer bg-transparent border-none">Back to Sign In</button></>
                  ) : isSignUp ? (
                    <>Already have an account?<button type="button" onClick={() => setIsSignUp(false)} className="ml-2 font-black text-blue-600 uppercase text-xs cursor-pointer bg-transparent border-none">Sign In</button></>
                  ) : (
                    <>New User?<button type="button" onClick={() => setIsSignUp(true)} className="ml-2 font-black text-blue-600 uppercase text-xs cursor-pointer bg-transparent border-none">Create Account</button></>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}