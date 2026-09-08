import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LoadingPage() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative overflow-hidden">
      
      {/* Background Soft Glow Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-amber-100/50 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-8 sm:gap-10 relative z-10 w-full px-4">
        
        {/* Outer Ring Animation Container */}
        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center relative p-[6px] shadow-[0_15px_45px_rgba(29,78,216,0.15)] bg-white">
          
          {/* [GRADIENT SPINNING BORDER] */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #1e3a8a, #2563eb, #60a5fa, #f59e0b, #1e3a8a)',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          />

          {/* [STATIONARY INNER CIRCLE & LOGO] */}
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative z-10 shadow-inner overflow-hidden p-6">
            
            {/* Reflection Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-blue-50/20 pointer-events-none" />
            
            {!imageError ? (
              <img
                src="/Simless-logo.png"
                alt="Simless Logo"
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-black text-blue-900 tracking-wider">SIMLESS</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">eSIM</span>
              </div>
            )}
          </div>

        </div>

        {/* Text Section - 🌟 pl-[0.2em] / pl-[0.3em] ထည့်ပေးထား၍ Mobile ရော Desktop ပါ အလယ် ကွက်တိကျသွားပါမည် */}
        <div className="flex flex-col items-center justify-center text-center w-full">
          <motion.h1
            className="text-2xl sm:text-3xl font-black tracking-[0.2em] sm:tracking-[0.3em] pl-[0.2em] sm:pl-[0.3em] uppercase bg-gradient-to-r from-blue-900 via-blue-600 to-amber-500 bg-clip-text text-transparent block w-full text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Simless
          </motion.h1>
          <motion.p
            className="text-slate-400 font-black text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] pl-[0.3em] sm:pl-[0.5em] uppercase block w-full text-center mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Travel eSIM
          </motion.p>
        </div>

      </div>
    </div>
  );
}