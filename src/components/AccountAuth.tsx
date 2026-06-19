import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { register, login } from '../lib/authApi';

interface AccountAuthProps {
  onAuthSuccess: (isLoggedIn: boolean) => void;
  onBack: () => void;
  initialMode?: 'sign-in' | 'sign-up';
}

export default function AccountAuth({ onAuthSuccess, onBack, initialMode = 'sign-in' }: AccountAuthProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'sign-up');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        alert('Registration Successful! Please sign in.');
        setIsSignUp(false);
      } else {
        await login({ email: email.trim().toLowerCase(), password });
        alert('Login Successful!');
        onAuthSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#083344] to-[#064e3b] pb-20 relative overflow-hidden">
      {/* Premium Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-teal-400/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
            <ArrowLeft className="w-6 h-6 text-cyan-300" />
          </button>
          <h1 className="text-2xl font-black text-white text-center flex-1 pr-10 tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/20 border border-rose-500/40 p-4 rounded-2xl backdrop-blur-md"
              >
                <p className="text-rose-300 text-sm font-black text-center uppercase tracking-widest">{error}</p>
              </motion.div>
            )}

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 overflow-hidden"
              >
                <div className="relative group">
                  {/* Frosted Glass Input Container */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-focus-within:border-cyan-400/50 transition-colors" />
                  
                  {/* Texture Layer */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 10% 10%, white 0.5px, transparent 1.5px)`,
                      backgroundSize: '40px 40px',
                    }}
                  />

                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300 group-focus-within:text-white z-10 transition-colors" />
                  <input
                    type="text"
                    placeholder="User Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="relative w-full pl-16 pr-6 py-5 bg-transparent rounded-3xl focus:outline-none shadow-2xl font-bold text-white placeholder:text-cyan-100/30 transition-all z-10"
                    required={isSignUp}
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-focus-within:border-cyan-400/50 transition-colors" />
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 30%, white 0.5px, transparent 1.5px)`,
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300 group-focus-within:text-white z-10 transition-colors" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="relative w-full pl-16 pr-6 py-5 bg-transparent rounded-3xl focus:outline-none shadow-2xl font-bold text-white placeholder:text-cyan-100/30 transition-all z-10"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}

            <div className="relative group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-focus-within:border-cyan-400/50 transition-colors" />
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 70% 80%, white 0.5px, transparent 1.5px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300 group-focus-within:text-white z-10 transition-colors" />
              <input
                type="email"
                placeholder="Gmail Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative w-full pl-16 pr-6 py-5 bg-transparent rounded-3xl focus:outline-none shadow-2xl font-bold text-white placeholder:text-cyan-100/30 transition-all z-10"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-focus-within:border-cyan-400/50 transition-colors" />
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 40% 50%, white 0.5px, transparent 1.5px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300 group-focus-within:text-white z-10 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isSignUp ? "New Password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative w-full pl-16 pr-16 py-5 bg-transparent rounded-3xl focus:outline-none shadow-2xl font-bold text-white placeholder:text-cyan-100/30 transition-all z-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-cyan-300 hover:text-white z-20 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-focus-within:border-cyan-400/50 transition-colors" />
                <div 
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 15% 75%, white 0.5px, transparent 1.5px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300 group-focus-within:text-white z-10 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative w-full pl-16 pr-16 py-5 bg-transparent rounded-3xl focus:outline-none shadow-2xl font-bold text-white placeholder:text-cyan-100/30 transition-all z-10"
                  required={isSignUp}
                />
              </div>
            )}


            {/* Submit Button - Crystal Glass Style */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden py-5 rounded-[28px] shadow-2xl group/btn transition-all disabled:opacity-40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-90 group-hover/btn:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
              <span className="relative z-10 text-white font-black text-lg tracking-[0.2em] uppercase">
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </span>
            </motion.button>
          </form>

          {/* Switch between Login and Register */}
          <div className="mt-10 text-center">
            <p className="text-cyan-100/60 font-bold text-sm tracking-tight">
              {isSignUp ? "Already have an account?" : "New to our app?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 font-black text-cyan-300 hover:text-white underline underline-offset-4 decoration-cyan-300/30 transition-all uppercase tracking-widest text-xs"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}