import { motion } from 'framer-motion';

export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative overflow-hidden">
      
      {/* Background Soft Glow Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-amber-100/50 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-10 relative z-10">
        
        {/* Outer Ring Animation Container */}
        <div className="w-64 h-64 rounded-full flex items-center justify-center relative p-[6px] shadow-[0_15px_45px_rgba(29,78,216,0.15)] bg-white">
          
          {/* 🌟 [GRADIENT SPINNING BORDER]: Logo Color Gradient (Navy Blue - Royal Blue - Sky Blue - Gold) လည်ပတ်နေသည့် အဝိုင်း */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #1e3a8a, #2563eb, #60a5fa, #f59e0b, #1e3a8a)',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          />

          {/* 🌟 [STATIONARY INNER CIRCLE & LOGO]: အလယ်မှ Logo မှာ လုံးဝ မလည်ဘဲ တည်ငြိမ်စွာ ပေါ်နေမည် */}
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative z-10 shadow-inner overflow-hidden p-6">
            
            {/* Reflection Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-blue-50/20 pointer-events-none" />
            
            <img
              src="/Simless-logo.png"
              alt="Simless Logo"
              className="w-full h-full object-contain"
            />
          </div>

        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center gap-2">
          <motion.h1
            className="text-3xl font-black tracking-[0.3em] uppercase bg-gradient-to-r from-blue-900 via-blue-600 to-amber-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Simless
          </motion.h1>
          <motion.p
            className="text-slate-400 font-black text-xs tracking-[0.5em] uppercase"
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