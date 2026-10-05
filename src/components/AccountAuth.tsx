import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Lock, User, Eye, EyeOff, X } from 'lucide-react';
import { register, login, forgotPasswordApi } from '../lib/authApi';
import { showAlert } from '../lib/customAlert';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();

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

  // Email Format Error State
  const [emailError, setEmailError] = useState<string | null>(null);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Email Format Validation Helper
  const validateEmailFormat = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

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
            setFailedAttempts(0);
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
    setEmailError(null);

    if (lockoutTimer && Date.now() < lockoutTimer) {
      return;
    }

    // Email Validation စစ်ဆေးခြင်း
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !validateEmailFormat(trimmedEmail)) {
      const msg = i18n.language?.startsWith('my')
        ? 'အီးမေးလ်ပုံစံ မှားယွင်းနေပါသည်။'
        : t('invalidEmailFormat', 'Invalid email format.');
      setEmailError(msg);
      return;
    }

    if (isForgotPassword) {
      setLoading(true);
      try {
        await forgotPasswordApi(trimmedEmail);
        // 🔴 [UPDATED]: CustomAlertHost ရှိ check-email alert အား ခေါ်ယူပြသခြင်း
        showAlert('check-email');
        setIsForgotPassword(false);
      } catch (err: any) {
        setError(err.message || 'Failed to request password reset.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError(t('passwordsDoNotMatch', 'Passwords do not match'));
        return;
      }

      // Phone Number Validation (၉ လုံးမှ ၁၁ လုံးအထိ စစ်ဆေးခြင်း)
      const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 11) {
        const phoneErrorMsg = i18n.language?.startsWith('my') 
          ? 'သင့်ဖုန်းနံပါတ် မှားယွင်းနေပါသည်။' 
          : t('invalidPhoneNumber', 'Invalid phone number.');
        
        setError(phoneErrorMsg);
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await register({
          name: userName.trim(),
          email: trimmedEmail,
          phone: phoneNumber.trim(),
          password,
          password_confirmation: confirmPassword,
        });
        showAlert('registration-success');
        setIsSignUp(false);
      } else {
        await login({ email: trimmedEmail, password });
        setFailedAttempts(0);
        setLockoutTimer(null);
        showAlert('login-success', () => {
          onAuthSuccess(true);
        });
      }
    } catch (err: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        const lockDuration = 3000;
        setLockoutTimer(Date.now() + lockDuration);
        setError('Too many failed attempts (3/3). Please wait 3 seconds.');
      } else {
        setError(`${err.message || 'Authentication failed'} (${newAttempts}/3 attempts)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
                {isForgotPassword ? t('forgotPassword', 'Forgot Password') : isSignUp ? t('createAccount', 'Create Account') : t('welcome', 'Welcome')}
              </h1>

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
              {/* 🌟 noValidate ထည့်ထားသဖြင့် Browser ရဲ့ မလှမပ Native Tooltip Popup များ ပေါ်လာတော့မည်မဟုတ်ပါ */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-rose-50 border border-rose-200 p-3 rounded-2xl backdrop-blur-md">
                    <p className="text-rose-600 text-xs sm:text-sm font-extrabold text-center uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                {/* Sign Up Fields */}
                {isSignUp && !isForgotPassword && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                    {/* User Name */}
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all overflow-hidden">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600 pointer-events-none z-10" />
                      <input 
                        type="text" 
                        placeholder={t('userName', 'User Name')} 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none border-none outline-none ring-0 focus:ring-0 font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400" 
                      />
                    </div>
                    
                    {/* Phone Number */}
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all overflow-hidden">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600 pointer-events-none z-10" />
                      <input 
                        type="tel" 
                        placeholder={t('phoneNumber', 'Phone Number')} 
                        value={phoneNumber} 
                        maxLength={11}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setPhoneNumber(onlyNums);
                        }} 
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none border-none outline-none ring-0 focus:ring-0 font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400" 
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email Field & Custom Text Box Error */}
                <div className="space-y-1">
                  <div className={`relative group rounded-2xl sm:rounded-3xl bg-slate-50 border ${emailError ? 'border-rose-500' : 'border-slate-200'} focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all overflow-hidden`}>
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600 pointer-events-none z-10" />
                    <input 
                      type="email" 
                      placeholder={t('emailAddress', 'Email Address')} 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) {
                          if (validateEmailFormat(e.target.value.trim())) {
                            setEmailError(null);
                          }
                        }
                      }} 
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none border-none outline-none ring-0 focus:ring-0 font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400" 
                    />
                  </div>
                  {/* 🌟 Text Box အောက်တွင် သပ်သပ်ရပ်ရပ် ပေါ်လာမည့် Error စာသား */}
                  {emailError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-rose-500 text-[11px] font-bold pl-3 pt-0.5">
                      {emailError}
                    </motion.p>
                  )}
                </div>

                {/* Password Fields */}
                {!isForgotPassword && (
                  <>
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all overflow-hidden">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600 pointer-events-none z-10" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder={isSignUp ? t('newPassword', 'New Password') : t('password', 'Password')} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full pl-12 pr-12 py-3.5 bg-transparent focus:outline-none border-none outline-none ring-0 focus:ring-0 font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400 [::-ms-reveal]:hidden [::-ms-clear]:hidden" 
                      />
                      <button type="button" onClick={togglePasswordVisibility} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-sky-500 group-focus-within:text-blue-600 cursor-pointer bg-transparent border-none z-10">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {!isSignUp && (
                      <div className="text-right px-1">
                        <button type="button" onClick={() => { setError(null); setEmailError(null); setIsForgotPassword(true); }} className="text-xs font-black text-sky-600 hover:text-blue-700 uppercase bg-transparent border-none cursor-pointer">{t('forgotPasswordLink', 'Forgot Password?')}</button>
                      </div>
                    )}

                    {isSignUp && (
                      <div className="relative group rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all overflow-hidden">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 group-focus-within:text-blue-600 pointer-events-none z-10" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder={t('confirmNewPassword', 'Confirm New Password')} 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          className="w-full pl-12 pr-12 py-3.5 bg-transparent focus:outline-none border-none outline-none ring-0 focus:ring-0 font-bold text-slate-900 text-sm sm:text-base placeholder:text-slate-400 [::-ms-reveal]:hidden [::-ms-clear]:hidden" 
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
                      ? t('processing', 'Processing...') 
                      : isForgotPassword 
                      ? t('sendResetLink', 'Send Reset Link') 
                      : isSignUp 
                      ? t('signUp', 'Sign Up') 
                      : t('signIn', 'Sign In')}
                  </span>
                </motion.button>
              </form>

              {/* Switcher */}
              <div className="mt-5 mb-1 text-center">
                <p className="text-slate-600 font-bold text-xs sm:text-sm">
                  {isForgotPassword ? (
                    <>{t('rememberPassword', 'Remember your password?')}<button type="button" onClick={() => { setIsForgotPassword(false); setEmailError(null); }} className="ml-2 font-black text-blue-600 uppercase text-xs cursor-pointer bg-transparent border-none">{t('backToSignIn', 'Back to Sign In')}</button></>
                  ) : isSignUp ? (
                    <>{t('alreadyHaveAccount', 'Already have an account?')}<button type="button" onClick={() => { setIsSignUp(false); setEmailError(null); }} className="ml-2 font-black text-blue-600 uppercase text-xs cursor-pointer bg-transparent border-none">{t('signIn', 'Sign In')}</button></>
                  ) : (
                    <>{t('newUser', 'New User?')}<button type="button" onClick={() => { setIsSignUp(true); setEmailError(null); }} className="ml-2 font-black text-blue-600 uppercase text-xs cursor-pointer bg-transparent border-none">{t('createAccount', 'Create Account')}</button></>
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